'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BottomNav from '@/app/components/BottomNav';

export default function AiEditingPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [preview, setPreview] = useState(null);
  const [intensity, setIntensity] = useState(65);
  const [saturation, setSaturation] = useState(50);
  const [contrast, setContrast] = useState(55);

  // Load the uploaded file from sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const file = sessionStorage.getItem('uploadedFile');
      const type = sessionStorage.getItem('contentType');
      
      if (file) {
        const parsedFile = JSON.parse(file);
        setUploadedFile(parsedFile);
        setContentType(type);
        
        // Show preview
        if (parsedFile.base64) {
          setPreview(`data:${parsedFile.mimeType};base64,${parsedFile.base64}`);
        }
      } else {
        // No file selected, redirect back
        router.push('/upload');
      }
    } catch (error) {
      console.error('❌ Error loading file from sessionStorage:', error);
      router.push('/upload');
    }
  }, [router]);

  const analyzeImage = async (file) => {
    if (!file) return;
    
    try {
      setIsProcessing(true);
      console.log('📸 Analyzing uploaded image with Gemini...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: file.base64,
          mimeType: file.mimeType,
          prompt: 'Analyze this image and suggest AI enhancements or edits that could be applied.',
          action: 'enhance',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to analyze image`);
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      console.log('✅ Image analysis complete');
    } catch (error) {
      console.error('❌ Analysis error:', error?.message || String(error));
      setAnalysis(`Error analyzing image: ${error?.message || String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyEdit = async () => {
    if (!uploadedFile || !editPrompt.trim()) {
      alert('Please enter an edit prompt');
      return;
    }

    try {
      setIsProcessing(true);
      console.log('📸 Applying edit with prompt:', editPrompt);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/process-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Image: uploadedFile.base64,
          mimeType: uploadedFile.mimeType,
          prompt: editPrompt,
          action: 'edit',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Failed to apply edit`);
      }

      const data = await response.json();
      alert('✅ Edit applied! Upload ready.');
      router.push('/');
    } catch (error) {
      console.error('❌ Edit error:', error?.message || String(error));
      alert(`Error: ${error?.message || String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

    return (
      <>
        <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans pt-[55px] pb-20">
          {/* Ambient Blur Globs */}
    <div className="absolute top-[10%] left-[-20%] w-80 h-80 bg-fuchsia-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
    <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0" style={{ animationDelay: '2s' }}></div>

    {/* Header */}
    <div className="absolute top-0 left-0 right-0 z-40 pt-2 px-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI Editing</h1>
            <button className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors" onClick={() => router.push('/upload')}>
                <i className="ph-bold ph-arrow-left text-lg"></i>
            </button>
        </div>
    </div>

    <main className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col pt-16 pb-40 px-6">
        
        {/* Gemini AI Panel */}
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <i className="ph-fill ph-sparkles text-white text-xs"></i>
                </div>
                <p className="text-white/60 text-sm font-medium">Powered by Gemini</p>
            </div>

            {/* Editing Prompt */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-6">
                <label className="text-xs text-white/60 font-medium mb-2 block">Edit Prompt</label>
                <textarea 
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm h-24 placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-colors resize-none" 
                  placeholder="Describe how you want to modify your image. Examples:
• Add a cyberpunk neon background
• Change the lighting to sunset
• Add a dramatic sky"
                />
                <p className="text-xs text-white/40 mt-2">Be creative! Gemini can enhance, transform, or completely reimagine your media.</p>
            </div>

            {/* AI Enhance Button */}
            <div className="mb-6">
              <button
                disabled={!uploadedFile || isProcessing}
                onClick={() => analyzeImage(uploadedFile)}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold text-sm shadow-[0_10px_20px_-5px_rgba(34,211,238,0.3)] hover:scale-[0.98] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <i className={`ph-fill ${isProcessing ? 'ph-spinner animate-spin' : 'ph-sparkles'} text-lg`}></i>
                {isProcessing ? 'Analyzing...' : 'AI Enhance'}
              </button>
            </div>

            {/* Style Presets */}
            <div className="mb-6">
                <label className="text-xs text-white/60 font-medium mb-3 block">Popular Edits</label>
                <div className="grid grid-cols-2 gap-2">
                    <button className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all flex items-center gap-2">
                        <i className="ph-fill ph-sun text-cyan-400"></i>
                        Golden Hour
                    </button>
                    <button className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:border-purple-500/50 hover:bg-purple-500/10 transition-all flex items-center gap-2">
                        <i className="ph-fill ph-moon text-purple-400"></i>
                        Night Mode
                    </button>
                    <button className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:border-pink-500/50 hover:bg-pink-500/10 transition-all flex items-center gap-2">
                        <i className="ph-fill ph-palette text-pink-400"></i>
                        Retro Vibe
                    </button>
                    <button className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all flex items-center gap-2">
                        <i className="ph-fill ph-brain text-indigo-400"></i>
                        Surreal
                    </button>
                </div>
            </div>
        </div>

        {/* Adjustment Controls */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-8">
            <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                <i className="ph-fill ph-sliders text-fuchsia-400"></i>
                Fine Tune
            </h3>
            <div className="space-y-5">
                
                {/* Intensity Slider */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-white/60">Edit Intensity</span>
                        <span className="text-xs font-bold text-fuchsia-400">{intensity}%</span>
                    </div>
                    <input type="range" className="editing-slider w-full h-1.5 bg-white/20 rounded-full appearance-none" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} />
                </div>

                {/* Saturation Slider */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-white/60">Saturation</span>
                        <span className="text-xs font-bold text-cyan-400">{saturation}%</span>
                    </div>
                    <input type="range" className="editing-slider w-full h-1.5 bg-white/20 rounded-full appearance-none" value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} />
                </div>

                {/* Contrast Slider */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-xs text-white/60">Contrast</span>
                        <span className="text-xs font-bold text-purple-400">{contrast}%</span>
                    </div>
                    <input type="range" className="editing-slider w-full h-1.5 bg-white/20 rounded-full appearance-none" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
                </div>

            </div>
        </div>

        {/* Preview Section */}
        <div className="mb-8">
            <p className="text-white/60 text-sm font-medium mb-3">Preview</p>
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><defs><pattern id=%22grid%22 width=%2210%22 height=%2210%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 10 0 L 0 0 0 10%22 fill=%22none%22 stroke=%22rgba(255,255,255,0.03)%22 strokeWidth=%220.5%22/></pattern></defs><rect width=%22100%22 height=%22100%22 fill=%22%23000%22/><rect width=%22100%22 height=%22100%22 fill=%22url(%23grid)%22/></svg>')] opacity-50"></div>
                
                {preview ? (
                  <img src={preview} alt="Uploaded media" className="relative z-10 w-full h-full object-cover" />
                ) : (
                  <div className="relative z-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 animate-pulse">
                        <i className="ph-fill ph-sparkles text-2xl"></i>
                    </div>
                    <p className="text-white/60 text-sm font-medium">Loading preview...</p>
                  </div>
                )}
            </div>
            
            {/* Analysis Results */}
            {analysis && (
              <div className="mt-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-3">
                <p className="text-xs font-semibold text-cyan-400 mb-2">AI Analysis:</p>
                <p className="text-xs text-white/70 leading-relaxed">{analysis}</p>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
            <button 
              disabled={isProcessing || !editPrompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-fuchsia-600 rounded-xl font-bold text-base shadow-[0_10px_20px_-5px_rgba(217,70,239,0.3)] hover:scale-[0.98] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={handleApplyEdit}
            >
                <i className={`ph-fill ${isProcessing ? 'ph-spinner animate-spin' : 'ph-check'} text-lg mr-2`}></i>
                {isProcessing ? 'Processing...' : 'Apply & Upload'}
            </button>
            <button 
              disabled={isProcessing}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => router.push('/upload')}
            >
                Back
            </button>
        </div>

    </main>
        </div>
      <BottomNav />
      </>
    );
}
