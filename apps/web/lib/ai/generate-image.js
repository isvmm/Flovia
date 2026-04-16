const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const GEMINI_MODEL = process.env.NANO_BANANA_MODEL || "gemini-2.0-flash";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Rate limiting queue
const requestQueue = [];
let isProcessing = false;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

/**
 * Sleep helper for backoff
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process queued requests with rate limiting
 */
async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  try {
    while (requestQueue.length > 0) {
      const { resolve, reject, fn } = requestQueue.shift();
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
      // Wait before processing next request
      await sleep(MIN_REQUEST_INTERVAL);
    }
  } finally {
    isProcessing = false;
  }
}

/**
 * Queue a request with rate limiting
 */
function queueRequest(fn) {
  return new Promise((resolve, reject) => {
    requestQueue.push({ resolve, reject, fn });
    processQueue();
  });
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error.status || error.code;
      
      // 429 = Rate Limited, 503 = Service Unavailable
      if (status === 429 || status === 503) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30s
        console.warn(`⚠️  Rate limited (${status}). Retrying in ${backoffMs}ms... (attempt ${attempt + 1}/${maxRetries})`);
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
 * Generate an image using Google Gemini.
 *
 * @param prompt - Description of the image to generate
 * @param options - Optional: model override, temperature
 * @returns Object with text response and base64-encoded image data
 *
 * @example
 *   const result = await generateImage("A cute cat wearing a top hat, digital art");
 *   // result.imageData is a base64 string, result.mimeType is "image/png"
 *   // Use in an <img> tag: src={`data:${result.mimeType};base64,${result.imageData}`}
 *
 * @example
 *   const result = await generateImage("A sunset over mountains", {
 *     model: "gemini-2.0-flash-exp-image-generation",
 *   });
 */
export async function generateImage(
  prompt,
  options = {}
){
  const {
    model = GEMINI_MODEL,
    temperature = 1,
  } = options;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature,
      response_modalities: ["image"],
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
      },
    ],
  };

  console.log("📸 Gemini Image Generation Request:");
  console.log("Model:", model);
  console.log("Prompt:", prompt);
  console.log("Queue size:", requestQueue.length);

  // Queue the request with rate limiting
  return queueRequest(async () => {
    return retryWithBackoff(async () => {
      const response = await fetch(
        `${GEMINI_BASE_URL}/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "x-goog-api-key": GEMINI_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📸 Gemini API Response Status:", response.status);

      if (!response.ok) {
        const error = await response.text();
        const err = new Error(`Gemini API error (${response.status}): ${error}`);
        err.status = response.status;
        console.error("❌ Gemini API Error:", error);
        throw err;
      }

      const data = await response.json();
      console.log("📸 Gemini API Response received");

      if (!data.candidates || data.candidates.length === 0) {
        console.error("❌ No candidates returned from Gemini API");
        throw new Error("Gemini returned no candidates");
      }

      const parts = data.candidates[0].content?.parts || [];
      let text = null;
      let imageData = null;
      let mimeType = null;

      for (const part of parts) {
        if (part.text) {
          text = part.text;
          console.log("📸 Text response:", text);
        }
        if (part.inlineData) {
          imageData = part.inlineData.data;
          mimeType = part.inlineData.mimeType || "image/png";
          console.log("📸 Image generated:", mimeType, `(${imageData.length} bytes)`);
        }
      }

      if (!imageData) {
        console.error("❌ No image data in response. Parts received:", parts);
      }

      return { text, imageData, mimeType };
    });
  });
}
