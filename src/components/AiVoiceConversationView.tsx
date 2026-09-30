import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  RefreshCw,
  Copy,
  Check,
  Radio,
  Settings2,
  Trash2,
  ArrowRight,
  Zap,
  Brain,
  MessageSquare,
  HelpCircle,
  Play,
  Pause,
  AlertCircle,
  GraduationCap,
  School,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AuthUser } from '../types';
import {
  AI_AVAILABLE_MODELS,
  AI_PRESET_ROLES,
  AiRoleConfig
} from '../utils/aiRoles';
import {
  AudioQueuePlayer,
  MicrophoneRecorder
} from '../utils/liveAudioUtils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isAudioSpoken?: boolean;
}

interface AiVoiceConversationViewProps {
  user: AuthUser;
  onOpenAiModal?: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AiVoiceConversationView: React.FC<AiVoiceConversationViewProps> = ({
  user,
  onOpenAiModal,
  onShowToast
}) => {
  // Active Role and System Instruction
  const [selectedRole, setSelectedRole] = useState<AiRoleConfig>(() => AI_PRESET_ROLES[0]);
  const [customSystemInstruction, setCustomSystemInstruction] = useState<string>(selectedRole.systemInstruction);
  const [showRoleConfig, setShowRoleConfig] = useState<boolean>(false);

  // Selected Model
  const [selectedModel, setSelectedModel] = useState<string>(() => selectedRole.recommendedModel);

  // Voice Selection for Live & TTS
  const [selectedVoice, setSelectedVoice] = useState<'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir'>(
    selectedRole.defaultVoice
  );

  // Live API Audio State
  const [isLiveActive, setIsLiveActive] = useState<boolean>(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [liveStatusText, setLiveStatusText] = useState<string>('Chưa kết nối Live API');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isGeminiSpeaking, setIsGeminiSpeaking] = useState<boolean>(false);
  const [isLiveInterrupted, setIsLiveInterrupted] = useState<boolean>(false);

  // Text Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-init',
      role: 'assistant',
      content: `Xin chào ${user.name}! Tôi là **${selectedRole.name}**. Tôi có thể hỗ trợ Thầy/Cô và các em học sinh luyện đàm thoại trực tiếp bằng giọng nói với mô hình **Gemini 3.8 Live**, hoặc trao đổi bằng văn bản với **Gemini 3.5 Flash** và **Gemini 3.1 Flash-Lite**.\n\nHãy nhấn **[Bắt đầu đàm thoại trực tiếp 🎙️]** để nói chuyện bằng tiếng Anh thời gian thực, hoặc gõ tin nhắn phía dưới!`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedRole.recommendedModel
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio Playback for TTS
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioQueuePlayerRef = useRef<AudioQueuePlayer | null>(null);
  const micRecorderRef = useRef<MicrophoneRecorder | null>(null);
  const currentTurnAssistantTextRef = useRef<string>('');

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGeminiSpeaking]);

  // Sync role change
  const handleSelectRole = (role: AiRoleConfig) => {
    setSelectedRole(role);
    setCustomSystemInstruction(role.systemInstruction);
    setSelectedModel(role.recommendedModel);
    setSelectedVoice(role.defaultVoice);

    const welcomeMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: 'system',
      content: `Đã chuyển sang vai trò: **${role.name}** (${role.badge}). Mô hình khuyến nghị: \`${role.recommendedModel}\`.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, welcomeMsg]);
    onShowToast?.(`Đã kích hoạt vai trò: ${role.shortTitle}`, 'info');

    // If live session is active, reconnect with new system prompt
    if (isLiveActive) {
      restartLiveSession(role.systemInstruction, role.defaultVoice);
    }
  };

  // -------------------------------------------------------------
  // GEMINI 3.8 LIVE WEBSOCKET AUDIO INTEGRATION
  // -------------------------------------------------------------
  const startLiveVoice = async () => {
    if (isLiveActive) {
      stopLiveVoice();
      return;
    }

    try {
      setIsLiveConnecting(true);
      setLiveStatusText('Đang khởi tạo kết nối âm thanh Live API (gemini-3.8-live)...');

      // 1. Initialize Audio Queue Player
      if (!audioQueuePlayerRef.current) {
        audioQueuePlayerRef.current = new AudioQueuePlayer((playing) => {
          setIsGeminiSpeaking(playing);
        });
      }

      // 2. Open WebSocket to backend /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/live`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setLiveStatusText('WebSocket đã mở. Đang xác thực phiên Gemini 3.8 Live...');
        // Send init message
        ws.send(JSON.stringify({
          type: 'init',
          voiceName: selectedVoice,
          systemInstruction: customSystemInstruction,
          model: 'gemini-3.8-live'
        }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'status') {
            setIsLiveConnecting(false);
            setIsLiveActive(true);
            setLiveStatusText(msg.status === 'connected' ? 'Đang lắng nghe giọng bạn (Gemini 3.8 Live)...' : msg.message);
            onShowToast?.('Đã kết nối phiên đàm thoại giọng nói trực tiếp!', 'success');
            return;
          }

          if (msg.type === 'audio') {
            setIsLiveConnecting(false);
            setIsLiveActive(true);
            setIsLiveInterrupted(false);
            if (audioQueuePlayerRef.current && !isMicMuted) {
              audioQueuePlayerRef.current.enqueueChunk(msg.audio);
            }
            return;
          }

          if (msg.type === 'text') {
            currentTurnAssistantTextRef.current += msg.text;
            return;
          }

          if (msg.type === 'interrupted') {
            setIsLiveInterrupted(true);
            if (audioQueuePlayerRef.current) {
              audioQueuePlayerRef.current.interrupt();
            }
            return;
          }

          if (msg.type === 'turnComplete') {
            if (currentTurnAssistantTextRef.current.trim()) {
              const liveMsg: ChatMessage = {
                id: `live-${Date.now()}`,
                role: 'assistant',
                content: currentTurnAssistantTextRef.current.trim(),
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                modelUsed: 'gemini-3.8-live',
                isAudioSpoken: true
              };
              setMessages(prev => [...prev, liveMsg]);
              currentTurnAssistantTextRef.current = '';
            }
            return;
          }

          if (msg.type === 'error') {
            console.warn('Live API Error:', msg.error);
            setLiveStatusText(`Cảnh báo: ${msg.error}`);
            return;
          }
        } catch (err) {
          console.error('Error handling live message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Live WebSocket error:', err);
        setLiveStatusText('Kết nối Live API gặp sự cố. Đang thử lại...');
      };

      ws.onclose = () => {
        setIsLiveActive(false);
        setIsLiveConnecting(false);
        setLiveStatusText('Phiên đàm thoại Live đã dừng');
      };

      // 3. Start Microphone capture (16kHz linear PCM)
      if (!micRecorderRef.current) {
        micRecorderRef.current = new MicrophoneRecorder(
          (base64Chunk) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isMicMuted) {
              wsRef.current.send(JSON.stringify({
                type: 'audio',
                audio: base64Chunk
              }));
            }
          },
          (volume) => {
            setMicVolume(volume);
          }
        );
      }

      const micStarted = await micRecorderRef.current.start();
      if (!micStarted) {
        onShowToast?.('Không thể truy cập Microphone. Vui lòng cấp quyền micro trên trình duyệt!', 'error');
        stopLiveVoice();
      }

    } catch (err: any) {
      console.error('Start Live Voice Error:', err);
      setIsLiveConnecting(false);
      setIsLiveActive(false);
      setLiveStatusText('Lỗi kết nối micro hoặc máy chủ Live API');
      onShowToast?.(`Lỗi mở micro: ${err.message}`, 'error');
    }
  };

  const stopLiveVoice = () => {
    if (micRecorderRef.current) {
      micRecorderRef.current.stop();
    }
    if (audioQueuePlayerRef.current) {
      audioQueuePlayerRef.current.interrupt();
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    setIsLiveActive(false);
    setIsLiveConnecting(false);
    setIsGeminiSpeaking(false);
    setMicVolume(0);
    setLiveStatusText('Đã ngắt kết nối Live API');
  };

  const restartLiveSession = (sysInstruction: string, voice: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'init',
        voiceName: voice,
        systemInstruction: sysInstruction,
        model: 'gemini-3.8-live'
      }));
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopLiveVoice();
      if (audioQueuePlayerRef.current) {
        audioQueuePlayerRef.current.close();
      }
    };
  }, []);

  // -------------------------------------------------------------
  // TEXT CHAT WITH GEMINI (gemini-3.5-flash / gemini-3.1-flash-lite / pro)
  // -------------------------------------------------------------
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsGenerating(true);

    // If Live is active, also forward text input to live session
    if (isLiveActive && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'text',
        text: query
      }));
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].filter(m => m.role !== 'system'),
          model: selectedModel === 'gemini-3.8-live' ? 'gemini-3.5-flash' : selectedModel,
          systemInstruction: customSystemInstruction,
          role: selectedRole.id
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.model || selectedModel
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(data.message || 'Không thể tạo phản hồi');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: `Cảnh báo: ${err.message || 'Lỗi mạng khi gọi Gemini API'}. Vui lòng thử lại.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Play audio for a message using Gemini TTS or Web Speech API fallback
  const handlePlayTTS = async (msg: ChatMessage) => {
    if (playingMessageId === msg.id) {
      setPlayingMessageId(null);
      window.speechSynthesis?.cancel();
      return;
    }

    setPlayingMessageId(msg.id);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: msg.content.replace(/[*#_`]/g, '').slice(0, 500),
          voice: selectedVoice
        })
      });
      const data = await res.json();

      if (data.success && data.base64Audio) {
        if (!audioQueuePlayerRef.current) {
          audioQueuePlayerRef.current = new AudioQueuePlayer((p) => {
            if (!p) setPlayingMessageId(null);
          });
        }
        audioQueuePlayerRef.current.enqueueChunk(data.base64Audio);
      } else {
        // Fallback to browser Web Speech API
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const cleanText = msg.content.replace(/[*#_`]/g, '').slice(0, 400);
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = /[\u00C0-\u1EF9]/.test(cleanText) ? 'vi-VN' : 'en-US';
          utterance.rate = 1.0;
          utterance.onend = () => setPlayingMessageId(null);
          utterance.onerror = () => setPlayingMessageId(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setPlayingMessageId(null);
        }
      }
    } catch (err) {
      console.warn('TTS playback error:', err);
      setPlayingMessageId(null);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Đã làm mới chuỗi hội thoại. Thầy/Cô và các em học sinh có thể tiếp tục với vai trò **${selectedRole.name}**!`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      }
    ]);
    onShowToast?.('Đã xóa lịch sử trò chuyện', 'info');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] min-h-[640px] max-w-7xl mx-auto w-full space-y-4">
      {/* Top Banner & Control Station */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Title & Role Info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/20 flex-shrink-0">
            {selectedRole.avatar}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                {selectedRole.name}
              </h2>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${selectedRole.badgeColor}`}>
                {selectedRole.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {selectedRole.description}
            </p>
          </div>
        </div>

        {/* Global Controls: Live Mic Button & Model Selector */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-shrink-0">
          
          {/* Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 cursor-pointer transition focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {AI_AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id}>
                  {m.isVoiceCapable ? '🎙️ ' : m.category === 'fast' ? '⚡ ' : m.category === 'complex' ? '🧠 ' : '💡 '}
                  {m.name} ({m.tag})
                </option>
              ))}
            </select>
          </div>

          {/* Voice Selector Dropdown (for Live Audio and TTS) */}
          <div className="relative">
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as any)}
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-200 cursor-pointer transition focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="Zephyr">Giọng Zephyr (Thân thiện, Tự nhiên)</option>
              <option value="Kore">Giọng Kore (Điềm đạm, Chuẩn mực)</option>
              <option value="Puck">Giọng Puck (Năng động, Truyền cảm)</option>
              <option value="Charon">Giọng Charon (Trầm ấm, Bản lĩnh)</option>
              <option value="Fenrir">Giọng Fenrir (Rõ nét, Dứt khoát)</option>
            </select>
          </div>

          {/* Primary Live Voice Button (Gemini 3.8 Live API) */}
          <button
            type="button"
            onClick={startLiveVoice}
            disabled={isLiveConnecting}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md cursor-pointer select-none active:scale-95 ${
              isLiveActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25 animate-pulse'
                : isLiveConnecting
                ? 'bg-amber-500 text-white shadow-amber-500/25 cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
            }`}
          >
            {isLiveConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang kết nối Live...</span>
              </>
            ) : isLiveActive ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Dừng đàm thoại Live</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-amber-300" />
                <span>Bắt đầu đàm thoại Live (3.8 Live)</span>
              </>
            )}
          </button>

          {/* System Prompt Customizer Button */}
          <button
            type="button"
            onClick={() => setShowRoleConfig(!showRoleConfig)}
            title="Tùy chỉnh vai trò & System Instruction"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Clear Chat Button */}
          <button
            type="button"
            onClick={handleClearHistory}
            title="Làm mới cuộc trò chuyện"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Role Quick Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 whitespace-nowrap pl-1">
          Chọn vai trò trợ lý:
        </span>
        {AI_PRESET_ROLES.map((role) => {
          const isSelected = selectedRole.id === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => handleSelectRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
              }`}
            >
              <span>{role.avatar}</span>
              <span>{role.shortTitle}</span>
              {role.recommendedModel === 'gemini-3.8-live' && (
                <span className="text-[9px] bg-purple-500/20 text-purple-200 px-1 rounded font-black">
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Live Active Audio Waveform & Status Strip (When Live is Active or Connecting) */}
      {(isLiveActive || isLiveConnecting) && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-xl border border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 relative" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-2">
                <span>{liveStatusText}</span>
                {isGeminiSpeaking && (
                  <span className="bg-purple-500/30 text-purple-300 text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <Volume2 className="w-3 h-3 animate-pulse" />
                    Gemini đang nói...
                  </span>
                )}
                {isLiveInterrupted && (
                  <span className="bg-amber-500/30 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-black">
                    Đã ngắt lời & lắng nghe lại
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Mô hình: <strong className="text-indigo-300">gemini-3.8-live</strong> (Live API) • Giọng: <strong>{selectedVoice}</strong> • Mic rate: 16kHz
              </div>
            </div>
          </div>

          {/* Sound Wave Bars Visualization */}
          <div className="flex items-center gap-1.5 h-7 px-3 bg-white/5 rounded-xl border border-white/10">
            {[40, 70, 100, 60, 90, 50, 80, 100, 60, 40].map((h, i) => {
              const activeHeight = isGeminiSpeaking
                ? `${Math.max(20, Math.sin(Date.now() / 200 + i) * 80 + 20)}%`
                : micVolume > 0.05
                ? `${Math.max(20, micVolume * h)}%`
                : '20%';
              return (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-indigo-500 to-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: activeHeight }}
                />
              );
            })}
          </div>

          {/* Mic Mute / Unmute Toggle */}
          <button
            type="button"
            onClick={() => setIsMicMuted(!isMicMuted)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isMicMuted
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isMicMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMicMuted ? 'Đang tắt mic' : 'Mic hoạt động'}</span>
          </button>
        </div>
      )}

      {/* Role Configuration & Custom System Instruction Drawer */}
      {showRoleConfig && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Cấu hình System Instruction (Chỉ dẫn hệ thống cho Gemini)</span>
            </div>
            <button
              onClick={() => setShowRoleConfig(false)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              Đóng ✕
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Bạn có thể chỉnh sửa hướng dẫn sư phạm này để thay đổi giọng điệu, cách chấm thi, hoặc định dạng phản hồi của trợ lý AI:
          </p>
          <textarea
            rows={4}
            value={customSystemInstruction}
            onChange={(e) => setCustomSystemInstruction(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-y"
          />
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setCustomSystemInstruction(selectedRole.systemInstruction)}
              className="text-[11px] text-slate-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Khôi phục về mặc định của {selectedRole.shortTitle}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRoleConfig(false);
                if (isLiveActive) {
                  restartLiveSession(customSystemInstruction, selectedVoice);
                }
                onShowToast?.('Đã lưu cấu hình System Instruction mới!', 'success');
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
            >
              Áp dụng ngay
            </button>
          </div>
        </div>
      )}

      {/* Main Conversation Container: Scrollable Thread */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
        
        {/* Scrollable Messages Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold flex items-center gap-1.5 border border-slate-200">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>{msg.content}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                  }`}
                >
                  {isUser ? (user.name ? user.name[0].toUpperCase() : 'U') : selectedRole.avatar}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1 min-w-0">
                  <div className={`flex items-center gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[11px] font-bold text-slate-700">
                      {isUser ? user.name : selectedRole.shortTitle}
                    </span>
                    {msg.modelUsed && (
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
                        {msg.modelUsed}
                      </span>
                    )}
                    {msg.isAudioSpoken && (
                      <span className="text-[9px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <Mic className="w-2.5 h-2.5" /> LIVE
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                        : 'bg-slate-50 text-slate-800 rounded-tl-xs border border-slate-200/80 whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Message Action Bar (For Assistant) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pt-0.5">
                      {/* Text-to-Speech Play Button (Gemini TTS gemini-3.8-flash-lite-tts) */}
                      <button
                        type="button"
                        onClick={() => handlePlayTTS(msg)}
                        title="Nghe phát âm chuẩn (Gemini TTS)"
                        className={`p-1 rounded-md text-[11px] flex items-center gap-1 transition cursor-pointer ${
                          playingMessageId === msg.id
                            ? 'bg-purple-100 text-purple-700 font-bold'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {playingMessageId === msg.id ? (
                          <>
                            <Pause className="w-3 h-3 animate-pulse" />
                            <span>Đang đọc...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            <span>Đọc giọng mẫu ({selectedVoice})</span>
                          </>
                        )}
                      </button>

                      {/* Copy Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 text-[11px] flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-semibold text-indigo-600">
                {selectedRole.shortTitle} đang suy luận câu trả lời với mô hình {selectedModel}...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap pl-1">
            Gợi ý nhanh:
          </span>
          {selectedRole.quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 text-[11px] font-medium border border-slate-200/80 whitespace-nowrap transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            {/* Quick Live Mode Micro Trigger */}
            <button
              type="button"
              onClick={startLiveVoice}
              title={isLiveActive ? 'Đang đàm thoại Live 🎙️' : 'Bật đàm thoại giọng nói 2 chiều'}
              className={`p-3 rounded-2xl flex-shrink-0 transition cursor-pointer ${
                isLiveActive
                  ? 'bg-rose-600 text-white shadow-md animate-pulse'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {isLiveActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Auto-growing Text Input */}
            <div className="flex-1 relative">
              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isLiveActive
                    ? 'Bạn đang đàm thoại giọng nói! Bạn cũng có thể gõ thêm câu hỏi tại đây...'
                    : `Hỏi ${selectedRole.shortTitle} về soạn bài, ngữ pháp, luyện nói, hoặc bấm phím Enter để gửi...`
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none transition max-h-32"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition cursor-pointer disabled:cursor-not-allowed shadow-xs flex-shrink-0 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {/* Footer Helper Text */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-2">
            <span>
              Tích hợp bộ mô hình: <strong>gemini-3.8-live</strong> (Live API audio 16kHz/24kHz) • <strong>gemini-3.5-flash</strong> • <strong>gemini-3.1-flash-lite</strong>
            </span>
            {onOpenAiModal && (
              <button
                type="button"
                onClick={onOpenAiModal}
                className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Chuyển sang Studio Tạo Đề AI</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
