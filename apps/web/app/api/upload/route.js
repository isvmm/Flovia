import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_SIZE = 100 * 1024 * 1024; // 100MB limit
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB for videos

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-m4v'];

// Increase payload limit for uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

function validateFileType(mimeType) {
  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  
  if (!isImage && !isVideo) {
    return { valid: false, type: null, error: `Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WebP, MP4, WebM` };
  }
  
  return { valid: true, type: isImage ? 'image' : 'video', error: null };
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    console.log('[Upload API] Incoming request - Content-Type:', contentType);

    let file;
    let fileMimeType = '';
    let fileSize = 0;

    if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await req.formData();
        file = formData.get('file');

        if (!file) {
          console.warn('[Upload API] No file in multipart data');
          return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!(file instanceof File)) {
          console.error('[Upload API] File is not a File object:', typeof file);
          return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
        }

        fileSize = file.size;
        fileMimeType = file.type || 'application/octet-stream';

        // Validate file type
        const validation = validateFileType(fileMimeType);
        if (!validation.valid) {
          console.warn('[Upload API] Invalid file type:', fileMimeType, validation.error);
          return NextResponse.json({ error: validation.error }, { status: 415 });
        }

        // Validate file size based on type
        const maxSize = validation.type === 'video' ? MAX_VIDEO_SIZE : MAX_SIZE;
        if (fileSize > maxSize) {
          const maxMB = maxSize / 1024 / 1024;
          console.warn(`[Upload API] File too large: ${fileSize} bytes (max: ${maxSize} bytes)`);
          return NextResponse.json({ 
            error: `File too large (max ${maxMB}MB)`,
            maxSizeMB: maxMB,
            fileSizeMB: (fileSize / 1024 / 1024).toFixed(2)
          }, { status: 413 });
        }

        console.log(`[Upload API] File validated - Type: ${fileMimeType}, Size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

      } catch (formError) {
        console.error('[Upload API] FormData parsing error:', formError);
        return NextResponse.json({ 
          error: 'Failed to parse upload data',
          details: formError instanceof Error ? formError.message : 'Unknown error'
        }, { status: 400 });
      }
    } else {
      console.error('[Upload API] Invalid content type:', contentType);
      return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[Upload API] Supabase Config Check:', {
      hasUrl: !!supabaseUrl,
      urlLength: supabaseUrl?.length || 0,
      hasServiceKey: !!supabaseServiceKey,
      keyLength: supabaseServiceKey?.length || 0,
    });

    // Handle missing Supabase config gracefully
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn('[Upload API] ⚠️ Supabase not configured - USING LOCAL FALLBACK');
      return NextResponse.json({
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', // Mock URL
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        secure_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        isLocalFallback: true,
        message: 'Supabase not configured. Using placeholder for demo.'
      }, { status: 200 });
    }

    console.log('[Upload API] Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[Upload API] Supabase client initialized successfully');

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const filename = `${timestamp}-${random}.${ext}`;
    const bucket = 'uploads';

    // Upload to Supabase Storage
    console.log(`[Upload API] Uploading to Supabase Storage: ${bucket}/${filename}`);
    
    console.log('[Upload API] Converting file to buffer...');
    const fileBuffer = await file.arrayBuffer();
    console.log('[Upload API] File buffer created:', {
      bufferSize: fileBuffer.byteLength,
      originalSize: fileSize,
      match: fileBuffer.byteLength === fileSize
    });

    let uploadData = null;
    let uploadError = null;

    // Try to upload
    console.log('[Upload API] 🚀 Starting upload with Supabase...');
    console.log('[Upload API] Upload parameters:', {
      bucket,
      filename,
      contentType: fileMimeType,
      bufferSize: fileBuffer.byteLength,
      upsert: false
    });

    try {
      console.log('[Upload API] Calling supabase.storage.from(bucket).upload()...');
      const uploadResult = await supabase.storage
        .from(bucket)
        .upload(filename, fileBuffer, {
          contentType: fileMimeType,
          upsert: false
        });

      uploadData = uploadResult.data;
      uploadError = uploadResult.error;

      console.log('[Upload API] Supabase storage call returned:', {
        hasData: !!uploadData,
        hasError: !!uploadError,
        resultKeys: Object.keys(uploadResult || {})
      });
    } catch (supabaseCallError) {
      console.error('[Upload API] ❌ Exception during Supabase storage call:', {
        message: supabaseCallError?.message,
        name: supabaseCallError?.name,
        stack: supabaseCallError?.stack,
        fullError: JSON.stringify(supabaseCallError, Object.getOwnPropertyNames(supabaseCallError), 2)
      });
      throw supabaseCallError;
    }

    console.log('[Upload API] Upload result:', {
      hasData: !!uploadData,
      hasError: !!uploadError,
      errorMessage: uploadError?.message,
      errorFull: uploadError ? JSON.stringify(uploadError, null, 2) : null,
      dataPath: uploadData?.path,
      bucket,
      filename,
      fileSizeBytes: fileSize
    });

    // If bucket doesn't exist or upload failed, try to create bucket and retry
    if (uploadError) {
      console.error('[Upload API] ❌ INITIAL UPLOAD FAILED - DETAILED DIAGNOSIS:', {
        step: 'Initial upload to Supabase Storage',
        message: uploadError?.message,
        status: uploadError?.status,
        statusCode: uploadError?.statusCode,
        errorName: uploadError?.name,
        fullErrorObject: JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError), 2),
        allErrorKeys: Object.keys(uploadError || {}),
        bucket,
        filename,
        fileType: fileMimeType,
        fileSize: fileSize,
        fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
        supabaseUrlConfigured: !!supabaseUrl,
        serviceKeyConfigured: !!supabaseServiceKey,
        timestamp: new Date().toISOString()
      });
      
      console.log('[Upload API] Attempting to create bucket as error recovery...');
      
      // Try to create the bucket with basic options
      const createBucketResult = await supabase.storage.createBucket(bucket, {
        public: true,
      });

      const createError = createBucketResult.error;
      
      console.log('[Upload API] Bucket creation attempt:', {
        error: createError?.message,
        errorFull: createError ? JSON.stringify(createError, null, 2) : null,
        status: createError?.status
      });

      if (createError) {
        // Bucket might already exist, ignore this error and retry upload
        console.log('[Upload API] Bucket create error (may already exist):', createError?.message);
      } else {
        console.log('[Upload API] Bucket created successfully');
      }

      // Retry the upload
      console.log('[Upload API] Retrying upload after bucket setup...');
      const retryResult = await supabase.storage
        .from(bucket)
        .upload(filename, fileBuffer, {
          contentType: fileMimeType,
          upsert: false
        });

      uploadData = retryResult.data;
      uploadError = retryResult.error;

      console.log('[Upload API] Retry result:', {
        hasData: !!uploadData,
        hasError: !!uploadError,
        errorMessage: uploadError?.message,
        errorFull: uploadError ? JSON.stringify(uploadError, null, 2) : null,
        dataPath: uploadData?.path
      });

      if (uploadError) {
        console.error('[Upload API] ❌ RETRY UPLOAD FAILED - DETAILED ERROR REPORT:', {
          step: 'Retry upload attempt',
          message: uploadError?.message,
          status: uploadError?.status,
          statusCode: uploadError?.statusCode,
          errorName: uploadError?.name,
          errorConstructor: uploadError?.constructor?.name,
          fullErrorObject: JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError), 2),
          allErrorKeys: Object.keys(uploadError || {}),
          // Check if it's a permission error
          isPossiblePermissionError: uploadError?.message?.toLowerCase().includes('permission') || uploadError?.message?.toLowerCase().includes('forbidden'),
          // Check if it's an auth error
          isPossibleAuthError: uploadError?.message?.toLowerCase().includes('auth') || uploadError?.message?.toLowerCase().includes('unauthorized'),
          // Check if bucket still doesn't exist
          isPossibleBucketError: uploadError?.message?.toLowerCase().includes('bucket') || uploadError?.message?.toLowerCase().includes('not found'),
          bucket,
          filename,
          fileType: fileMimeType,
          fileSize: fileSize,
          fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
          timestamp: new Date().toISOString()
        });
        
        console.error('[Upload API] 🔴 RETURNING 500 ERROR - Summary:', {
          primaryError: uploadError?.message,
          bucket,
          filename,
          failurePoint: 'Retry upload call to Supabase Storage',
          possibleCauses: [
            'Bucket permissions not set to public',
            'Service role key lacks storage write permissions',
            'Supabase authentication failed',
            'Bucket auto-creation failed',
            'File type or size restrictions on bucket'
          ]
        });

        return NextResponse.json({ 
          error: 'Upload failed', 
          details: uploadError?.message || 'Unknown error',
          bucket,
          filename,
          errorStatus: uploadError?.status,
          errorStatusCode: uploadError?.statusCode,
          failurePoint: 'retry-upload'
        }, { status: 500 });
      }
    }

    // Get public URL
    if (!uploadData) {
      console.error('[Upload API] ❌ No upload data returned');
      return NextResponse.json({ error: 'Upload data not returned' }, { status: 500 });
    }

    console.log('[Upload API] Upload data received:', {
      path: uploadData.path,
      id: uploadData.id,
      uploadDataKeys: Object.keys(uploadData)
    });

    const urlResult = supabase.storage.from(bucket).getPublicUrl(uploadData.path);
    const publicUrl = urlResult.data?.publicUrl;

    if (!publicUrl) {
      console.error('[Upload API] Failed to get public URL:', {
        urlResult,
        uploadData
      });
      return NextResponse.json({ 
        error: 'Failed to generate public URL',
        details: 'Could not create public URL from uploaded file'
      }, { status: 500 });
    }

    console.log('[Upload API] ✅ Upload Success:', { 
      path: uploadData.path, 
      url: publicUrl,
      bucket,
      filename,
      fileSizeBytes: fileSize,
      fileType: fileMimeType
    });
    return NextResponse.json({ 
      url: publicUrl,
      fileUrl: publicUrl,
      secure_url: publicUrl,
      path: uploadData.path
    }, { status: 200 });

  } catch (error) {
    console.error('[Upload API] ❌ Unhandled error - Full Stack:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      errorFull: error instanceof Error ? error : JSON.stringify(error, null, 2),
      errorStringified: JSON.stringify(error, Object.getOwnPropertyNames(error), 2),
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.name,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
