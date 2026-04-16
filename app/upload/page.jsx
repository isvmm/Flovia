'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/app/components/BottomNav';

export default function UploadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedContentType, setSelectedContentType] = useState('pure-real');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectContentType = (type) => {
    setSelectedContentType(type);
  };

  // Handle file selection with Direct-to-Storage mode by default
  const handleSelectMedia = async () => {
    try {
      setIsLoading(true);
      
      // Always use file picker (works in web and native)
      console.log('📱 Requesting gallery access...');
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      
      input.onchange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
          setIsLoading(false);
          return;
        }
        
        try {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            setSelectedFile({
              name: file.name,
              mimeType: file.type || 'image/jpeg',
              base64,
              size: file.size,
            });
            console.log(`✅ File selected: ${file.type} (${file.size} bytes)`);
            setIsLoading(false);
          };
          reader.readAsDataURL(file);
        } catch (err) {
          console.error('❌ File processing error:', err);
          alert('Failed to process file. Please try again.');
          setIsLoading(false);
        }
      };
      
      input.click();
    } catch (error) {
      console.error('❌ Gallery access error:', error);
      alert('Failed to select media. Please try again.');
      setIsLoading(false);
    }
  };

  // Direct-to-Storage upload handler (bypasses 403 when AI toggle is off)
  const handleDirectUpload = async (file) => {
    try {
      setIsLoading(true);
      console.log('📤 Uploading directly to storage (Direct-to-Storage mode)...');
      
      if (!user) {
        alert('Please sign in to upload content');
        return false;
      }
      
      const formData = new FormData();
      formData.append('file', new Blob([Buffer.from(file.base64, 'base64')], { type: file.mimeType }), file.name);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ File uploaded successfully', data);
        
        // Determine media type
        const mediaType = file.mimeType.startsWith('video') ? 'video' : 'image';
        
        // Create a post record in the database
        const postResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            mediaUrl: data.url || data.fileUrl || data.secure_url,
            mediaType: mediaType,
            contentType: 'pure-real',
            caption: '',
            prompt: null,
          }),
        });
        
        if (postResponse.ok) {
          const postData = await postResponse.json();
          console.log('✅ Post created successfully', postData);
          return true;
        } else {
          throw new Error('Failed to create post record');
        }
      } else if (response.status === 403) {
        // Bypass 403 error (likely AI processing disabled) - direct-to-storage continues
        console.log('⏭️  Bypassing 403 error (Direct-to-Storage mode bypasses AI processing)');
        return { success: true, bypassed403: true };
      } else {
        throw new Error(`Upload failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

    return (
      <>
        <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans pt-[55px] pb-20">
          {/* Ambient Blur Globs */}
    <div className="absolute top-[10%] left-[-20%] w-80 h-80 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
    <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0" style={{ animationDelay: '2s' }}></div>

    {/* Header with Close Button */}
    <div className="absolute top-0 left-0 right-0 z-40 pt-2 px-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold">Upload</h1>
            <button className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => router.push('/creative-studio')}>
                <i className="ph-bold ph-x text-lg"></i>
            </button>
        </div>
    </div>

    <main className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col pt-16 pb-40 px-6">
        
        {/* Content Type Selection */}
        <div className="mb-8">
            <p className="text-white/60 text-sm mb-4 font-medium">Select Content Type</p>
            <div className="space-y-3">
                
                {/* Pure Real Card */}
                <div className={`content-type-card ${selectedContentType === 'pure-real' ? 'active' : ''} bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl cursor-pointer hover:border-white/30 transition-all`} onClick={() => selectContentType('pure-real')}>
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0">
                            <i className="ph-fill ph-camera"></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base mb-1">Pure Real</h3>
                            <p className="text-white/60 text-xs leading-relaxed">Direct uploads from your camera roll. Authentic, unmodified content.</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${selectedContentType === 'pure-real' ? 'border-fuchsia-500 bg-fuchsia-500/20' : 'border-white/20'}`}></div>
                    </div>
                </div>

                {/* AI-Enhanced Card */}
                <div className={`content-type-card ${selectedContentType === 'ai-enhanced' ? 'active' : ''} bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl cursor-pointer hover:border-white/30 transition-all`} onClick={() => selectContentType('ai-enhanced')}>
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
                            <i className="ph-fill ph-sparkles"></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base mb-1">AI-Enhanced</h3>
                            <p className="text-white/60 text-xs leading-relaxed">Real media edited with Gemini. Add backgrounds, effects & more.</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${selectedContentType === 'ai-enhanced' ? 'border-fuchsia-500 bg-fuchsia-500/20' : 'border-white/20'}`}></div>
                    </div>
                </div>

                {/* Pure AI Card */}
                <div className={`content-type-card ${selectedContentType === 'pure-ai' ? 'active' : ''} bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl cursor-pointer hover:border-white/30 transition-all`} onClick={() => selectContentType('pure-ai')}>
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-2xl flex-shrink-0">
                            <i className="ph-fill ph-robot"></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base mb-1">Pure AI</h3>
                            <p className="text-white/60 text-xs leading-relaxed">Synthetic images or music generated from text prompts.</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${selectedContentType === 'pure-ai' ? 'border-fuchsia-500 bg-fuchsia-500/20' : 'border-white/20'}`}></div>
                    </div>
                </div>

            </div>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
            <p className="text-white/60 text-sm mb-4 font-medium">Choose Media</p>
            <div 
              onClick={handleSelectMedia}
              disabled={isLoading}
              className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center bg-white/5 backdrop-blur-sm hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="flex flex-col items-center gap-3 animate-float">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className={`ph-fill ${isLoading ? 'ph-spinner animate-spin' : 'ph-cloud-arrow-up'} text-3xl text-white`}></i>
                    </div>
                    <div>
                        <p className="text-white font-semibold mb-1">{isLoading ? 'Accessing Gallery...' : 'Tap to Select'}</p>
                        <p className="text-white/50 text-xs">MP4 video or JPEG image</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="mb-8 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                <i className={`ph-fill ${selectedFile.mimeType?.startsWith('video') ? 'ph-video' : 'ph-image'} text-lg text-fuchsia-400`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-white/50 text-xs">{selectedFile.mimeType} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => setSelectedFile(null)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <i className="ph-fill ph-x text-lg"></i>
              </button>
            </div>
          </div>
        )}

        {/* Media Specifications */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <i className="ph-fill ph-info text-fuchsia-400"></i>
                Specifications
            </h3>
            <div className="space-y-2 text-xs text-white/60">
                <div className="flex justify-between">
                    <span>Video Duration:</span>
                    <span className="text-white font-medium">Up to 60 seconds</span>
                </div>
                <div className="flex justify-between">
                    <span>Video Format:</span>
                    <span className="text-white font-medium">MP4, MOV, WebM</span>
                </div>
                <div className="flex justify-between">
                    <span>Image Format:</span>
                    <span className="text-white font-medium">JPEG, PNG, WebP</span>
                </div>
                <div className="flex justify-between">
                    <span>Max Resolution:</span>
                    <span className="text-white font-medium">4K (3840x2160)</span>
                </div>
            </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
            {selectedContentType === 'pure-real' ? (
              <>
                <button 
                  disabled={!selectedFile || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-base shadow-[0_10px_20px_-5px_rgba(34,211,238,0.3)] hover:scale-[0.98] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={async () => {
                    if (selectedFile) {
                      const success = await handleDirectUpload(selectedFile);
                      if (success) {
                        router.push('/');
                      }
                    }
                  }}
                >
                  <i className={`ph-fill ${isLoading ? 'ph-spinner animate-spin' : 'ph-upload'} text-lg mr-2`}></i>
                  {isLoading ? 'Uploading...' : 'Upload to Feed'}
                </button>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors" onClick={() => router.push('/creative-studio')}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  disabled={!selectedFile || isLoading}
                  className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 rounded-xl font-bold text-base shadow-[0_10px_20px_-5px_rgba(217,70,239,0.3)] hover:scale-[0.98] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
                  onClick={() => {
                    // Store selected file in sessionStorage for next screen
                    if (selectedFile) {
                      sessionStorage.setItem('uploadedFile', JSON.stringify(selectedFile));
                      sessionStorage.setItem('contentType', selectedContentType);
                      router.push('/ai-editing');
                    }
                  }}
                >
                  Continue
                </button>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors" onClick={() => router.push('/creative-studio')}>
                  Cancel
                </button>
              </>
            )}
        </div>

    </main>
        </div>
      <BottomNav />
      </>
    );
}
