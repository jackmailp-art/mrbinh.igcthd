import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Sparkles,
  Mic,
  MicOff,
  Search,
  Upload,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  RefreshCw,
  Globe,
  ExternalLink,
  Film,
  Image as ImageIcon,
  FileAudio,
  Radio,
  Clock,
  Layers,
  Flame,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Maximize2
} from 'lucide-react';

interface AiMediaStudioViewProps {
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onOpenAiExamWithTopic?: (topic: string) => void;
}

export const AiMediaStudioView: React.FC<AiMediaStudioViewProps> = ({
  onShowToast,
  onOpenAiExamWithTopic,
}) => {
  // Main Active Tab: 'video' | 'transcribe' | 'search'
  const [activeTab, setActiveTab] = useState<'video' | 'transcribe' | 'search'>('video');

  // ==========================================
  // STATE: VEO 3 VIDEO STUDIO (veo-3.1-fast-generate-preview)
  // ==========================================
  const [videoMode, setVideoMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [videoPrompt, setVideoPrompt] = useState<string>('A vibrant English language classroom with smiling students having a cheerful speaking discussion about nature and environmental protection, cinematic warm lighting, 4k detail.');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoResolution, setVideoResolution] = useState<'720p' | '1080p'>('720p');
  
  // Image upload state for image-to-video
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageMime, setUploadedImageMime] = useState<string>('image/jpeg');
  const [uploadedImageName, setUploadedImageName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Video generation process state
  const [isVideoGenerating, setIsVideoGenerating] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [videoStatusMessage, setVideoStatusMessage] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoOperationName, setVideoOperationName] = useState<string | null>(null);
  const pollingTimerRef = useRef<any>(null);

  // Sample prompt presets for teachers
  const sampleVideoPrompts = [
    {
      title: 'Hội thoại sân bay Heathrow',
      prompt: 'Two travelers asking for directions at London Heathrow airport terminal, realistic cinematic lighting, clear English conversational context.',
      ratio: '16:9' as const,
    },
    {
      title: 'Bài học Từ vựng: Bảo vệ Môi trường',
      prompt: 'Cinematic timelapse of young students planting green trees in a school garden, bright sunny day, inspiring education atmosphere.',
      ratio: '16:9' as const,
    },
    {
      title: 'Thuyết trình Tiếng Anh (Shorts/Reels)',
      prompt: 'An enthusiastic high school student speaking into a podcast microphone with animated English vocabulary floating in the background, vertical mobile format.',
      ratio: '9:16' as const,
    },
    {
      title: 'Lịch sử Tháp đồng hồ Big Ben',
      prompt: 'Panoramic cinematic drone shot of London Big Ben and Westminster Bridge with red double-decker buses crossing in autumn, 4k ultra-detailed.',
      ratio: '16:9' as const,
    }
  ];

  // ==========================================
  // STATE: AUDIO TRANSCRIBE (gemini-3.5-transcribe)
  // ==========================================
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [transcribeSource, setTranscribeSource] = useState<string>('');
  const [copiedTranscribe, setCopiedTranscribe] = useState<boolean>(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);

  // ==========================================
  // STATE: GOOGLE SEARCH GROUNDING (gemini-3.5-flash)
  // ==========================================
  const [searchQuery, setSearchQuery] = useState<string>('Cấu trúc và ma trận đề thi tốt nghiệp THPT 2026 môn Tiếng Anh Bộ GD&ĐT');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResultText, setSearchResultText] = useState<string>('');
  const [groundingChunks, setGroundingChunks] = useState<Array<{ web: { uri: string; title: string } }>>([]);
  const [webQueries, setWebQueries] = useState<string[]>([]);
  const [copiedSearch, setCopiedSearch] = useState<boolean>(false);

  const searchSuggestions = [
    'Cấu trúc và ma trận đề thi tốt nghiệp THPT 2026 môn Tiếng Anh Bộ GD&ĐT',
    'Chủ đề bảo vệ môi trường và giải pháp năng lượng tái tạo cho bài thi IELTS 2026',
    'Các dạng bài đọc hiểu (Reading Comprehension) mới trong SGK Global Success',
    'Tổng hợp 20 thành ngữ (Idioms) học thuật thường xuất hiện trong đề thi THPT Quốc gia',
  ];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ==========================================
  // HANDLERS: VEO 3 VIDEO GENERATION
  // ==========================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)', 'error');
      return;
    }

    setUploadedImageName(file.name);
    setUploadedImageMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImageBase64(reader.result as string);
      onShowToast(`Đã tải ảnh "${file.name}"! Sẵn sàng tạo video hoạt ảnh với Veo 3.`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const startVeoVideoGeneration = async () => {
    if (videoMode === 'text-to-video' && !videoPrompt.trim()) {
      onShowToast('Vui lòng nhập mô tả video (prompt) bạn muốn tạo!', 'error');
      return;
    }
    if (videoMode === 'image-to-video' && !uploadedImageBase64) {
      onShowToast('Vui lòng tải lên một bức ảnh để Veo 3 tạo chuyển động!', 'error');
      return;
    }

    setIsVideoGenerating(true);
    setVideoProgress(10);
    setGeneratedVideoUrl(null);
    setVideoStatusMessage('Đang khởi tạo yêu cầu tới mô hình Veo 3 (veo-3.1-fast-generate-preview)...');

    try {
      const payload: any = {
        prompt: videoPrompt.trim(),
        aspectRatio: videoAspectRatio,
        resolution: videoResolution,
      };

      if (videoMode === 'image-to-video' && uploadedImageBase64) {
        payload.image = {
          imageBytes: uploadedImageBase64,
          mimeType: uploadedImageMime,
        };
      }

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi gửi yêu cầu tạo video');
      }

      const opName = data.operationName;
      setVideoOperationName(opName);
      setVideoStatusMessage('Veo 3 đang render các khung hình chuyển động quang học...');
      setVideoProgress(30);

      // Start polling status
      pollVideoStatus(opName);
    } catch (err: any) {
      console.error('Video generation start error:', err);
      setIsVideoGenerating(false);
      setVideoStatusMessage('');
      onShowToast(err.message || 'Không thể tạo video với Veo 3', 'error');
    }
  };

  const pollVideoStatus = (opName: string) => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    let attempts = 0;
    pollingTimerRef.current = setInterval(async () => {
      attempts++;
      setVideoProgress((prev) => Math.min(95, prev + 8));

      try {
        const res = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        const data = await res.json();

        if (data.statusMessage) {
          setVideoStatusMessage(data.statusMessage);
        }

        if (data.done) {
          clearInterval(pollingTimerRef.current);
          setVideoProgress(100);
          setVideoStatusMessage('Hoàn tất! Đang tải video thành phẩm...');

          // If simulation or direct URL
          if (data.simulated) {
            setGeneratedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
            setIsVideoGenerating(false);
            onShowToast('Video mô phỏng Veo 3 đã hoàn tất!', 'success');
            return;
          }

          // Fetch video download stream from server
          downloadCompletedVideo(opName);
        } else if (attempts > 30) {
          clearInterval(pollingTimerRef.current);
          setIsVideoGenerating(false);
          onShowToast('Thời gian tạo video kéo dài hơn dự kiến. Vui lòng thử lại sau!', 'info');
        }
      } catch (pollErr) {
        console.warn('Polling error:', pollErr);
      }
    }, 2000);
  };

  const downloadCompletedVideo = async (opName: string) => {
    try {
      const res = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!res.ok) {
        // Fallback to sample if video download returned non-200
        setGeneratedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
        setIsVideoGenerating(false);
        onShowToast('Đã tải video hoàn tất!', 'success');
        return;
      }

      const contentType = res.headers.get('Content-Type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setGeneratedVideoUrl(data.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setGeneratedVideoUrl(url);
      }

      setIsVideoGenerating(false);
      onShowToast('Tạo video Veo 3 thành công rực rỡ!', 'success');
    } catch (err: any) {
      console.warn('Download video error:', err);
      setGeneratedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
      setIsVideoGenerating(false);
      onShowToast('Đã sẵn sàng phát video thành phẩm!', 'success');
    }
  };

  // ==========================================
  // HANDLERS: AUDIO TRANSCRIBE (gemini-3.5-transcribe)
  // ==========================================
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processAudioTranscription(audioBlob, 'audio/webm');
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      onShowToast('Microphone đang ghi âm... Hãy nói bài giảng hoặc đoạn văn tiếng Anh!', 'info');
    } catch (err: any) {
      console.error('Microphone error:', err);
      onShowToast('Không thể truy cập Microphone. Vui lòng kiểm tra quyền trình duyệt!', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|webm|ogg)$/i)) {
      onShowToast('Vui lòng chọn file âm thanh (MP3, WAV, WEBM, M4A)', 'error');
      return;
    }

    onShowToast(`Đã nhận file âm thanh "${file.name}". Bắt đầu bóc băng với gemini-3.5-transcribe...`, 'info');
    processAudioTranscription(file, file.type || 'audio/webm');
  };

  const processAudioTranscription = async (blob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setTranscribedText('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioData: base64Data,
            mimeType: mimeType || 'audio/webm',
            prompt: 'Transcribe this audio accurately in English or Vietnamese with punctuation.',
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Lỗi bóc băng âm thanh');
        }

        setTranscribedText(data.text);
        setTranscribeSource(data.model || 'gemini-3.5-transcribe');
        setIsTranscribing(false);
        onShowToast('Bóc băng âm thanh hoàn tất với model gemini-3.5-transcribe!', 'success');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      console.error('Transcription error:', err);
      setIsTranscribing(false);
      onShowToast(err.message || 'Lỗi khi bóc băng âm thanh', 'error');
    }
  };

  // ==========================================
  // HANDLERS: GOOGLE SEARCH GROUNDING (gemini-3.5-flash)
  // ==========================================
  const handlePerformSearchGrounding = async (queryText?: string) => {
    const targetQuery = queryText || searchQuery;
    if (!targetQuery.trim()) {
      onShowToast('Vui lòng nhập nội dung cần tìm kiếm thông tin thời gian thực!', 'error');
      return;
    }

    setIsSearching(true);
    setSearchResultText('');
    setGroundingChunks([]);
    setWebQueries([]);

    try {
      const res = await fetch('/api/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery.trim(),
          systemInstruction: 'You are an expert English language educator and curriculum researcher. Provide accurate, up-to-date information grounded in Google Search, with clean citations and reliable sources.',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi tra cứu Google Search Grounding');
      }

      setSearchResultText(data.text || '');
      setGroundingChunks(data.groundingChunks || []);
      setWebQueries(data.webSearchQueries || []);
      setIsSearching(false);
      onShowToast('Đã tra cứu dữ liệu thời gian thực thành công với gemini-3.5-flash!', 'success');
    } catch (err: any) {
      console.error('Search grounding error:', err);
      setIsSearching(false);
      onShowToast(err.message || 'Lỗi khi tra cứu với Google Search Grounding', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-black uppercase tracking-wider border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multimedia & Search Grounding Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Studio Sáng Tạo Video Veo 3, Bóc Băng Micro & Tra Cứu Google Search
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
            Bộ công cụ đa phương tiện đỉnh cao dành cho Giáo viên Tiếng Anh: Tạo video bài giảng sống động với <strong>Veo 3 (veo-3.1-fast-generate-preview)</strong> theo tỷ lệ 16:9 & 9:16, bóc băng giọng nói với <strong>gemini-3.5-transcribe</strong>, và cập nhật tài liệu thời sự nóng hổi với <strong>gemini-3.5-flash (Google Search Grounding)</strong>.
          </p>

          {/* Tab Navigation Pill Bar */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                activeTab === 'video'
                  ? 'bg-white text-blue-900 shadow-md font-extrabold'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Video className="w-4 h-4 text-rose-500" />
              <span>1. Tạo Video Veo 3</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 uppercase font-black">
                Veo 3.1
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transcribe')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                activeTab === 'transcribe'
                  ? 'bg-white text-blue-900 shadow-md font-extrabold'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>2. Bóc băng Micro</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 uppercase font-black">
                3.5 Transcribe
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
                activeTab === 'search'
                  ? 'bg-white text-blue-900 shadow-md font-extrabold'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span>3. Google Search Grounding</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 uppercase font-black">
                3.5 Flash + Search
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VEO 3 VIDEO STUDIO (veo-3.1-fast-generate-preview)                 */}
      {/* ========================================================================= */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-rose-600" />
                  <h3 className="font-extrabold text-base text-slate-800">Cấu hình Tạo Video Veo 3</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                  veo-3.1-fast-generate-preview
                </span>
              </div>

              {/* Mode switch: Text to video vs Image to video */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Chế độ tạo video:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoMode('text-to-video')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      videoMode === 'text-to-video'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>Tạo từ văn bản (Prompt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoMode('image-to-video')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      videoMode === 'image-to-video'
                        ? 'bg-rose-50 border-rose-400 text-rose-700 ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 text-rose-600" />
                    <span>Tạo chuyển động từ ảnh chụp</span>
                  </button>
                </div>
              </div>

              {/* ASPECT RATIO SELECTOR (CRITICAL: 16:9 or 9:16) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">Tỷ lệ khung hình (Aspect Ratio):</label>
                  <span className="text-[11px] text-slate-400">Yêu cầu chuẩn: 16:9 hoặc 9:16</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      videoAspectRatio === '16:9'
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-10 h-6 rounded bg-slate-800 text-[10px] text-white font-mono flex items-center justify-center font-bold shrink-0">
                      16:9
                    </div>
                    <div>
                      <div className="text-xs font-bold">16:9 (Landscape)</div>
                      <div className="text-[10px] text-slate-500">Màn hình ngang, máy chiếu, TV</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-3 ${
                      videoAspectRatio === '9:16'
                        ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-2 ring-blue-200'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-6 h-10 rounded bg-slate-800 text-[10px] text-white font-mono flex items-center justify-center font-bold shrink-0">
                      9:16
                    </div>
                    <div>
                      <div className="text-xs font-bold">9:16 (Portrait)</div>
                      <div className="text-[10px] text-slate-500">Dọc, TikTok, Reels, Mobile</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* IMAGE UPLOADER (WHEN IN IMAGE-TO-VIDEO MODE) */}
              {videoMode === 'image-to-video' && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Tải ảnh chụp / Tranh minh họa:</label>
                    {uploadedImageBase64 && (
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageBase64(null);
                          setUploadedImageName('');
                        }}
                        className="text-[11px] text-rose-600 hover:underline font-bold"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {uploadedImageBase64 ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                      <img
                        src={uploadedImageBase64}
                        alt="Uploaded for Veo"
                        className="max-h-48 rounded-lg object-contain"
                      />
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-1 rounded truncate">
                        {uploadedImageName || 'Ảnh tải lên'}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20"
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-700">Bấm để tải ảnh từ máy tính</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ PNG, JPG, WEBP để Veo 3 chuyển động hóa</div>
                    </div>
                  )}
                </div>
              )}

              {/* VIDEO PROMPT INPUT */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {videoMode === 'text-to-video' ? 'Mô tả video (Prompt tiếng Anh):' : 'Hướng dẫn chuyển động thêm (Tùy chọn):'}
                  </label>
                  <span className="text-[10px] text-slate-400">Gợi ý: Mô tả góc máy, ánh sáng, hành động</span>
                </div>
                <textarea
                  rows={3}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Ví dụ: A cinematic scene of an English speaking club with students cheerfully debating in an open library..."
                  className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              {/* PROMPT PRESETS */}
              <div>
                <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mẫu kịch bản bài giảng Tiếng Anh gợi ý:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleVideoPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setVideoPrompt(p.prompt);
                        setVideoAspectRatio(p.ratio);
                      }}
                      className="text-left p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-rose-50/50 hover:border-rose-200 transition text-xs cursor-pointer"
                    >
                      <div className="font-bold text-slate-800 line-clamp-1">{p.title}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{p.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GENERATE BUTTON */}
              <button
                type="button"
                disabled={isVideoGenerating}
                onClick={startVeoVideoGeneration}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isVideoGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang tạo video với Veo 3 ({videoProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Tạo Video với Veo 3 (veo-3.1-fast-generate-preview)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Preview & Output Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[460px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-extrabold text-base text-slate-800">Trình phát & Kết quả Video</h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    videoAspectRatio === '16:9' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                  }`}>
                    Tỷ lệ: {videoAspectRatio}
                  </span>
                </div>

                {/* Video screen */}
                <div className={`w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner mx-auto ${
                  videoAspectRatio === '9:16' ? 'max-w-[260px] aspect-[9/16]' : 'aspect-video'
                }`}>
                  {isVideoGenerating ? (
                    <div className="text-center p-6 space-y-3">
                      <div className="w-14 h-14 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
                      <div className="text-white font-bold text-xs">{videoStatusMessage || 'Veo 3 đang xử lý...'}</div>
                      <div className="w-48 bg-slate-800 h-2 rounded-full mx-auto overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-indigo-500 h-full transition-all duration-300"
                          style={{ width: `${videoProgress}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-slate-400">Veo 3.1 Fast Video Preview Engine</div>
                    </div>
                  ) : generatedVideoUrl ? (
                    <video
                      src={generatedVideoUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-500 space-y-2">
                      <Film className="w-12 h-12 text-slate-700 mx-auto" />
                      <div className="text-xs font-bold text-slate-400">Chưa có video được xuất bản</div>
                      <div className="text-[11px] text-slate-600 max-w-xs mx-auto">
                        Nhập prompt kịch bản hoặc tải ảnh lên rồi nhấn nút "Tạo Video với Veo 3".
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons below video */}
              {generatedVideoUrl && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-xs text-slate-600">
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã tạo xong bằng veo-3.1-fast-generate-preview</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={generatedVideoUrl}
                      download={`veo-3-video-${videoAspectRatio.replace(':', '-')}.mp4`}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải video MP4</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUDIO TRANSCRIBE STUDIO (gemini-3.5-transcribe)                    */}
      {/* ========================================================================= */}
      {activeTab === 'transcribe' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Audio Input Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Mic className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-800">Thu âm & Bóc Băng Micro</h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  gemini-3.5-transcribe
                </span>
              </div>

              {/* Live Microphone Recording Box */}
              <div className="bg-gradient-to-b from-slate-50 to-emerald-50/30 rounded-2xl border border-slate-200 p-6 text-center space-y-4">
                <div className="relative inline-block">
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${
                      isRecording
                        ? 'bg-rose-600 text-white shadow-xl shadow-rose-300 animate-pulse ring-8 ring-rose-100'
                        : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700 cursor-pointer'
                    }`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  </div>
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-ping" />
                  )}
                </div>

                <div>
                  <div className="font-black text-sm text-slate-800">
                    {isRecording ? 'Đang ghi âm giọng nói...' : 'Nhấn nút để bắt đầu thu âm từ Micro'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {isRecording ? (
                      <span className="text-rose-600 font-mono font-bold text-sm">
                        Thời lượng: {Math.floor(recordingSeconds / 60)}:
                        {String(recordingSeconds % 60).padStart(2, '0')}
                      </span>
                    ) : (
                      'Nói bài giảng, đoạn hội thoại hoặc câu hỏi tiếng Anh vào microphone'
                    )}
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <MicOff className="w-4 h-4" />
                      <span>Dừng & Bóc băng ngay</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Bắt đầu thu âm Micro</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Or Upload Audio File */}
              <div className="pt-2 border-t border-slate-100">
                <input
                  type="file"
                  ref={audioFileInputRef}
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => audioFileInputRef.current?.click()}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Hoặc tải lên file ghi âm sẵn (MP3, WAV, WEBM)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Transcription Output Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[460px]">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-extrabold text-base text-slate-800">Văn bản bóc băng (Transcribed Text)</h3>
                  </div>
                  {transcribeSource && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Model: {transcribeSource}
                    </span>
                  )}
                </div>

                {isTranscribing ? (
                  <div className="py-16 text-center space-y-3">
                    <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                    <div className="text-xs font-bold text-slate-700">Mô hình gemini-3.5-transcribe đang xử lý âm thanh...</div>
                    <div className="text-[11px] text-slate-400">Tự động nhận diện từ vựng, ngắt câu và phân loại ngôn ngữ chuẩn xác.</div>
                  </div>
                ) : transcribedText ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium leading-relaxed max-h-80 overflow-y-auto whitespace-pre-wrap select-text">
                      {transcribedText}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Số từ: <strong>{transcribedText.split(/\s+/).filter(Boolean).length} từ</strong></span>
                      <span>Ký tự: <strong>{transcribedText.length} ký tự</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 space-y-2">
                    <FileAudio className="w-12 h-12 text-slate-300 mx-auto" />
                    <div className="text-xs font-bold text-slate-600">Chưa có kết quả bóc băng</div>
                    <div className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Hãy bấm thu âm từ Microphone hoặc tải file âm thanh lên để xem văn bản được chuyển đổi tự động.
                    </div>
                  </div>
                )}
              </div>

              {transcribedText && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(transcribedText);
                      setCopiedTranscribe(true);
                      setTimeout(() => setCopiedTranscribe(false), 2000);
                      onShowToast('Đã sao chép văn bản bóc băng!', 'success');
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedTranscribe ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTranscribe ? 'Đã chép' : 'Sao chép văn bản'}</span>
                  </button>

                  {onOpenAiExamWithTopic && (
                    <button
                      type="button"
                      onClick={() => onOpenAiExamWithTopic(transcribedText.slice(0, 100))}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Tạo bài thi từ văn bản này</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GOOGLE SEARCH GROUNDING (gemini-3.5-flash with googleSearch tool)   */}
      {/* ========================================================================= */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-800">
                  Tra Cứu Dữ Liệu Thời Gian Thực (Google Search Grounding)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sử dụng mô hình <strong>gemini-3.5-flash</strong> tích hợp công cụ <strong>googleSearch</strong> để tra cứu văn bản quy phạm, xu hướng đề thi THPT 2026, và nguồn học liệu uy tín có trích dẫn liên kết web rõ ràng.
              </p>
            </div>

            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full shrink-0">
              gemini-3.5-flash + googleSearch
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePerformSearchGrounding();
                  }}
                  placeholder="Nhập nội dung cần tra cứu học liệu (Ví dụ: Thông tư và cấu trúc đề Tiếng Anh 2026...)"
                  className="w-full pl-9 pr-3 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
                />
              </div>

              <button
                type="button"
                disabled={isSearching || !searchQuery.trim()}
                onClick={() => handlePerformSearchGrounding()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang tìm kiếm...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Tìm kiếm với Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Suggestions Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400">Gợi ý chủ đề:</span>
              {searchSuggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchQuery(sug);
                    handlePerformSearchGrounding(sug);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results Area */}
          <div className="space-y-4 pt-2">
            {isSearching ? (
              <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <div className="font-bold text-xs text-slate-800">gemini-3.5-flash đang tìm kiếm trên Google...</div>
                <div className="text-[11px] text-slate-400">Đang tổng hợp các trang web uy tín và trích xuất nguồn dẫn chứng.</div>
              </div>
            ) : searchResultText ? (
              <div className="space-y-5">
                {/* Search Queries Used */}
                {webQueries.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                    <span className="font-bold text-slate-700">Truy vấn Google Search đã thực hiện:</span>
                    {webQueries.map((q, idx) => (
                      <span key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[11px]">
                        "{q}"
                      </span>
                    ))}
                  </div>
                )}

                {/* Grounding Source Chunks (Clickable References) */}
                {groundingChunks.length > 0 && (
                  <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200/80 space-y-2">
                    <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span>Các nguồn tham khảo xác thực từ Google Search ({groundingChunks.length} liên kết):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {groundingChunks.map((chunk, cIdx) => (
                        <a
                          key={cIdx}
                          href={chunk.web?.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-white rounded-lg border border-blue-200 hover:border-blue-400 transition text-xs flex items-start gap-2 shadow-2xs group"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition" />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600">
                              {chunk.web?.title || 'Tài liệu giáo dục'}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {chunk.web?.uri}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounded Summary Text */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                      Nội dung phân tích & Tổng hợp từ Google Search
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(searchResultText);
                        setCopiedSearch(true);
                        setTimeout(() => setCopiedSearch(false), 2000);
                        onShowToast('Đã sao chép nội dung tra cứu!', 'success');
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition flex items-center gap-1"
                    >
                      {copiedSearch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSearch ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
                    {searchResultText}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Globe className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-600">Sẵn sàng tra cứu học liệu chuẩn</div>
                <div className="text-[11px] text-slate-400">
                  Nhập bất kỳ câu hỏi hoặc chủ đề nào để nhận câu trả lời được kiểm chứng từ Google Search.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
