import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi, getErrorMessage } from '../../services/api';
import { QuantumAuroraBackground } from '../../components/QuantumAuroraBackground';
import { AIInterviewerAvatar } from '../../components/AIInterviewerAvatar';
import { AudioWaveform } from '../../components/AudioWaveform';
import { ProctoringMonitor } from '../../components/ProctoringMonitor';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Clock, 
  ShieldAlert, 
  Square, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Monitor,
  Smartphone
} from 'lucide-react';

export const VoiceInterviewRoom: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  // Desktop environment check
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Hardware states
  const [hasMediaPermissions, setHasMediaPermissions] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  // Interview state
  const [interviewData, setInterviewData] = useState<any>(null);
  const [aiState, setAiState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState<string>('Connecting to Vignan AI Technical Interviewer...');
  const [questionCategory, setQuestionCategory] = useState<string>('Introduction');
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20 * 60);
  const [transcript, setTranscript] = useState<Array<{ sender: string; text: string; time: string }>>([]);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [spokenCandidateBuffer, setSpokenCandidateBuffer] = useState<string>('');

  // Proctoring Warnings
  const [warningsCount, setWarningsCount] = useState<number>(0);
  const [proctoringIncidents, setProctoringIncidents] = useState<any[]>([]);
  const [activeWarningBanner, setActiveWarningBanner] = useState<string | null>(null);

  // WebSocket & Speech references
  const wsRef = useRef<WebSocket | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check device type
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    setIsMobileDevice(isMobile);
  }, []);

  // Request Camera and Microphone access
  useEffect(() => {
    if (isMobileDevice) return;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } },
          audio: true,
        });
        setMediaStream(stream);
        setHasMediaPermissions(true);
      } catch (err) {
        console.error('Media permission denied:', err);
        setHasMediaPermissions(false);
      }
    };

    initMedia();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMobileDevice]);

  // Fetch Interview metadata & initialize WebSocket
  useEffect(() => {
    if (!interviewId || !hasMediaPermissions) return;

    const setupSession = async () => {
      try {
        const res = await interviewApi.getDetails(interviewId);
        setInterviewData(res.data);
        setTotalQuestions(res.data.questions?.length || 10);
        setSecondsRemaining((res.data.duration_minutes || 20) * 60);

        // Connect WebSocket for bidirectional audio/conversational stream
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = import.meta.env.VITE_API_BASE_URL
          ? import.meta.env.VITE_API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '')
          : `${protocol}//${window.location.hostname}:8000`;

        const socket = new WebSocket(`${wsHost}/api/v1/interviews/ws/${interviewId}`);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('Voice interview WebSocket established.');
        };

        socket.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          handleWebSocketMessage(msg);
        };

        socket.onerror = (err) => {
          console.error('WebSocket connection error:', err);
        };
      } catch (err) {
        console.error('Failed to load interview details:', err);
      }
    };

    setupSession();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [interviewId, hasMediaPermissions]);

  // Countdown Timer
  useEffect(() => {
    if (!hasMediaPermissions) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndInterview('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasMediaPermissions]);

  // Handle incoming AI messages
  const handleWebSocketMessage = (msg: any) => {
    if (msg.type === 'ai_greeting') {
      setCurrentQuestion(msg.first_question || msg.greeting);
      setQuestionCategory('Introduction & Core Skills');
      setQuestionIndex(0);
      speakText(msg.greeting + " " + (msg.first_question || ''));
      appendTranscript('Vignan AI Interviewer', msg.greeting);
    } else if (msg.type === 'ai_response') {
      const responseText = msg.spoken_text || msg.next_question;
      if (msg.next_question) {
        setCurrentQuestion(msg.next_question);
        setQuestionIndex(msg.question_index || 0);
      }
      speakText(responseText);
      appendTranscript('Vignan AI Interviewer', responseText);

      if (msg.is_finished) {
        setTimeout(() => handleEndInterview('completed'), 4000);
      }
    } else if (msg.type === 'proctoring_warning') {
      setWarningsCount(msg.warning_level);
      setActiveWarningBanner(`Integrity Warning (${msg.warning_level}/3): ${msg.message}`);
      setTimeout(() => setActiveWarningBanner(null), 8000);
    } else if (msg.type === 'session_terminated') {
      setWarningsCount(4);
      alert('Interview terminated due to repeated proctoring violations. Flagged for review.');
      handleEndInterview('violation_terminated');
    }
  };

  // Text-To-Speech Output for AI Interviewer Voice
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setAiState('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => {
      setAiState('listening');
      startSpeechRecognition();
    };

    utterance.onerror = () => {
      setAiState('listening');
      startSpeechRecognition();
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Speech Recognition Input for Candidate Voice
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Browser Web Speech API not supported; using text fallback.');
      return;
    }

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecognizing(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript.trim()) {
        setSpokenCandidateBuffer((prev) => `${prev} ${finalTranscript}`.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsRecognizing(false);
    };

    speechRecognitionRef.current = recognition;
    recognition.start();
  };

  // Submit candidate answer turn
  const handleSendAnswer = () => {
    const answer = spokenCandidateBuffer.trim();
    if (!answer) return;

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }

    appendTranscript('You (Candidate)', answer);
    setAiState('thinking');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'candidate_answer',
          text: answer,
          question_text: currentQuestion,
        })
      );
    }

    setSpokenCandidateBuffer('');
  };

  const appendTranscript = (sender: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscript((prev) => [...prev, { sender, text, time }]);
  };

  // Handle Proctoring Events
  const handleProctoringViolation = (eventType: string, details: string) => {
    setProctoringIncidents((prev) => [
      ...prev,
      { type: eventType, timestamp: new Date().toISOString(), details },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'proctoring_event',
          event_type: eventType,
          details,
        })
      );
    }
  };

  // Safe End Interview and Trigger Evaluation
  const handleEndInterview = async (reason: 'completed' | 'violation_terminated' | 'user_cancelled' = 'completed') => {
    if (speechRecognitionRef.current) {
      try { speechRecognitionRef.current.stop(); } catch {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setAiState('thinking');
    setCurrentQuestion('Completing interview and compiling evidence-based placement evaluation...');

    try {
      const payload = {
        final_transcript: transcript,
        proctoring_incidents: proctoringIncidents,
        end_reason: reason,
      };

      await interviewApi.endInterview(interviewId!, payload);
      navigate(`/student/results/${interviewId}`);
    } catch (err) {
      console.error('Failed to end interview:', err);
      // Route anyway to results page where evaluation service can load
      navigate(`/student/results/${interviewId}`);
    }
  };

  // Device check banner for mobile
  if (isMobileDevice) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center relative bg-[#0A0A1B]">
        <QuantumAuroraBackground />
        <div className="max-w-md glass-panel p-8 rounded-3xl border border-rose-500/40 text-center space-y-4">
          <Smartphone className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Laptop or Desktop Required</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            As per Vignan University Placement Regulations (Phase 10), spoken AI technical mock interviews 
            require a desktop or laptop environment with active webcam and microphone proctoring.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Camera permission pending state
  if (!hasMediaPermissions) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center relative bg-[#0A0A1B]">
        <QuantumAuroraBackground />
        <div className="max-w-md glass-panel p-8 rounded-3xl border border-cyan-500/40 text-center space-y-4">
          <Video className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <h2 className="text-xl font-bold text-white">Camera & Microphone Access Required</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Please grant browser permissions to access your webcam and microphone to begin your 
            spoken AI mock interview and local integrity monitoring.
          </p>
        </div>
      </div>
    );
  }

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between relative">
      <QuantumAuroraBackground />

      {/* Proctoring Warning Toast */}
      {activeWarningBanner && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/50 shadow-2xl flex items-center gap-3 text-rose-200 text-xs backdrop-blur-md animate-bounce">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span className="font-semibold">{activeWarningBanner}</span>
          </div>
        </div>
      )}

      {/* Top Session Status Bar */}
      <div className="glass-panel px-6 py-4 rounded-2xl border border-purple-500/25 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h1 className="text-sm font-bold text-white">Vignan AI Mock Interview Room</h1>
            <p className="text-[11px] text-cyan-300 font-medium">Session ID: {interviewId?.slice(0, 8)} • Standard Placement Protocol</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono font-bold text-white">
            <Clock className="w-4 h-4 text-pink-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Turn Progress */}
          <div className="px-3 py-1.5 rounded-lg bg-purple-900/30 border border-purple-500/20 text-xs font-semibold text-purple-200">
            Question {questionIndex + 1} of {totalQuestions}
          </div>

          {/* End Interview Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to conclude the interview and submit for evaluation?')) {
                handleEndInterview('user_cancelled');
              }
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/50 transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Main Interview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        
        {/* Left Column: AI Interviewer Avatar & Spoken Question */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-purple-500/25 flex flex-col justify-between relative overflow-hidden">
          
          {/* Question Banner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-500/30">
                {questionCategory}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                AI Status: <span className="text-white capitalize">{aiState}</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              "{currentQuestion}"
            </h2>
          </div>

          {/* AI Avatar Centerpiece */}
          <div className="py-6 flex justify-center items-center">
            <AIInterviewerAvatar state={aiState} />
          </div>

          {/* Spoken Answer Candidate Control */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mic className={`w-3.5 h-3.5 ${isRecognizing ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
                {isRecognizing ? 'Microphone Active — Speak your answer' : 'Click Speak to Answer'}
              </span>
              <button
                type="button"
                onClick={startSpeechRecognition}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 underline"
              >
                Reset Mic Listener
              </button>
            </div>

            <textarea
              rows={2}
              value={spokenCandidateBuffer}
              onChange={(e) => setSpokenCandidateBuffer(e.target.value)}
              placeholder="Your vocal answer transcript appears here. You can also type or refine before submitting..."
              className="w-full px-3 py-2 text-xs rounded-xl glass-input resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <AudioWaveform isRecording={isRecognizing} audioStream={mediaStream} />

              <button
                onClick={handleSendAnswer}
                disabled={!spokenCandidateBuffer.trim() || aiState === 'speaking'}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 shadow-md transition-all disabled:opacity-40 flex items-center gap-1.5"
              >
                <span>Submit Spoken Answer</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Proctoring Video Preview & Live Transcript */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Candidate Webcam & Proctoring Monitor */}
          <ProctoringMonitor
            videoStream={mediaStream}
            onIntegrityViolation={handleProctoringViolation}
            warningsCount={warningsCount}
          />

          {/* Live Transcript Pane */}
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/25 flex-grow flex flex-col h-64 sm:h-72">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Live Conversation Transcript
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                {transcript.length} turns recorded
              </span>
            </div>

            <div className="overflow-y-auto space-y-3 flex-grow pr-2 text-xs">
              {transcript.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl ${
                    t.sender.includes('You')
                      ? 'bg-cyan-950/40 border border-cyan-500/20 text-slate-200 ml-4'
                      : 'bg-purple-950/40 border border-purple-500/20 text-purple-100 mr-4'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1">
                    <span className={t.sender.includes('You') ? 'text-cyan-400' : 'text-purple-300'}>
                      {t.sender}
                    </span>
                    <span>{t.time}</span>
                  </div>
                  <p className="leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
