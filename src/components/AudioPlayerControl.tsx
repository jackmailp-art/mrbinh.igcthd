import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Headphones,
  FileText,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  Upload,
  Link as LinkIcon,
  Music,
  CheckCircle2,
  Lock,
  Radio,
  Sliders,
  Sparkles
} from "lucide-react";

export interface AudioPlayerControlProps {
  audioScript?: string;
  audioTitle?: string;
  audioSpeakerInfo?: string;
  audioUrl?: string;
  maxPlays?: number;
  isTeacher?: boolean;
  isSubmitted?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
  highlightedEvidence?: string;
  allowSourceSwitching?: boolean;
}

export const AudioPlayerControl: React.FC<AudioPlayerControlProps> = ({
  audioScript = "",
  audioTitle = "Listening Audio Track",
  audioSpeakerInfo,
  audioUrl: initialAudioUrl,
  maxPlays = 2,
  isTeacher = false,
  isSubmitted = false,
  onPlayStateChange,
  highlightedEvidence,
  allowSourceSwitching = true,
}) => {
  // Determine initial mode: if an audioUrl is supplied, use HTML5 audio mode; otherwise default to tts if audioScript is present
  const [audioSourceUrl, setAudioSourceUrl] = useState<string>(initialAudioUrl || "");
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [activeMode, setActiveMode] = useState<'mp3' | 'tts'>(() => {
    return initialAudioUrl ? 'mp3' : audioScript ? 'tts' : 'mp3';
  });

  // Playback states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playCount, setPlayCount] = useState<number>(0);
  const [hasActivePlaySession, setHasActivePlaySession] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [accent, setAccent] = useState<'en-GB' | 'en-US'>('en-GB'); // UK Female default
  const [showScript, setShowScript] = useState<boolean>(isTeacher || isSubmitted);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [urlInput, setUrlInput] = useState<string>("");

  // Progress tracking
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);

  // Audio HTML5 and Speech Synthesis References
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const ttsIntervalRef = useRef<any>(null);
  const estimatedTtsDurationRef = useRef<number>(60);
  const ttsElapsedSecRef = useRef<number>(0);

  // Update source if prop changes
  useEffect(() => {
    if (initialAudioUrl) {
      setAudioSourceUrl(initialAudioUrl);
      setActiveMode('mp3');
    }
  }, [initialAudioUrl]);

  // Sync script visibility on submission / teacher view
  useEffect(() => {
    if (isTeacher || isSubmitted) {
      setShowScript(true);
    } else {
      setShowScript(false);
    }
  }, [isTeacher, isSubmitted]);

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    if (isNaN(totalSec) || totalSec < 0) return "00:00";
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Estimate duration for TTS if no audio file is provided
  useEffect(() => {
    if (audioScript) {
      const words = audioScript.trim().split(/\s+/).length;
      const baseSec = Math.max(15, Math.round(words / 2.1));
      estimatedTtsDurationRef.current = Math.round(baseSec / speed);
      if (activeMode === 'tts') {
        setDurationSec(estimatedTtsDurationRef.current);
      }
    }
  }, [audioScript, speed, activeMode]);

  // Clean script text for TTS
  const cleanScriptForTts = (raw: string) => {
    return raw
      .replace(/Minh:|Lan:|Teacher:|Student:|Tom:|Sarah:|Speaker 1:|Speaker 2:|Interviewer:|Guest:|Dr\. Foster:|Host:/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Handle Stop Playback Cleanly
  const stopPlayback = () => {
    if (activeMode === 'mp3' && audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (ttsIntervalRef.current) {
      clearInterval(ttsIntervalRef.current);
    }

    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTimeSec(0);
    setHasActivePlaySession(false);
    if (onPlayStateChange) onPlayStateChange(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (ttsIntervalRef.current) {
        clearInterval(ttsIntervalRef.current);
      }
    };
  }, []);

  // Check play limit
  const isLimitReached = !isTeacher && !isSubmitted && playCount >= maxPlays && !isPlaying && !isPaused;

  // Handle Start / Resume Play
  const handlePlay = () => {
    // Check strict maxPlays restriction
    if (!isTeacher && !isSubmitted && playCount >= maxPlays && !hasActivePlaySession) {
      return;
    }

    // If starting a brand new listening turn (not just unpausing)
    if (!hasActivePlaySession) {
      setPlayCount(prev => prev + 1);
      setHasActivePlaySession(true);
    }

    // 1. Play HTML5 Audio if MP3 source exists
    if (activeMode === 'mp3' && audioSourceUrl) {
      if (audioElementRef.current) {
        audioElementRef.current.playbackRate = speed;
        audioElementRef.current.volume = isMuted ? 0 : volume;
        audioElementRef.current.play().then(() => {
          setIsPlaying(true);
          setIsPaused(false);
          if (onPlayStateChange) onPlayStateChange(true);
        }).catch(err => {
          console.warn("Audio playback failed, attempting fallback:", err);
          // Fallback to TTS if HTML5 fails
          if (audioScript) {
            setActiveMode('tts');
            startTtsSpeech();
          }
        });
      }
      return;
    }

    // 2. Fallback to Web Speech API
    startTtsSpeech();
  };

  const startTtsSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Trình duyệt không hỗ trợ phát âm tự động. Vui lòng tải file MP3 hoặc dùng Chrome/Safari.");
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      if (onPlayStateChange) onPlayStateChange(true);

      ttsIntervalRef.current = setInterval(() => {
        ttsElapsedSecRef.current += 1;
        setCurrentTimeSec(ttsElapsedSecRef.current);
      }, 1000);
      return;
    }

    window.speechSynthesis.cancel();
    if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);

    const speakText = cleanScriptForTts(audioScript);
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = accent === 'en-GB' ? 'en-GB' : 'en-US';
    utterance.volume = isMuted ? 0 : volume;
    utterance.pitch = 1.0;
    utterance.rate = Math.round(speed * 0.93 * 100) / 100;

    const voices = window.speechSynthesis.getVoices();
    let preferredVoice: SpeechSynthesisVoice | undefined;

    if (accent === 'en-GB') {
      preferredVoice =
        voices.find(v => (v.lang === 'en-GB' || v.lang.startsWith('en-GB')) && (
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('hazel') ||
          v.name.toLowerCase().includes('susan') ||
          v.name.toLowerCase().includes('libby') ||
          v.name.toLowerCase().includes('google uk english female')
        )) ||
        voices.find(v => v.lang === 'en-GB' || v.lang.startsWith('en-GB')) ||
        voices.find(v => v.lang.startsWith('en'));
    } else {
      preferredVoice =
        voices.find(v => (v.lang === 'en-US' || v.lang.startsWith('en-US')) && (
          v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google')
        )) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en'));
    }

    if (preferredVoice) utterance.voice = preferredVoice;

    ttsElapsedSecRef.current = 0;
    setCurrentTimeSec(0);

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      if (onPlayStateChange) onPlayStateChange(true);

      ttsIntervalRef.current = setInterval(() => {
        ttsElapsedSecRef.current += 1;
        setCurrentTimeSec(ttsElapsedSecRef.current);
      }, 1000);
    };

    utterance.onend = () => {
      if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTimeSec(durationSec);
      setHasActivePlaySession(false);
      if (onPlayStateChange) onPlayStateChange(false);
    };

    utterance.onerror = (e) => {
      if (e.error !== "canceled") console.warn("TTS playback error:", e);
      if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
      setIsPlaying(false);
      setIsPaused(false);
      setHasActivePlaySession(false);
      if (onPlayStateChange) onPlayStateChange(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Handle Pause
  const handlePause = () => {
    if (activeMode === 'mp3' && audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (activeMode === 'tts' && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
    }
    if (ttsIntervalRef.current) clearInterval(ttsIntervalRef.current);
    setIsPlaying(false);
    setIsPaused(true);
    if (onPlayStateChange) onPlayStateChange(false);
  };

  // Speed change
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (activeMode === 'mp3' && audioElementRef.current) {
      audioElementRef.current.playbackRate = newSpeed;
    }
    if (activeMode === 'tts' && isPlaying) {
      stopPlayback();
    }
  };

  // Volume & Mute change
  const handleVolumeToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioElementRef.current) {
      audioElementRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const handleVolumeSlider = (val: number) => {
    setVolume(val);
    setIsMuted(val === 0);
    if (audioElementRef.current) {
      audioElementRef.current.volume = val;
    }
  };

  // Handle Scrubbing / Seeking
  const handleSeek = (newSec: number) => {
    setCurrentTimeSec(newSec);
    if (activeMode === 'mp3' && audioElementRef.current) {
      audioElementRef.current.currentTime = newSec;
    }
  };

  // File Upload Handler (.mp3, .wav, .m4a, .ogg)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopPlayback();
      const objectUrl = URL.createObjectURL(file);
      setAudioSourceUrl(objectUrl);
      setUploadedFileName(file.name);
      setActiveMode('mp3');
      setShowConfigModal(false);
    }
  };

  // Link Submit Handler
  const handleApplyLink = () => {
    if (!urlInput.trim()) return;
    stopPlayback();
    setAudioSourceUrl(urlInput.trim());
    setUploadedFileName(urlInput.split('/').pop()?.split('?')[0] || "Online Audio Stream");
    setActiveMode('mp3');
    setShowConfigModal(false);
  };

  // Calculate Progress Percent
  const progressPercent = durationSec > 0 ? Math.min(100, (currentTimeSec / durationSec) * 100) : 0;

  return (
    <div
      id="student-audio-player-station"
      className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-xl border border-indigo-500/30 my-4 transition-all"
    >
      {/* HTML5 Audio Element for MP3 Loading */}
      {audioSourceUrl && (
        <audio
          ref={audioElementRef}
          src={audioSourceUrl}
          preload="metadata"
          onLoadedMetadata={(e) => {
            const d = e.currentTarget.duration;
            if (!isNaN(d) && d > 0) setDurationSec(d);
          }}
          onTimeUpdate={(e) => {
            setCurrentTimeSec(e.currentTarget.currentTime);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsPaused(false);
            setCurrentTimeSec(durationSec);
            setHasActivePlaySession(false);
            if (onPlayStateChange) onPlayStateChange(false);
          }}
          onError={() => {
            console.warn("Could not load audio file URL, fallback to speech synthesis if script available.");
          }}
        />
      )}

      {/* Hidden File Input for MP3 Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/ogg,audio/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-400/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner flex-shrink-0">
            <Headphones className={`w-6 h-6 ${isPlaying ? "animate-pulse text-emerald-400" : ""}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                LISTENING AUDIO TRACK
              </span>

              {/* Strict MaxPlays Limit Badge */}
              {isTeacher ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Giáo viên: Không giới hạn lượt nghe
                </span>
              ) : isSubmitted ? (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Xem lại sau thi: Nghe tự do
                </span>
              ) : (
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                    playCount >= maxPlays
                      ? "bg-rose-500/25 text-rose-300 border-rose-400/50"
                      : playCount === 1
                      ? "bg-amber-500/25 text-amber-300 border-amber-400/50"
                      : "bg-emerald-500/25 text-emerald-300 border-emerald-400/50"
                  }`}
                >
                  {playCount >= maxPlays ? (
                    <>
                      <Lock className="w-3 h-3 text-rose-400" />
                      <span>Đã nghe: {playCount}/{maxPlays} lần (Hết lượt)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Đã nghe: {playCount}/{maxPlays} lần (Còn {maxPlays - playCount} lượt)</span>
                    </>
                  )}
                </span>
              )}

              {/* Mode Indicator Badge */}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700">
                {activeMode === 'mp3' ? (
                  <span className="flex items-center gap-1">
                    <Music className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{uploadedFileName || (audioSourceUrl.startsWith('data:') || audioSourceUrl.startsWith('blob:') ? 'Tệp MP3 tải lên' : 'MP3 Audio Stream')}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                    <span>AI Voice ({accent === 'en-GB' ? 'UK Female' : 'US'})</span>
                  </span>
                )}
              </span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
              {audioTitle}
            </h4>
            {audioSpeakerInfo && (
              <p className="text-xs text-indigo-200/80 mt-0.5 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-300" />
                {audioSpeakerInfo}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls: Source Picker & Speeds */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Load MP3 / Audio Link Button */}
          {allowSourceSwitching && (!isLimitReached || isTeacher || isSubmitted) && (
            <button
              type="button"
              onClick={() => setShowConfigModal(!showConfigModal)}
              title="Tải tệp MP3 hoặc dán liên kết audio cho bài nghe"
              className="text-xs px-2.5 py-1.5 rounded-xl font-bold bg-indigo-800/60 hover:bg-indigo-700/70 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <Music className="w-3.5 h-3.5 text-indigo-300" />
              <span>{audioSourceUrl ? "Đổi MP3 / Link" : "Tải MP3 / Link"}</span>
            </button>
          )}

          {/* Accent Switcher (Active if in TTS Mode) */}
          {activeMode === 'tts' && (
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-indigo-400/25">
              <button
                type="button"
                onClick={() => {
                  setAccent('en-GB');
                  if (isPlaying) stopPlayback();
                }}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  accent === 'en-GB' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇬🇧 UK Female
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccent('en-US');
                  if (isPlaying) stopPlayback();
                }}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  accent === 'en-US' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 US
              </button>
            </div>
          )}

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-indigo-400/25">
            {[0.8, 1.0, 1.2].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`text-xs px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  speed === s ? "bg-indigo-600 text-white shadow-2xs" : "text-slate-400 hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable Source Config Drawer (Upload MP3 file or Enter Audio URL) */}
      {showConfigModal && (
        <div className="my-3 p-4 bg-slate-900/90 border border-indigo-400/40 rounded-xl space-y-3 animate-in fade-in duration-150 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cấu hình nguồn Audio cho phần thi Listening:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowConfigModal(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
            >
              ✕ Đóng
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Upload Local MP3 File */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Tải tệp Audio MP3 từ máy tính:</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hỗ trợ các định dạng <code>.mp3, .wav, .m4a, .ogg</code> trực tiếp từ thiết bị của em hoặc giáo viên.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn tệp MP3 từ thiết bị...</span>
              </button>
            </div>

            {/* 2. Direct Audio Link */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Nhập liên kết âm thanh trực tuyến:</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/listening-track.mp3"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-400"
                />
                <button
                  type="button"
                  onClick={handleApplyLink}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shrink-0 cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Hỗ trợ link trực tiếp file MP3 từ máy chủ nhà trường, Google Drive, hoặc link CDN âm thanh.
              </p>
            </div>
          </div>

          {/* Quick Fallback to AI Speech if desired */}
          {audioScript && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Hoặc sử dụng AI Speech Synthesis đọc tự động theo Audio Script có sẵn:</span>
              <button
                type="button"
                onClick={() => {
                  stopPlayback();
                  setActiveMode('tts');
                  setAudioSourceUrl("");
                  setUploadedFileName("");
                  setShowConfigModal(false);
                }}
                className="font-bold text-indigo-400 hover:text-indigo-300 underline"
              >
                Dùng AI Voice đọc kịch bản
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scrubbable Progress Bar & Duration */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-indigo-200/80 mb-1.5 font-mono">
          <span>{formatTime(currentTimeSec)}</span>
          {isPlaying && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 text-xs font-sans font-bold">
                {activeMode === 'mp3' ? "Đang phát file MP3..." : "Đang phát AI Audio..."}
              </span>
            </div>
          )}
          <span>{formatTime(durationSec)}</span>
        </div>

        {/* Clickable & Scrubbable Seek Bar */}
        <div className="relative w-full flex items-center">
          <input
            type="range"
            min={0}
            max={durationSec || 100}
            step={0.5}
            value={currentTimeSec}
            disabled={isLimitReached}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-400 border border-indigo-400/20 focus:outline-none"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #6366f1 ${progressPercent}%, #1e293b ${progressPercent}%, #1e293b 100%)`
            }}
          />
        </div>
      </div>

      {/* Main Playback Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3">
        <div className="flex items-center gap-3">
          {/* Play / Pause Button */}
          {!isPlaying || isPaused ? (
            <button
              id="student-audio-play-btn"
              type="button"
              onClick={handlePlay}
              disabled={isLimitReached}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black shadow-lg transition-all ${
                isLimitReached
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50 active:scale-95 cursor-pointer"
              }`}
            >
              {isLimitReached ? (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Hết lượt nghe (Tối đa 2 lần)</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>
                    {isPaused
                      ? "Tiếp tục nghe"
                      : playCount > 0
                      ? `Nghe lại lần 2 (${playCount}/${maxPlays})`
                      : "Bắt đầu nghe"}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              id="student-audio-pause-btn"
              type="button"
              onClick={handlePause}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50 active:scale-95 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Tạm dừng</span>
            </button>
          )}

          {/* Stop / Reset Button */}
          {(isPlaying || isPaused || currentTimeSec > 0) && (
            <button
              id="student-audio-stop-btn"
              type="button"
              onClick={stopPlayback}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Dừng hẳn</span>
            </button>
          )}

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 rounded-xl border border-indigo-400/20">
            <button
              type="button"
              onClick={handleVolumeToggle}
              className="text-slate-300 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeSlider(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>

        {/* Script Reveal Button (Teacher mode or Post-submission) */}
        <div>
          {isTeacher || isSubmitted ? (
            <button
              type="button"
              onClick={() => setShowScript(!showScript)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 transition cursor-pointer"
            >
              {showScript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showScript ? "Ẩn Audio Script" : "Xem Audio Script & Dẫn chứng"}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-indigo-300/80 bg-slate-900/60 px-3 py-2 rounded-xl border border-indigo-400/10">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Audio Script mở sau khi nộp bài</span>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Warning Banner if MaxPlays Reached */}
      {isLimitReached && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/20 border-2 border-rose-400/40 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <div className="font-black text-rose-100 text-sm">
              🔒 Đã hoàn thành tối đa {maxPlays}/{maxPlays} lượt nghe theo quy định phòng thi
            </div>
            <div>
              Hệ thống đã khóa quyền phát audio cho phần này để đảm bảo tính công bằng khảo thí. Em hãy căn cứ vào các thông tin đã nghe được để hoàn thành các câu hỏi bên dưới.
            </div>
          </div>
        </div>
      )}

      {/* Expandable Audio Script (Only in Review / Teacher Mode) */}
      {showScript && audioScript && (
        <div
          id="student-audio-script-panel"
          className="mt-5 pt-4 border-t border-indigo-400/20 bg-slate-900/80 rounded-xl p-4 border border-indigo-400/15"
        >
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kịch bản bài nghe (Audio Script & Transcript)</span>
            </h5>
            <span className="text-[11px] text-indigo-400 italic">
              {isTeacher ? "Chế độ Giáo viên kiểm tra" : "Dành cho Học sinh tra cứu đối chiếu sau nộp bài"}
            </span>
          </div>

          <div className="text-sm text-indigo-100 font-sans leading-relaxed whitespace-pre-line space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {audioScript.split("\n").map((line, idx) => {
              const isHighlight =
                highlightedEvidence && line.toLowerCase().includes(highlightedEvidence.toLowerCase().slice(0, 30));
              return (
                <p
                  key={idx}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isHighlight
                      ? "bg-amber-400/25 border-l-4 border-amber-400 text-amber-100 font-medium pl-2.5"
                      : "hover:bg-indigo-900/30"
                  }`}
                >
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
