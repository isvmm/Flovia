"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/app/components/BottomNav";
import UpgradeModal from "@/components/UpgradeModal";
import { useAuth } from "@/hooks/useAuth";
import { apiUrl } from "@/lib/apiUrl";

export default function TextToContentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isDev = process.env.NODE_ENV === "development";
  const [activeTab, setActiveTab] = useState("image");
  const [duration, setDuration] = useState(30);
  const [tempo, setTempo] = useState(128);
  const [imagePrompt, setImagePrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("digital-art");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("9:16");
  const [lightingParam, setLightingParam] = useState("cinematic");
  const [textureParam, setTextureParam] = useState("sharp");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [creditBalance, setCreditBalance] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalData, setModalData] = useState({ required: 0, current: 0 });

  // Music generation state
  const [musicPrompt, setMusicPrompt] = useState("");
  const [musicSystemInstruction, setMusicSystemInstruction] = useState(
    "You are an AI music producer with expertise in electronic music, orchestral composition, and sound design.",
  );
  const [selectedGenre, setSelectedGenre] = useState("synthwave");
  const [selectedMood, setSelectedMood] = useState("energetic");
  const [musicInstruments, setMusicInstruments] = useState("");
  const [musicAtmosphere, setMusicAtmosphere] = useState("");
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState(null);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef(null);

  // Video generation state
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoSystemInstruction, setVideoSystemInstruction] = useState(
    "You are a professional cinematographer. Generate a high-quality 8-second video clip.",
  );
  const [videoFps, setVideoFps] = useState(30);
  const [realismLevel, setRealismLevel] = useState("high");
  const [cameraMovement, setCameraMovement] = useState("");
  const [videoAction, setVideoAction] = useState("");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef(null);

  // Load credit balance on mount
  useEffect(() => {
    if (user?.id) {
      fetchCreditBalance();
    }
  }, [user?.id]);

  const fetchCreditBalance = async () => {
    try {
      const response = await fetch(
        apiUrl(`/api/credits/balance?userId=${user.id}`),
      );
      const data = await response.json();
      setCreditBalance(data.totalCredits || 0);
    } catch (error) {
      console.error("Failed to fetch credit balance:", error);
    }
  };

  const checkCredits = async (contentType) => {
    try {
      const response = await fetch(apiUrl("/api/credits/check"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, contentType }),
      });
      const data = await response.json();

      if (!data.hasEnoughCredits) {
        setModalData({
          required: data.requiredCredits,
          current: data.currentCredits,
        });
        setShowUpgradeModal(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Credit check error:", error);
      return false;
    }
  };

  const deductCredits = async (contentType) => {
    try {
      const response = await fetch(apiUrl("/api/credits/deduct"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, contentType }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Credit deduction failed:", error);
        return false;
      }

      const data = await response.json();
      setCreditBalance(data.newBalance);
      return true;
    } catch (error) {
      console.error("Credit deduction error:", error);
      return false;
    }
  };

  const handleUpgrade = async (tierName) => {
    try {
      const response = await fetch(apiUrl("/api/credits/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, tierName }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.newBalance);
        setShowUpgradeModal(false);
        alert(`✨ ${data.message}`);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to process upgrade");
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  const buildPromptWithSystemInstruction = () => {
    const systemInstruction =
      "You are a professional digital artist with expertise in cinematic photography, color grading, and visual composition.";
    const styleParams = `Style: ${selectedStyle === "digital-art" ? "Digital Art" : selectedStyle === "photorealistic" ? "Photorealistic" : selectedStyle === "cinematic" ? "Cinematic" : "Abstract"}, Lighting: ${lightingParam}, Texture: ${textureParam}, Aspect Ratio: ${selectedAspectRatio}`;
    const fullPrompt = `${systemInstruction}\n\nCreate an image with the following specifications:\n${styleParams}\n\nUser Description: ${imagePrompt}`;
    return fullPrompt;
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      alert("Please describe your vision first");
      return;
    }

    if (user?.id && !isDev) {
      const hasCredits = await checkCredits("image");
      if (!hasCredits) {
        router.push("/refill?from=image");
        return;
      }
    }

    setIsGenerating(true);
    const controller = new AbortController();
    const clientTimeoutMs = 125_000;
    const timeoutId = setTimeout(() => controller.abort(), clientTimeoutMs);

    try {
      const fullPrompt = buildPromptWithSystemInstruction();
      const res = await fetch(apiUrl("/api/generate-image"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
        signal: controller.signal,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(
          payload.error ||
            "Failed to generate image. Check GOOGLE_GENERATIVE_AI_API_KEY and try again.",
        );
        return;
      }

      if (!payload.imageDataUrl) {
        alert(
          payload.error ||
            "No image was returned. Try a different prompt or try again.",
        );
        return;
      }

      if (user?.id && !isDev) {
        const deducted = await deductCredits("image");
        if (!deducted) {
          const balanceResponse = await fetch(
            apiUrl(`/api/credits/balance?userId=${user.id}`),
          );
          const balanceData = await balanceResponse.json();
          if (balanceData.totalCredits <= 0) {
            router.push("/refill?from=image");
            return;
          }
          alert("Failed to deduct credits");
          return;
        }
      }

      setGeneratedImage({
        prompt: imagePrompt,
        style: selectedStyle,
        aspectRatio: selectedAspectRatio,
        lighting: lightingParam,
        texture: textureParam,
        imageUrl: payload.imageDataUrl,
        caption: payload.caption,
      });
    } catch (error) {
      console.error("Generation error:", error);
      const aborted =
        error?.name === "AbortError" ||
        (error instanceof Error &&
          error.message === "The user aborted a request.");
      const msg = aborted
        ? `Request timed out after ${clientTimeoutMs / 1000}s (no response from the server). If you are on a hosted preview, the platform may limit how long an API route can run.`
        : error instanceof Error
          ? error.message
          : `Failed to generate image (${String(error)})`;
      alert(
        `${msg}\n\nTip: DevTools → Network → POST "generate-image" — check status, time, and response body.`,
      );
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };

  const buildMusicPromptWithSystemInstruction = () => {
    const fullPrompt = `${musicSystemInstruction}\n\nCreate music with these specifications:\nGenre: ${selectedGenre}\nMood: ${selectedMood}\nTempo: ${tempo} BPM\nDuration: ${duration} seconds\nInstruments: ${musicInstruments || "Auto-select"}\nAtmosphere: ${musicAtmosphere || "Default"}\nSeamless Loop: Enabled\n\nUser Description: ${musicPrompt}`;
    return fullPrompt;
  };

  const handleGenerateMusic = async () => {
    if (!musicPrompt.trim()) {
      alert("Please describe your music vision first");
      return;
    }

    if (user?.id && !isDev) {
      const hasCredits = await checkCredits("music");
      if (!hasCredits) {
        router.push("/refill?from=music");
        return;
      }
    }

    setIsGeneratingMusic(true);
    const controller = new AbortController();
    const clientTimeoutMs = 185_000;
    const timeoutId = setTimeout(() => controller.abort(), clientTimeoutMs);

    try {
      const fullPrompt = buildMusicPromptWithSystemInstruction();
      const res = await fetch(apiUrl("/api/generate-music"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
        signal: controller.signal,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(
          payload.error ||
            "Failed to generate music. Check GOOGLE_GENERATIVE_AI_API_KEY and Lyria access.",
        );
        return;
      }

      if (!payload.audioDataUrl) {
        alert(
          payload.error ||
            "No audio was returned. Try a different prompt or try again.",
        );
        return;
      }

      if (user?.id && !isDev) {
        const deducted = await deductCredits("music");
        if (!deducted) {
          const balanceResponse = await fetch(
            apiUrl(`/api/credits/balance?userId=${user.id}`),
          );
          const balanceData = await balanceResponse.json();
          if (balanceData.totalCredits <= 0) {
            router.push("/refill?from=music");
            return;
          }
          alert("Failed to deduct credits");
          return;
        }
      }

      setGeneratedMusic({
        prompt: musicPrompt,
        genre: selectedGenre,
        mood: selectedMood,
        tempo: tempo,
        duration: payload.clipDurationSeconds ?? duration,
        instruments: musicInstruments || "Electronic",
        atmosphere: musicAtmosphere || "Cinematic",
        audioUrl: payload.audioDataUrl,
        caption: payload.caption,
        model: payload.model || "lyria-3-clip-preview",
        waveform: Array.from({ length: 40 }, () => Math.random() * 100),
      });
    } catch (error) {
      console.error("Music generation error:", error);
      const aborted =
        error?.name === "AbortError" ||
        (error instanceof Error &&
          error.message === "The user aborted a request.");
      const msg = aborted
        ? `Request timed out after ${clientTimeoutMs / 1000}s. Try again or increase server limits.`
        : error instanceof Error
          ? error.message
          : `Failed to generate music (${String(error)})`;
      alert(
        `${msg}\n\nTip: DevTools → Network → POST "generate-music" — status and response.`,
      );
    } finally {
      clearTimeout(timeoutId);
      setIsGeneratingMusic(false);
    }
  };

  const toggleMusicPlayback = () => {
    const el = audioRef.current;
    if (el) {
      if (el.paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
      return;
    }
    setIsPlayingMusic(!isPlayingMusic);
  };

  const buildVideoPromptWithSystemInstruction = () => {
    const fullPrompt = `${videoSystemInstruction}\n\nCreate video with these specifications:\nFPS: ${videoFps}\nRealism Level: ${realismLevel}\nCamera Movement: ${cameraMovement || "Dynamic"}\nDuration: 8 seconds\nAction: ${videoAction || "Default"}\n\nUser Description: ${videoPrompt}`;
    return fullPrompt;
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim()) {
      alert("Please describe your video vision first");
      return;
    }

    if (user?.id && !isDev) {
      const hasCredits = await checkCredits("video");
      if (!hasCredits) {
        router.push("/refill?from=video");
        return;
      }
    }

    setIsGeneratingVideo(true);
    const controller = new AbortController();
    const clientTimeoutMs = 330_000;
    const timeoutId = setTimeout(() => controller.abort(), clientTimeoutMs);

    try {
      const fullPrompt = buildVideoPromptWithSystemInstruction();
      const res = await fetch(apiUrl("/api/generate-video"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: "9:16",
        }),
        signal: controller.signal,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(
          payload.error ||
            "Failed to generate video. Check GOOGLE_GENERATIVE_AI_API_KEY and Veo access.",
        );
        return;
      }

      if (!payload.videoDataUrl) {
        alert(
          payload.error ||
            "No video was returned. Try a different prompt or try again.",
        );
        return;
      }

      if (user?.id && !isDev) {
        const deducted = await deductCredits("video");
        if (!deducted) {
          const balanceResponse = await fetch(
            apiUrl(`/api/credits/balance?userId=${user.id}`),
          );
          const balanceData = await balanceResponse.json();
          if (balanceData.totalCredits <= 0) {
            router.push("/refill?from=video");
            return;
          }
          alert("Failed to deduct credits");
          return;
        }
      }

      setGeneratedVideo({
        prompt: videoPrompt,
        fps: videoFps,
        realism: realismLevel,
        cameraMovement: cameraMovement || "Dynamic Pan",
        action: videoAction || "Cinematic",
        duration: 8,
        videoUrl: payload.videoDataUrl,
        model: payload.model || "veo-3.1-lite-generate-preview",
      });
    } catch (error) {
      console.error("Video generation error:", error);
      const aborted =
        error?.name === "AbortError" ||
        (error instanceof Error &&
          error.message === "The user aborted a request.");
      const msg = aborted
        ? `Request timed out after ${clientTimeoutMs / 1000}s. Video generation can take several minutes; use a host with a long API timeout (e.g. Vercel Pro) or run locally with next dev.`
        : error instanceof Error
          ? error.message
          : `Failed to generate video (${String(error)})`;
      alert(
        `${msg}\n\nTip: DevTools → Network → POST "generate-video" — status and response body.`,
      );
    } finally {
      clearTimeout(timeoutId);
      setIsGeneratingVideo(false);
    }
  };

  const toggleVideoPlayback = () => {
    const el = videoRef.current;
    if (el) {
      if (el.paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
      return;
    }
    setIsPlayingVideo(!isPlayingVideo);
  };

  return (
    <>
      <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans pt-[55px] pb-20">
        {/* Ambient Blur Globs */}
        <div className="absolute top-[10%] left-[-20%] w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
        <div
          className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-40 pt-2 px-6 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Create AI Content</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                <i className="ph-fill ph-lightning text-cyan-400 text-sm"></i>
                <span className="text-sm font-bold text-white">
                  {creditBalance}
                </span>
              </div>
              <button
                className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={() => router.push("/creative-studio")}
              >
                <i className="ph-bold ph-x text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <main className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col pt-16 pb-40 px-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-white/10">
            <button
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${activeTab === "image" ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white" : "text-white/60 hover:text-white"}`}
              onClick={() => switchTab("image")}
            >
              <i className="ph-fill ph-image text-lg mr-1.5"></i>
              Image
            </button>
            <button
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${activeTab === "music" ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white" : "text-white/60 hover:text-white"}`}
              onClick={() => switchTab("music")}
            >
              <i className="ph-fill ph-music-notes text-lg mr-1.5"></i>
              Music
            </button>
            <button
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${activeTab === "video" ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white" : "text-white/60 hover:text-white"}`}
              onClick={() => switchTab("video")}
            >
              <i className="ph-fill ph-video text-lg mr-1.5"></i>
              Video
            </button>
          </div>

          {/* Image Tab Content */}
          <div
            id="image-tab"
            className={`space-y-6 ${activeTab !== "image" ? "hidden" : ""}`}
          >
            {/* System Instruction Info */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl p-3 flex gap-2">
              <div className="text-violet-400 text-sm mt-0.5">
                <i className="ph-fill ph-info"></i>
              </div>
              <div className="text-[11px] text-white/70 leading-relaxed">
                <span className="font-semibold text-white">
                  System Instruction Active:
                </span>{" "}
                Prompts are enhanced with "You are a professional digital
                artist" to ensure high-quality, artistic outputs.
              </div>
            </div>

            {/* Detailed Prompt Input */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Describe Your Vision
              </label>
              <textarea
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-sm h-32 placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                placeholder="Be as detailed as possible. Examples: A futuristic neon city at night with flying cars, glowing signs, rain-soaked streets"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
              ></textarea>
              <p className="text-[10px] text-white/40 mt-1">
                Tip: Include details about mood, colors, composition, and
                atmosphere for best results
              </p>
            </div>

            {/* Lighting Parameter */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Lighting Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["cinematic", "ambient", "dramatic", "soft"].map((light) => (
                  <button
                    key={light}
                    onClick={() => setLightingParam(light)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      lightingParam === light
                        ? "bg-violet-500/30 border border-violet-500/80 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {light.charAt(0).toUpperCase() + light.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Texture Parameter */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Texture Detail
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["smooth", "textured", "sharp"].map((tex) => (
                  <button
                    key={tex}
                    onClick={() => setTextureParam(tex)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                      textureParam === tex
                        ? "bg-violet-500/30 border border-violet-500/80 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {tex.charAt(0).toUpperCase() + tex.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Style Selection */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Art Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedStyle("digital-art")}
                  className={`py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
                    selectedStyle === "digital-art"
                      ? "bg-violet-500/20 border border-violet-500/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <div className="text-sm mb-1">🎨</div>
                  Digital Art
                </button>
                <button
                  onClick={() => setSelectedStyle("photorealistic")}
                  className={`py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
                    selectedStyle === "photorealistic"
                      ? "bg-violet-500/20 border border-violet-500/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <div className="text-sm mb-1">📷</div>
                  Photorealistic
                </button>
                <button
                  onClick={() => setSelectedStyle("cinematic")}
                  className={`py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
                    selectedStyle === "cinematic"
                      ? "bg-violet-500/20 border border-violet-500/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <div className="text-sm mb-1">🎬</div>
                  Cinematic
                </button>
                <button
                  onClick={() => setSelectedStyle("abstract")}
                  className={`py-3 px-3 rounded-lg text-xs font-semibold transition-all ${
                    selectedStyle === "abstract"
                      ? "bg-violet-500/20 border border-violet-500/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  <div className="text-sm mb-1">✨</div>
                  Abstract
                </button>
              </div>
            </div>

            {/* Image Aspect Ratio */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Aspect Ratio (Social Media)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedAspectRatio("1:1")}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedAspectRatio === "1:1"
                      ? "bg-violet-500/20 border border-violet-500/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  Square
                  <div className="text-xs">1:1</div>
                </button>
                <button
                  onClick={() => setSelectedAspectRatio("9:16")}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedAspectRatio === "9:16"
                      ? "bg-violet-500/20 border border-violet-500/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  Portrait
                  <div className="text-xs">9:16</div>
                </button>
                <button
                  onClick={() => setSelectedAspectRatio("16:9")}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedAspectRatio === "16:9"
                      ? "bg-violet-500/20 border border-violet-500/50 text-white"
                      : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                  }`}
                >
                  Landscape
                  <div className="text-xs">16:9</div>
                </button>
              </div>
            </div>

            {/* Generated Image Preview - Cinematic 9:16 */}
            <div>
              <p className="text-xs text-white/60 font-medium mb-3">
                Preview (9:16 Social Media Format)
              </p>
              <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/40 via-black to-purple-900/40 border-2 border-violet-500/30 shadow-[inset_0_0_40px_rgba(139,92,246,0.2)] flex items-center justify-center">
                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-20"></div>

                {/* Grid pattern background */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><defs><pattern id=%22grid%22 width=%2210%22 height=%2210%22 patternUnits=%22userSpaceOnUse%22><path d=%22M 10 0 L 0 0 0 10%22 fill=%22none%22 stroke=%22rgba(139,92,246,0.1)%22 strokeWidth=%220.5%22/></pattern></defs><rect width=%22100%22 height=%22100%22 fill=%22%230a0a0a%22/><rect width=%22100%22 height=%22100%22 fill=%22url(%23grid)%22/></svg>')] opacity-30"></div>

                {/* Neon glow elements */}
                <div
                  className="absolute top-10 right-10 w-40 h-40 bg-violet-500/30 rounded-full blur-3xl pointer-events-none animate-pulse"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div
                  className="absolute bottom-20 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"
                  style={{ animationDuration: "4s", animationDelay: "1s" }}
                ></div>

                {/* Content */}
                {generatedImage ? (
                  <div className="relative z-10 w-full h-full flex flex-col items-stretch justify-end min-h-0">
                    {generatedImage.imageUrl ? (
                      <img
                        src={generatedImage.imageUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : null}
                    <div className="relative z-10 w-full flex flex-col items-center justify-end text-center p-4 pt-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                      <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                        <span className="inline-block px-3 py-1 bg-violet-500/40 border border-violet-400/60 rounded-full text-[10px] font-bold text-violet-200 backdrop-blur-sm">
                          {generatedImage.aspectRatio}
                        </span>
                        <span className="inline-block px-3 py-1 bg-cyan-500/30 border border-cyan-400/50 rounded-full text-[10px] font-bold text-cyan-200 backdrop-blur-sm">
                          {generatedImage.lighting}
                        </span>
                      </div>
                      <p className="text-white/90 text-xs font-medium leading-relaxed max-w-[95%] line-clamp-4">
                        {generatedImage.prompt}
                      </p>
                      <p className="text-white/50 text-[10px] mt-2">
                        Gemini · {user?.id ? "credits applied" : "preview only"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-3 animate-pulse shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                      <i className="ph-fill ph-sparkles text-2xl text-white"></i>
                    </div>
                    <p className="text-white/70 text-xs font-semibold">
                      Ready to create
                    </p>
                    <p className="text-white/40 text-[10px] mt-1">
                      Configure your prompt and parameters
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateImage}
              disabled={isGenerating || !imagePrompt.trim()}
              className={`w-full py-4 font-bold text-base rounded-xl transition-all shadow-[0_10px_30px_-5px_rgba(139,92,246,0.4)] ${
                isGenerating || !imagePrompt.trim()
                  ? "bg-gradient-to-r from-violet-600/50 to-purple-600/50 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 hover:scale-[0.98] active:scale-95"
              }`}
            >
              <i
                className={`ph-fill ${isGenerating ? "ph-spinner animate-spin" : "ph-sparkles"} text-lg mr-2`}
              ></i>
              {isGenerating ? "Generating..." : "Generate Image"}
            </button>
          </div>

          {/* Music Tab Content */}
          <div
            id="music-tab"
            className={`space-y-6 ${activeTab !== "music" ? "hidden" : ""}`}
          >
            {/* Music System Instruction */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/30 rounded-xl p-3 flex gap-2">
              <div className="text-indigo-400 text-sm mt-0.5">
                <i className="ph-fill ph-info"></i>
              </div>
              <div className="text-[11px] text-white/70 leading-relaxed">
                <span className="font-semibold text-white">
                  System Instruction Active:
                </span>{" "}
                "You are an AI music producer" - all prompts are enhanced for
                professional-quality composition.
              </div>
            </div>

            {/* Music Prompt & Parameters */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Detailed Music Description
              </label>
              <textarea
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-sm h-32 placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors resize-none"
                placeholder="Describe your music vision with style parameters. Include: mood, instruments, atmosphere, style details"
                value={musicPrompt}
                onChange={(e) => setMusicPrompt(e.target.value)}
              ></textarea>
              <p className="text-[10px] text-white/40 mt-1">
                Include: mood, instruments, atmosphere, style details
              </p>
            </div>

            {/* Instruments Parameter */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Instruments & Elements
              </label>
              <input
                type="text"
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="e.g., Synthesizer, Drums, Violin, Pad, Bass, Strings..."
                value={musicInstruments}
                onChange={(e) => setMusicInstruments(e.target.value)}
              />
            </div>

            {/* Atmosphere Parameter */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Atmosphere & Texture
              </label>
              <input
                type="text"
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 transition-colors"
                placeholder="e.g., Cinematic, Dark, Bright, Ethereal, Groovy, Ambient..."
                value={musicAtmosphere}
                onChange={(e) => setMusicAtmosphere(e.target.value)}
              />
            </div>

            {/* Music Genre Selection */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Genre
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["synthwave", "lofi", "ambient", "cinematic"].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      selectedGenre === genre
                        ? "bg-indigo-500/30 border border-indigo-500/80 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {genre === "synthwave"
                      ? "🌆 Synthwave"
                      : genre === "lofi"
                        ? "☕ Lo-Fi"
                        : genre === "ambient"
                          ? "🌫️ Ambient"
                          : "🎬 Cinematic"}
                  </button>
                ))}
              </div>
            </div>

            {/* Music Mood Selection */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {["energetic", "calm", "emotional", "dark"].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`py-1.5 px-3 rounded-full text-xs font-semibold transition-all border ${
                      selectedMood === mood
                        ? "bg-indigo-500/30 border-indigo-500/80 text-white"
                        : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {mood === "energetic"
                      ? "⚡"
                      : mood === "calm"
                        ? "🌙"
                        : mood === "emotional"
                          ? "❤️"
                          : "🌑"}{" "}
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Tempo Controls */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-white/60 font-medium">
                    Duration (30s for seamless loop)
                  </span>
                  <span className="text-xs font-bold text-indigo-400">
                    {duration}s
                  </span>
                </div>
                <input
                  type="range"
                  className="w-full h-1.5 bg-white/20 rounded-full appearance-none"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min="15"
                  max="60"
                />
                <p className="text-[10px] text-white/40 mt-1">
                  Sent in the prompt; Lyria 3 Clip returns ~30s high-quality
                  clips.
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-white/60 font-medium">
                    Tempo (BPM)
                  </span>
                  <span className="text-xs font-bold text-indigo-400">
                    {tempo} BPM
                  </span>
                </div>
                <input
                  type="range"
                  className="w-full h-1.5 bg-white/20 rounded-full appearance-none"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  min="60"
                  max="180"
                />
              </div>
            </div>

            {generatedMusic?.audioUrl ? (
              <audio
                ref={audioRef}
                src={generatedMusic.audioUrl}
                onPlay={() => setIsPlayingMusic(true)}
                onPause={() => setIsPlayingMusic(false)}
                onEnded={() => setIsPlayingMusic(false)}
                preload="auto"
                className="hidden"
                aria-hidden
              />
            ) : null}

            {/* Waveform Visualization */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs text-white/60 font-medium">
                  Audio Waveform Preview
                </p>
                {generatedMusic && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMusicPlayback}
                      className="p-2 bg-indigo-500/30 border border-indigo-500/50 rounded-lg hover:bg-indigo-500/40 transition-all"
                    >
                      <i
                        className={`ph-fill ${isPlayingMusic ? "ph-pause" : "ph-play"} text-white text-sm`}
                      ></i>
                    </button>
                    <span className="text-[10px] text-white/60 font-semibold">
                      {generatedMusic.duration}s
                    </span>
                  </div>
                )}
              </div>
              <div className="relative w-full h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                {/* Animated glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent ${isPlayingMusic ? "animate-pulse" : ""}`}
                ></div>

                {/* Waveform bars */}
                <div className="relative z-10 flex items-center justify-center gap-0.5 h-full px-4">
                  {generatedMusic
                    ? generatedMusic.waveform.map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-sm transition-all"
                          style={{
                            height: `${height}%`,
                            opacity: isPlayingMusic ? 1 : 0.7,
                            animation: isPlayingMusic
                              ? `pulse 0.5s ease-in-out infinite`
                              : "none",
                            animationDelay: `${i * 0.05}s`,
                          }}
                        ></div>
                      ))
                    : Array.from({ length: 40 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-indigo-500/40 rounded-sm"
                          style={{ height: "20%" }}
                        ></div>
                      ))}
                </div>
              </div>
              {generatedMusic && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-white/40">
                    Seamless Loop Enabled
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-400">
                    {generatedMusic.tempo} BPM • {generatedMusic.genre}
                  </span>
                </div>
              )}
            </div>

            {/* Generated Music Details */}
            {generatedMusic && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5"></div>
                  <div>
                    <p className="text-xs text-white/60">Genre</p>
                    <p className="text-sm font-semibold text-white capitalize">
                      {generatedMusic.genre}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5"></div>
                  <div>
                    <p className="text-xs text-white/60">Instruments</p>
                    <p className="text-sm font-semibold text-white">
                      {generatedMusic.instruments}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5"></div>
                  <div>
                    <p className="text-xs text-white/60">Atmosphere</p>
                    <p className="text-sm font-semibold text-white">
                      {generatedMusic.atmosphere}
                    </p>
                  </div>
                </div>
                {generatedMusic.caption ? (
                  <div className="flex items-start gap-3 pt-1 border-t border-white/10">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0"></div>
                    <div>
                      <p className="text-xs text-white/60">Model note</p>
                      <p className="text-sm text-white/90 leading-snug">
                        {generatedMusic.caption}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            <button
              onClick={handleGenerateMusic}
              disabled={isGeneratingMusic || !musicPrompt.trim()}
              className={`w-full py-4 font-bold text-base rounded-xl transition-all shadow-[0_10px_30px_-5px_rgba(99,102,241,0.4)] ${
                isGeneratingMusic || !musicPrompt.trim()
                  ? "bg-gradient-to-r from-indigo-600/50 to-blue-600/50 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[0.98] active:scale-95"
              }`}
            >
              <i
                className={`ph-fill ${isGeneratingMusic ? "ph-spinner animate-spin" : "ph-music-notes"} text-lg mr-2`}
              ></i>
              {isGeneratingMusic
                ? "Generating Music..."
                : "Generate Music (Lyria-3-Clip)"}
            </button>
          </div>

          {/* Video Tab Content */}
          <div
            id="video-tab"
            className={`space-y-6 ${activeTab !== "video" ? "hidden" : ""}`}
          >
            {/* Video System Instruction */}
            <div className="bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/30 rounded-xl p-3 flex gap-2">
              <div className="text-rose-400 text-sm mt-0.5">
                <i className="ph-fill ph-info"></i>
              </div>
              <div className="text-[11px] text-white/70 leading-relaxed">
                <span className="font-semibold text-white">
                  System Instruction Active:
                </span>{" "}
                "You are a professional cinematographer" - all prompts generate
                high-quality, cinematic 8-second video clips.
              </div>
            </div>

            {/* Video Prompt Input */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Detailed Video Description
              </label>
              <textarea
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-sm h-32 placeholder:text-white/30 focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
                placeholder="Describe your video with cinematic detail. Include details about camera movement, lighting, mood, and action."
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
              ></textarea>
              <p className="text-[10px] text-white/40 mt-1">
                Include: composition, lighting, movement, emotional tone
              </p>
            </div>

            {/* Camera Movement Input */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Camera Movement & Motion
              </label>
              <input
                type="text"
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-rose-500/50 transition-colors"
                placeholder="e.g., Smooth pan, Cinematic dolly, Handheld, Drone sweep, Slow zoom"
                value={cameraMovement}
                onChange={(e) => setCameraMovement(e.target.value)}
              />
            </div>

            {/* Video Action Input */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Action & Activity
              </label>
              <input
                type="text"
                className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-rose-500/50 transition-colors"
                placeholder="e.g., High-speed action, Gentle motion, Explosion, Transition effect"
                value={videoAction}
                onChange={(e) => setVideoAction(e.target.value)}
              />
            </div>

            {/* Realism Level */}
            <div>
              <label className="text-xs text-white/60 font-medium mb-3 block">
                Realism Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["photorealistic", "high", "stylized"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setRealismLevel(level)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                      realismLevel === level
                        ? "bg-rose-500/30 border border-rose-500/80 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:border-white/30"
                    }`}
                  >
                    {level === "photorealistic"
                      ? "📷"
                      : level === "high"
                        ? "🎬"
                        : "✨"}{" "}
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* FPS Control */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-white/60 font-medium">
                  Frame Rate (FPS)
                </span>
                <span className="text-xs font-bold text-rose-400">
                  {videoFps} FPS
                </span>
              </div>
              <input
                type="range"
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none"
                value={videoFps}
                onChange={(e) => setVideoFps(Number(e.target.value))}
                min="24"
                max="60"
                step="6"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>24 FPS (cinematic)</span>
                <span>60 FPS (smooth)</span>
              </div>
            </div>

            {/* Video Preview Player */}
            <div>
              <p className="text-xs text-white/60 font-medium mb-3">
                Video Preview (8-Second Clip)
              </p>
              <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden bg-gradient-to-br from-rose-900/40 via-black to-orange-900/40 border-2 border-rose-500/30 shadow-[inset_0_0_40px_rgba(244,63,94,0.2)] flex items-center justify-center">
                {/* Cinematic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none z-20"></div>

                {/* Film grain effect */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 result=%22noise%22 /><feColorMatrix in=%22noise%22 type=%22saturate%22 values=%220.3%22/></filter><rect width=%22100%22 height=%22100%22 fill=%22%230a0a0a%22 filter=%22url(%23noise)%22/></svg>')] opacity-20"></div>

                {/* Neon glow elements */}
                <div
                  className="absolute top-10 right-10 w-40 h-40 bg-rose-500/30 rounded-full blur-3xl pointer-events-none animate-pulse"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div
                  className="absolute bottom-20 left-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"
                  style={{ animationDuration: "4s", animationDelay: "1s" }}
                ></div>

                {/* Play button / Video content */}
                {generatedVideo ? (
                  <div className="relative z-10 w-full h-full min-h-0">
                    {generatedVideo.videoUrl ? (
                      <>
                        <video
                          ref={videoRef}
                          src={generatedVideo.videoUrl}
                          className="absolute inset-0 z-10 w-full h-full object-cover"
                          playsInline
                          controls
                          onPlay={() => setIsPlayingVideo(true)}
                          onPause={() => setIsPlayingVideo(false)}
                        />
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-3 pt-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="inline-block px-3 py-1 bg-rose-500/40 border border-rose-400/60 rounded-full text-[10px] font-bold text-rose-200 backdrop-blur-sm">
                              {generatedVideo.fps} FPS
                            </span>
                            <span className="inline-block px-3 py-1 bg-orange-500/30 border border-orange-400/50 rounded-full text-[10px] font-bold text-orange-200 backdrop-blur-sm">
                              {generatedVideo.realism}
                            </span>
                          </div>
                          <p className="text-white/90 text-xs font-medium leading-relaxed line-clamp-2 text-center px-1">
                            {generatedVideo.prompt}
                          </p>
                          <p className="text-white/50 text-[10px] text-center mt-1">
                            {generatedVideo.model ||
                              "veo-3.1-lite-generate-preview"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={toggleVideoPlayback}
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_40px_rgba(244,63,94,0.6)] z-30"
                          >
                            <i
                              className={`ph-fill ${isPlayingVideo ? "ph-pause" : "ph-play"} text-2xl text-white ml-1`}
                            ></i>
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="inline-block px-3 py-1 bg-rose-500/40 border border-rose-400/60 rounded-full text-[10px] font-bold text-rose-200 backdrop-blur-sm">
                            {generatedVideo.fps} FPS
                          </span>
                          <span className="inline-block px-3 py-1 bg-orange-500/30 border border-orange-400/50 rounded-full text-[10px] font-bold text-orange-200 backdrop-blur-sm">
                            {generatedVideo.realism}
                          </span>
                        </div>
                        <p className="text-white/90 text-xs font-medium leading-relaxed max-w-[90%] mb-2">
                          {generatedVideo.prompt}
                        </p>
                        <p className="text-white/50 text-[10px]">
                          8-second clip •{" "}
                          {generatedVideo.model || "veo-3.1-lite"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative z-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center mx-auto mb-3 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.6)]">
                      <i className="ph-fill ph-film-strip text-2xl text-white"></i>
                    </div>
                    <p className="text-white/70 text-xs font-semibold">
                      Ready to create
                    </p>
                    <p className="text-white/40 text-[10px] mt-1">
                      Describe your cinematic vision
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Video Details */}
            {generatedVideo && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5"></div>
                  <div>
                    <p className="text-xs text-white/60">Camera Movement</p>
                    <p className="text-sm font-semibold text-white">
                      {generatedVideo.cameraMovement}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5"></div>
                  <div>
                    <p className="text-xs text-white/60">Action</p>
                    <p className="text-sm font-semibold text-white">
                      {generatedVideo.action}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400 mt-1.5"></div>
                  <div>
                    <p className="text-xs text-white/60">Video Specs</p>
                    <p className="text-sm font-semibold text-white">
                      {generatedVideo.fps} FPS • {generatedVideo.duration}s •{" "}
                      {generatedVideo.realism}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateVideo}
              disabled={isGeneratingVideo || !videoPrompt.trim()}
              className={`w-full py-4 font-bold text-base rounded-xl transition-all shadow-[0_10px_30px_-5px_rgba(244,63,94,0.4)] ${
                isGeneratingVideo || !videoPrompt.trim()
                  ? "bg-gradient-to-r from-rose-600/50 to-orange-600/50 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-r from-rose-600 to-orange-600 hover:scale-[0.98] active:scale-95"
              }`}
            >
              <i
                className={`ph-fill ${isGeneratingVideo ? "ph-spinner animate-spin" : "ph-video"} text-lg mr-2`}
              ></i>
              {isGeneratingVideo
                ? "Generating Video..."
                : "Generate Video (veo-3.1-lite)"}
            </button>
          </div>
        </main>
      </div>
      <BottomNav />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredCredits={modalData.required}
        currentCredits={modalData.current}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
