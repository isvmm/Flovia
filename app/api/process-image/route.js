import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Rate limiting with exponential backoff
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // 429 = Rate Limited, 503 = Service Unavailable
      if (error.status === 429 || error.status === 503) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
        console.warn(`⚠️  Rate limited (${error.status}). Retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(backoffMs);
        continue;
      }
      
      // Don't retry other errors
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Process an uploaded image with Gemini AI
 * Accepts base64-encoded image data and returns AI analysis/enhancement
 * Includes rate limiting and exponential backoff for quota errors (429)
 */
export async function POST(request) {
  try {
    const { base64Image, mimeType, prompt, action } = await request.json();

    if (!base64Image || !mimeType) {
      return NextResponse.json(
        { error: 'Missing base64Image or mimeType' },
        { status: 400 }
      );
    }

    console.log(`📸 Processing image with Gemini: ${action || 'analyze'}`);
    console.log(`   MIME Type: ${mimeType}`);
    console.log(`   Image size: ${base64Image.length} bytes`);

    // Build request body with inline image data
    const requestBody = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType, // Must be image/jpeg, image/png, image/gif, or image/webp
                data: base64Image, // base64-encoded image data (without data:image/jpeg;base64, prefix)
              },
            },
            {
              text:
                prompt ||
                `${action === 'enhance' ? 'Enhance this image with AI. Suggest improvements, describe what AI effects could be applied.' : 'Analyze this image and provide detailed insights.'}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 1,
        response_modalities: ['text'],
      },
    };

    console.log('📸 Sending request to Gemini API...');

    // Retry with exponential backoff on rate limit errors
    const data = await retryWithBackoff(async () => {
      const response = await fetch(
        `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'x-goog-api-key': GEMINI_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log(`📸 Gemini API Response Status: ${response.status}`);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Gemini API Error:', error);
        const err = new Error(`Gemini API error (${response.status}): ${error}`);
        err.status = response.status;
        throw err;
      }

      return response.json();
    });

    console.log('📸 Gemini API Response received');

    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No candidates returned from Gemini API');
      return NextResponse.json(
        { error: 'Gemini returned no candidates' },
        { status: 500 }
      );
    }

    const parts = data.candidates[0].content?.parts || [];
    let analysisText = null;

    for (const part of parts) {
      if (part.text) {
        analysisText = part.text;
        console.log('📸 Analysis text:', analysisText.substring(0, 100) + '...');
        break;
      }
    }

    if (!analysisText) {
      console.error('❌ No text response from Gemini');
      return NextResponse.json(
        { error: 'No analysis text returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: analysisText,
      mimeType,
      imageSize: base64Image.length,
    });
  } catch (error) {
    console.error('❌ Image processing error:', error);
    
    // Handle rate limiting gracefully
    if (error.message?.includes('429')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again in a few moments.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
