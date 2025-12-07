
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Music, Volume2, VolumeX, Clock, CloudRain, Zap, Wind, ArrowRight, Palette, Coffee, Moon, Trees, Layers } from 'lucide-react';

interface FocusTimerProps {
  isDarkMode?: boolean;
}

const ZenParticles = ({ color }: { color: string }) => {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 20, // Slower, smoother duration
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      tx: Math.random() * 40 - 20, // Random x translation
      ty: Math.random() * 40 - 20  // Random y translation
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 animate-fade-in">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: color,
            opacity: p.opacity,
            animation: `float-particle ${p.duration}s ease-in-out infinite alternate`,
            animationDelay: `-${p.delay}s`,
            boxShadow: `0 0 ${p.size * 2}px ${color}`
          }}
        />
      ))}
    </div>
  );
};

const FocusTimer: React.FC<FocusTimerProps> = ({ isDarkMode = true }) => {
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [isActive, setIsActive] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  
  // Settings (stored in minutes for input convenience)
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  
  // High precision time state (milliseconds)
  const [timeLeft, setTimeLeft] = useState(25 * 60 * 1000); 
  const [initialTime, setInitialTime] = useState(25 * 60 * 1000);
  
  // Refs for animation loop
  const endTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isZenMode, setIsZenMode] = useState(false);
  
  // Audio State
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundMood, setSoundMood] = useState<'focus' | 'rain' | 'zen' | 'forest' | 'night'>('focus');

  // Theme State
  type ThemeKey = 'blue' | 'purple' | 'rose' | 'amber' | 'emerald';
  const [colorTheme, setColorTheme] = useState<ThemeKey>('blue');
  const [bgEffects, setBgEffects] = useState(true);

  const themes: Record<ThemeKey, { stops: string[], text: string, preview: string, glow: string, bg: string, accent: string }> = {
    blue: { 
        stops: ['#22d3ee', '#3b82f6', '#8b5cf6'], 
        text: 'from-white to-blue-200',
        preview: 'from-cyan-400 to-blue-600',
        glow: 'rgba(59,130,246,0.6)',
        bg: isDarkMode ? 'from-blue-900/20 via-[#020617] to-[#020617]' : 'from-blue-100/50 via-white to-white',
        accent: '#3b82f6'
    },
    purple: { 
        stops: ['#c084fc', '#a855f7', '#7e22ce'], 
        text: 'from-purple-100 to-fuchsia-300',
        preview: 'from-purple-400 to-fuchsia-600',
        glow: 'rgba(168,85,247,0.6)',
        bg: isDarkMode ? 'from-purple-900/20 via-[#020617] to-[#020617]' : 'from-purple-100/50 via-white to-white',
        accent: '#a855f7'
    },
    rose: { 
        stops: ['#fb7185', '#f43f5e', '#e11d48'], 
        text: 'from-rose-100 to-pink-300',
        preview: 'from-rose-400 to-pink-600',
        glow: 'rgba(244,63,94,0.6)',
        bg: isDarkMode ? 'from-rose-900/20 via-[#020617] to-[#020617]' : 'from-rose-100/50 via-white to-white',
        accent: '#f43f5e'
    },
    amber: { 
        stops: ['#fbbf24', '#f59e0b', '#b45309'], 
        text: 'from-amber-100 to-orange-300',
        preview: 'from-amber-400 to-orange-600',
        glow: 'rgba(245,158,11,0.6)',
        bg: isDarkMode ? 'from-amber-900/20 via-[#020617] to-[#020617]' : 'from-amber-100/50 via-white to-white',
        accent: '#f59e0b'
    },
    emerald: {
        stops: ['#34d399', '#10b981', '#059669'], 
        text: 'from-emerald-100 to-teal-300',
        preview: 'from-emerald-400 to-teal-600',
        glow: 'rgba(16,185,129,0.6)',
        bg: isDarkMode ? 'from-emerald-900/20 via-[#020617] to-[#020617]' : 'from-emerald-100/50 via-white to-white',
        accent: '#10b981'
    }
  };

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodesRef = useRef<AudioNode[]>([]);

  // Update Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio Engine Logic
  const stopAudio = () => {
      sourceNodesRef.current.forEach(node => {
          try { (node as any).stop && (node as any).stop(); } catch(e) {}
          node.disconnect();
      });
      sourceNodesRef.current = [];
  };

  const initAudio = useCallback((mood: typeof soundMood) => {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
    }
    
    stopAudio();

    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    const gain = ctx.createGain();
    gain.gain.value = 0; 
    
    if (mood === 'focus' || mood === 'rain' || mood === 'forest') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (mood === 'focus') {
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; 
            } else if (mood === 'rain') {
                data[i] = (lastOut + (0.02 * white)) / 1.02; 
                 if (Math.random() > 0.98) data[i] += (Math.random() * 0.1);
                lastOut = data[i];
            } else if (mood === 'forest') {
                 data[i] = (lastOut + (0.05 * white)) / 1.05;
                 lastOut = data[i];
            }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = mood === 'focus' ? 400 : (mood === 'forest' ? 800 : 1000);
        
        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        sourceNodesRef.current.push(noise);

        if (mood === 'forest') {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 1500;
            const oscGain = ctx.createGain();
            oscGain.gain.value = 0.05;
            const lfo = ctx.createOscillator();
            lfo.type = 'triangle';
            lfo.frequency.value = 2; 
            lfo.connect(oscGain.gain);
            osc.connect(oscGain);
            oscGain.connect(gain);
            osc.start();
            lfo.start();
            sourceNodesRef.current.push(osc, lfo);
        }

    } else if (mood === 'zen' || mood === 'night') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        
        if (mood === 'zen') {
            osc1.type = 'sine';
            osc1.frequency.value = 110; 
            osc2.type = 'sine';
            osc2.frequency.value = 114; 
        } else {
             osc1.type = 'triangle';
             osc1.frequency.value = 4000;
             osc2.type = 'sine';
             osc2.frequency.value = 4050;
        }
        
        const oscGain = ctx.createGain();
        oscGain.gain.value = mood === 'zen' ? 0.1 : 0.03;
        
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(gain);
        
        osc1.start();
        osc2.start();
        sourceNodesRef.current.push(osc1, osc2);
    }

    gain.connect(ctx.destination);
    gainNodeRef.current = gain;

    if (ctx.state === 'suspended') {
        ctx.resume();
    }
  }, []);

  // Manage Sound Volume/Switching
  useEffect(() => {
    if (soundEnabled && isActive && mode === 'focus') {
        initAudio(soundMood);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0.5, audioContextRef.current!.currentTime, 1);
        }
    } else {
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setTargetAtTime(0, audioContextRef.current.currentTime, 0.5);
            setTimeout(() => stopAudio(), 500);
        }
    }
  }, [soundEnabled, isActive, soundMood, mode, initAudio]);

  // High Precision Timer Logic
  const stopTimer = useCallback(() => {
      setIsActive(false);
      endTimeRef.current = null;
      if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
      }
  }, []);

  const switchMode = useCallback((newMode: 'focus' | 'break') => {
      const newDuration = (newMode === 'focus' ? focusDuration : breakDuration) * 60 * 1000;
      setMode(newMode);
      setTimeLeft(newDuration);
      setInitialTime(newDuration);
      if (newMode === 'break') setSoundEnabled(false);
      stopTimer();
  }, [focusDuration, breakDuration, stopTimer]);

  useEffect(() => {
    if (isActive) {
        // Initialize end time relative to now + current remaining time
        if (!endTimeRef.current) {
            endTimeRef.current = Date.now() + timeLeft;
        }
        
        const loop = () => {
            const now = Date.now();
            const remaining = (endTimeRef.current || 0) - now;

            if (remaining <= 0) {
                // Timer Finished
                setTimeLeft(0);
                stopTimer();
                
                // Auto-switch logic
                if (mode === 'focus') {
                    switchMode('break');
                } else {
                    switchMode('focus');
                }
            } else {
                setTimeLeft(remaining);
                rafRef.current = requestAnimationFrame(loop);
            }
        };

        rafRef.current = requestAnimationFrame(loop);
    } else {
        // When paused, we don't update timeLeft, but we clear the loop
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        endTimeRef.current = null; // Reset reference so resuming recalculates from Date.now()
    }

    return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, mode, switchMode, stopTimer]); 

  const toggleTimer = () => {
      setIsActive(!isActive);
  };

  const resetTimer = () => {
    stopTimer();
    const duration = (mode === 'focus' ? focusDuration : breakDuration) * 60 * 1000;
    setTimeLeft(duration);
    setInitialTime(duration);
  };

  // Helper to set time from inputs (converted to ms)
  const handleDurationChange = (val: number, type: 'focus' | 'break') => {
      if (type === 'focus') {
          setFocusDuration(val);
          if (mode === 'focus' && !isActive) {
              setTimeLeft(val * 60 * 1000);
              setInitialTime(val * 60 * 1000);
          }
      } else {
          setBreakDuration(val);
          if (mode === 'break' && !isActive) {
               setTimeLeft(val * 60 * 1000);
               setInitialTime(val * 60 * 1000);
          }
      }
  };

  const formatTime = (ms: number) => {
      const totalSeconds = Math.ceil(ms / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // Visual Calculations
  const radius = 220;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = initialTime > 0 ? timeLeft / initialTime : 0;
  const strokeDashoffset = circumference - (progressRatio) * circumference;
  
  // Ticks Calculation
  const totalTicks = 60;
  // Calculate how many ticks should be lit up based on remaining time
  const activeTicks = Math.ceil(progressRatio * totalTicks);

  return (
    <div className={`animate-fade-in flex flex-col h-full items-center transition-all duration-1000 relative w-full ${isZenMode ? 'fixed inset-0 z-50 bg-[#020617] justify-center' : 'justify-start md:justify-center'}`}>
        
        {/* Custom Keyframes for enhanced motion */}
        <style>{`
          @keyframes float-slow {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            33% { transform: translate(30px, -50px) rotate(10deg); }
            66% { transform: translate(-20px, 20px) rotate(-5deg); }
          }
           @keyframes float-reverse {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, -20px) scale(1.1); }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.25; transform: scale(1.1); }
          }
          @keyframes float-particle {
             0% { transform: translate(0, 0); }
             33% { transform: translate(15px, -20px); }
             66% { transform: translate(-10px, -40px); }
             100% { transform: translate(5px, -60px); }
          }
          .animate-float-slow {
            animation: float-slow 20s ease-in-out infinite alternate;
          }
          .animate-float-reverse {
            animation: float-reverse 25s ease-in-out infinite alternate;
          }
          .animate-pulse-glow {
            animation: pulse-glow 8s ease-in-out infinite alternate;
          }
        `}</style>

        {/* Dynamic Background Layer with Grid Pattern */}
        <div 
            className={`absolute inset-0 transition-all duration-1000 -z-20`}
            style={{ 
                background: isDarkMode ? '#020617' : '#f8fafc',
                backgroundImage: `radial-gradient(${themes[colorTheme].accent}1A 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
        ></div>
        
        {/* Dynamic Background Gradients */}
        <div className={`absolute inset-0 bg-gradient-to-br ${themes[colorTheme].bg} transition-all duration-1000 -z-20 opacity-80`}></div>
        
        {/* Zen Mode Dark Overlay */}
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-1000 -z-15 pointer-events-none ${isZenMode ? 'opacity-100' : 'opacity-0'}`}></div>

        {/* Zen Particles */}
        {isZenMode && <ZenParticles color={themes[colorTheme].accent} />}

        {/* Floating Animated Orbs with Smoother Motion */}
        <div className={`absolute inset-0 overflow-hidden pointer-events-none -z-10 transition-opacity duration-1000 ${isZenMode ? 'opacity-20' : 'opacity-100'}`}>
            {bgEffects && (
                <>
                    <div 
                        className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[130px] opacity-20 animate-float-slow mix-blend-screen"
                        style={{ 
                            backgroundColor: themes[colorTheme].stops[0], 
                            transition: 'background-color 1s ease'
                        }}
                    ></div>
                    <div 
                        className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-[130px] opacity-15 animate-float-reverse mix-blend-screen"
                        style={{ 
                            backgroundColor: themes[colorTheme].stops[2], 
                            transition: 'background-color 1s ease'
                        }}
                    ></div>
                    {/* Extra center orb for depth */}
                    <div 
                        className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-10 animate-pulse-glow"
                        style={{ 
                            backgroundColor: themes[colorTheme].stops[1],
                            transition: 'background-color 1s ease'
                        }}
                    ></div>
                </>
            )}
        </div>

        {/* Real-time Clock */}
        <div className={`absolute top-6 left-6 flex items-center gap-2 text-slate-500 font-mono text-sm transition-all duration-500 group z-50 ${isZenMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
            <Clock size={16} />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        {/* Zen Mode Toggle */}
        <div className={`absolute top-0 right-0 w-full flex justify-end items-center p-6 z-50 transition-all duration-500 group ${isZenMode ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
            <div className={`flex items-center gap-2 mr-4 ${isZenMode ? 'text-slate-500' : 'opacity-0'}`}>
                 <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                 <span className="text-xs font-bold tracking-widest uppercase">Zen Mode</span>
            </div>
            <button 
                onClick={() => setIsZenMode(!isZenMode)}
                className={`p-3 rounded-full backdrop-blur-md border transition-all shadow-lg ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-white border-white/5' : 'bg-white/40 hover:bg-white/60 text-slate-500 hover:text-slate-900 border-black/5'}`}
                title={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
            >
                {isZenMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
        </div>

        {/* Ambient Center Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin] rounded-full blur-[120px] pointer-events-none transition-all duration-[3000ms] ease-in-out ${
            mode === 'break' 
            ? 'bg-emerald-500/10' 
            : isActive ? `opacity-60 scale-125` : `opacity-20 scale-90`
        }`} style={{ backgroundColor: mode === 'focus' ? themes[colorTheme].stops[1] + '15' : undefined }}></div>

        {/* MAIN VISUAL AREA */}
        <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 py-4">

            {/* Break Message */}
            {mode === 'break' && (
                <div className="absolute top-[5%] md:top-[10%] w-full max-w-md text-center z-20 animate-fade-in px-6">
                    <h2 className={`text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg ${themes[colorTheme].preview.replace('from-', 'text-').split(' ')[0]}`}>Time for a Break</h2>
                    <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} text-sm md:text-lg leading-relaxed`}>
                        Step away, stretch, or hydrate.<br/>
                        <span className={`${themes[colorTheme].text.split(' ')[2].replace('to-', 'text-')} font-medium`}>Recharge your mind.</span>
                    </p>
                </div>
            )}

            {/* HIGH-END SVG Timer */}
            <div className={`relative transition-all duration-1000 ease-in-out flex items-center justify-center my-4 ${mode === 'break' ? 'scale-90 translate-y-6' : 'scale-100'}`}>
                 {/* Responsive container using vmin to ensure it fits any screen */}
                 <div className="relative w-[65vmin] h-[65vmin] max-w-[400px] max-h-[400px] aspect-square flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 500 500">
                        <defs>
                             {/* Animated Gradient: Rotating colors for flowing effect */}
                            <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={themes[colorTheme].stops[0]} />
                                <stop offset="50%" stopColor={themes[colorTheme].stops[1]} />
                                <stop offset="100%" stopColor={themes[colorTheme].stops[2]} />
                                <animateTransform 
                                    attributeName="gradientTransform" 
                                    type="rotate" 
                                    from="0 0.5 0.5" 
                                    to="360 0.5 0.5" 
                                    dur="15s" // Slower rotation for elegance
                                    repeatCount="indefinite" 
                                />
                            </linearGradient>

                            <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={themes[colorTheme].stops[0]} /> 
                                <stop offset="50%" stopColor={themes[colorTheme].stops[1]} /> 
                                <stop offset="100%" stopColor={themes[colorTheme].stops[2]} /> 
                            </linearGradient>
                            
                            {/* High-End Glow Filter */}
                            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                                <feComposite in="coloredBlur" in2="SourceGraphic" operator="in" result="softGlow"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>

                        {/* 1. Holographic Tick Marks Ring */}
                        <g transform="translate(250, 250)">
                            {Array.from({ length: totalTicks }).map((_, i) => {
                                const isLit = i < activeTicks;
                                const isMajor = i % 5 === 0;
                                return (
                                    <line
                                        key={i}
                                        x1="0" y1="-235"
                                        x2="0" y2={-235 + (isMajor ? 15 : 6)}
                                        stroke="currentColor"
                                        strokeWidth={isMajor ? 2.5 : 1}
                                        className={`transition-all duration-300 ease-out ${
                                            mode === 'break'
                                                ? (isLit ? 'text-slate-400' : (isDarkMode ? 'text-slate-800' : 'text-slate-200'))
                                                : (isLit 
                                                    ? (isDarkMode ? 'text-slate-300' : 'text-slate-400') 
                                                    : (isDarkMode ? 'text-slate-800' : 'text-slate-200')
                                                )
                                        }`}
                                        style={{
                                             transform: `rotate(${i * 6}deg)`,
                                             opacity: isLit ? (isMajor ? 1 : 0.6) : 0.2
                                        }}
                                    />
                                );
                            })}
                        </g>

                        {/* 2. Outer Rotating Spinner (Subtle) */}
                        <g className={`origin-center opacity-30 transition-all duration-[5000ms] ${isActive ? 'animate-spin-slow' : ''}`} style={{transformBox: 'fill-box', transformOrigin: 'center'}}>
                            <circle cx="250" cy="250" r={250} stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeWidth="1" fill="none" strokeDasharray="2, 8" />
                        </g>

                        {/* 3. Glassy Background Track (Breathing) */}
                        <circle
                            cx="250"
                            cy="250"
                            r={radius}
                            stroke={isDarkMode ? "#1e293b" : "#e2e8f0"}
                            strokeWidth="12"
                            fill="none"
                            className={`drop-shadow-inner transition-opacity duration-1000 ${isActive ? 'opacity-40' : 'opacity-60 animate-pulse-slow'}`}
                        />
                        
                        {/* 4. Main Progress Ring */}
                        <circle
                            cx="250"
                            cy="250"
                            r={radius}
                            stroke={mode === 'focus' ? "url(#focusGradient)" : "url(#breakGradient)"}
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray={circumference} 
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            filter="url(#neon-glow)"
                            // CRITICAL: No transition when active to ensure 60fps smoothness via JS ref updates
                            className={`${isActive ? '' : 'transition-all duration-500 ease-out'} ${isActive ? 'opacity-100' : 'opacity-90'}`}
                        />
                        
                        {/* 5. Floating Progress Knob (Head) */}
                         <g style={{ 
                             transform: `rotate(${(1 - progressRatio) * 360}deg)`, 
                             transformOrigin: '250px 250px',
                             transition: isActive ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' 
                            }}>
                            {/* Comet Tail (Blurred Trail) */}
                             <circle 
                                cx="250" 
                                cy={250 - radius} 
                                r="24" 
                                fill={themes[colorTheme].stops[1]}
                                className={`${isActive ? 'opacity-30' : 'opacity-0'}`} 
                                style={{ filter: 'blur(12px)' }}
                             />
                            {/* Outer Halo */}
                             <circle 
                                cx="250" 
                                cy={250 - radius} 
                                r="12" 
                                fill={themes[colorTheme].stops[0]}
                                className={`${isActive ? 'opacity-60' : 'opacity-0'} animate-pulse`} 
                                style={{ filter: 'blur(3px)' }}
                             />
                             {/* Core */}
                             <circle 
                                cx="250" 
                                cy={250 - radius} 
                                r="6" 
                                fill="#fff" 
                                className={`${isActive || timeLeft !== initialTime ? 'opacity-100' : 'opacity-0'} shadow-[0_0_15px_rgba(255,255,255,1)]`} 
                             />
                         </g>

                         {/* 6. Inner Pulsing Decorative Ring */}
                         <circle 
                            cx="250" cy="250" r="180" 
                            stroke="currentColor" 
                            strokeWidth="1" 
                            fill="none"
                            strokeDasharray="4 4"
                            className={`text-slate-500 transition-all duration-1000 ${isActive ? 'opacity-50 animate-pulse-slow' : 'opacity-20'}`}
                         />

                    </svg>
                    
                    {/* Time Text - Perfectly Centered */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                        {/* Wrapper for slight visual vertical correction if needed, though flex-center usually works */}
                        <div className="flex flex-col items-center justify-center translate-y-1"> 
                            <div className={`text-[14vmin] md:text-8xl font-mono font-bold tracking-tighter tabular-nums transition-all duration-300 leading-none ${
                                mode === 'break' 
                                ? `text-transparent bg-clip-text bg-gradient-to-br ${themes[colorTheme].text} drop-shadow-lg`
                                : isActive 
                                    ? `text-transparent bg-clip-text bg-gradient-to-br ${themes[colorTheme].text} drop-shadow-xl scale-110` 
                                    : isDarkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}>
                                {formatTime(timeLeft)}
                            </div>
                            <div className={`mt-3 sm:mt-5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full border backdrop-blur-md text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                                mode === 'break'
                                ? `bg-${colorTheme}-500/20 text-${colorTheme}-500 border-${colorTheme}-500/30`
                                : isActive 
                                    ? `bg-opacity-20 text-white border-opacity-30 animate-pulse`
                                    : isDarkMode ? 'bg-slate-800/50 text-slate-500 border-white/5' : 'bg-slate-200/50 text-slate-500 border-black/5'
                            }`} style={{
                                backgroundColor: isActive && mode === 'focus' ? themes[colorTheme].stops[1] + '33' : undefined,
                                borderColor: isActive && mode === 'focus' ? themes[colorTheme].stops[1] + '4D' : undefined,
                                boxShadow: isActive && mode === 'focus' ? `0 0 20px ${themes[colorTheme].glow}` : undefined
                            }}>
                                {mode === 'break' ? 'Recharging' : isActive ? 'Flow State' : 'Focus Mode'}
                            </div>
                        </div>
                    </div>
                 </div>
            </div>

            {/* Controls Panel */}
            <div className={`w-full max-w-3xl transition-all duration-700 transform px-4 z-20 ${isZenMode ? 'translate-y-20 opacity-0 pointer-events-none scale-95' : 'translate-y-0 opacity-100 scale-100'}`}>
                <div className={`rounded-3xl p-1 shadow-2xl ${isDarkMode ? 'glass-panel' : 'bg-white border border-slate-200'}`}>
                    <div className={`rounded-[20px] p-6 md:p-8 lg:p-10 ${isDarkMode ? 'bg-[#0f172a]/80' : 'bg-slate-50'}`}>
                        
                        {/* Mode Specific Controls */}
                        {mode === 'focus' ? (
                            <>
                                {/* Inputs */}
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="flex-1 group">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block group-focus-within:text-blue-400 transition-colors">Goal</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={customGoal}
                                                onChange={(e) => setCustomGoal(e.target.value)}
                                                placeholder="What is your focus?"
                                                disabled={isActive}
                                                className={`w-full border rounded-xl pl-4 pr-4 py-3 focus:outline-none transition-all disabled:opacity-50 ${
                                                    isDarkMode 
                                                    ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-blue-500' 
                                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-24 group">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block group-focus-within:text-blue-400 transition-colors">Time (m)</label>
                                            <input 
                                                type="number"
                                                value={focusDuration}
                                                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 25, 'focus')}
                                                disabled={isActive}
                                                className={`w-full border rounded-xl px-2 py-3 text-center font-mono font-bold focus:outline-none transition-all disabled:opacity-50 ${
                                                    isDarkMode 
                                                    ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500' 
                                                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                                                }`}
                                            />
                                        </div>
                                        <div className="w-24 group">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2 block group-focus-within:text-emerald-400 transition-colors">Break (m)</label>
                                            <input 
                                                type="number"
                                                value={breakDuration}
                                                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 5, 'break')}
                                                disabled={isActive}
                                                className={`w-full border rounded-xl px-2 py-3 text-center font-mono font-bold focus:outline-none transition-all disabled:opacity-50 ${
                                                    isDarkMode 
                                                    ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500' 
                                                    : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Main Buttons */}
                                <div className="flex gap-4 w-full">
                                    <button
                                        onClick={toggleTimer}
                                        className={`flex-1 flex items-center justify-center py-4 rounded-xl font-bold text-lg tracking-wide transition-all active:scale-95 duration-300 relative overflow-hidden group ${
                                        isActive
                                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 hover:bg-amber-500/20'
                                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]'
                                        }`}
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none`}></div>
                                        {isActive ? <Pause className="mr-2 fill-current" size={20} /> : <Play className="mr-2 fill-current" size={20} />}
                                        {isActive ? 'Pause Session' : 'Start Focus'}
                                    </button>
                                    
                                    {!isActive && timeLeft !== focusDuration * 60 * 1000 && (
                                         <button
                                            onClick={resetTimer}
                                            className={`px-5 rounded-xl border transition-all active:scale-95 ${
                                                isDarkMode 
                                                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
                                            }`}
                                        >
                                            <RotateCcw size={20} />
                                        </button>
                                    )}

                                    {!isActive && (
                                        <button 
                                            onClick={() => switchMode('break')}
                                            className={`px-5 rounded-xl border transition-all active:scale-95 ${
                                                isDarkMode 
                                                ? 'bg-slate-800 border-slate-700 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50' 
                                                : 'bg-white border-slate-200 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
                                            }`}
                                            title="Skip to Break"
                                        >
                                            <Coffee size={20} />
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-center flex flex-col gap-6">
                                {/* Break Presets */}
                                <div className="flex justify-center gap-3">
                                    {[5, 10, 15, 20].map(m => (
                                        <button 
                                            key={m}
                                            onClick={() => {
                                                handleDurationChange(m, 'break');
                                                stopTimer();
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                                breakDuration === m 
                                                ? `bg-${colorTheme}-600 text-white border-${colorTheme}-500` 
                                                : isDarkMode 
                                                    ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white' 
                                                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
                                            }`}
                                        >
                                            {m}m
                                        </button>
                                    ))}
                                </div>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={toggleTimer}
                                        className={`px-8 py-3 rounded-xl font-bold transition-all active:scale-95 ${
                                            isActive 
                                            ? 'bg-slate-700 text-slate-300' 
                                            : `bg-${colorTheme}-600 text-white hover:bg-${colorTheme}-500 shadow-lg`
                                        }`}
                                    >
                                        {isActive ? 'Pause Break' : 'Resume Break'}
                                    </button>
                                    <button
                                        onClick={() => switchMode('focus')}
                                        className={`px-8 py-3 rounded-xl font-bold border transition-all active:scale-95 flex items-center gap-2 ${
                                            isDarkMode 
                                            ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700' 
                                            : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        End Early <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Soundscape & Theme Options - Only in Focus Mode */}
                        {mode === 'focus' && (
                            <div className={`mt-8 pt-8 border-t space-y-6 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                                {/* Soundscape Options */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <Music size={14} className="text-blue-400" /> Soundscape Mood
                                    </div>
                                    
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                        {[
                                            { id: 'focus', label: 'Focus', icon: Zap, color: 'blue' },
                                            { id: 'rain', label: 'Rain', icon: CloudRain, color: 'purple' },
                                            { id: 'forest', label: 'Forest', icon: Trees, color: 'emerald' },
                                            { id: 'night', label: 'Night', icon: Moon, color: 'indigo' },
                                            { id: 'zen', label: 'Zen', icon: Wind, color: 'teal' },
                                        ].map((opt) => (
                                            <button 
                                                key={opt.id}
                                                onClick={() => { setSoundMood(opt.id as any); setSoundEnabled(true); }}
                                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 group active:scale-95 ${
                                                    soundMood === opt.id && soundEnabled
                                                    ? `bg-${opt.color}-500/20 border-${opt.color}-500 shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                                                    : isDarkMode 
                                                        ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 text-slate-400'
                                                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                                                }`}
                                            >
                                                <div className={`p-1.5 rounded-full mb-1 transition-colors relative ${
                                                    soundMood === opt.id && soundEnabled 
                                                    ? `bg-${opt.color}-500 text-white shadow-lg` 
                                                    : isDarkMode ? 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-slate-600'
                                                }`}>
                                                    <opt.icon size={20} strokeWidth={2.5} />
                                                    {soundMood === opt.id && soundEnabled && (
                                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
                                                    )}
                                                </div>
                                                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                                    soundMood === opt.id && soundEnabled ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-500'
                                                }`}>{opt.label}</span>
                                            </button>
                                        ))}

                                        {/* Mute Button */}
                                        <button 
                                            onClick={() => setSoundEnabled(!soundEnabled)}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
                                                !soundEnabled
                                                ? isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-300 shadow-inner' : 'bg-slate-200 border-slate-300 text-slate-700 shadow-inner'
                                                : isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50 text-slate-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                                            }`}
                                        >
                                            <div className={`p-1.5 rounded-full mb-1 transition-colors ${
                                                !soundEnabled 
                                                ? isDarkMode ? 'bg-slate-600 text-white' : 'bg-slate-400 text-white'
                                                : isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                            </div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider">
                                                {soundEnabled ? 'On' : 'Mute'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Visual Theme & Effects Options */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                            <Palette size={14} className="text-purple-400" /> Visual Theme
                                        </div>
                                        {/* Background Motion Toggle */}
                                        <button 
                                            onClick={() => setBgEffects(!bgEffects)}
                                            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                                bgEffects 
                                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' 
                                                : isDarkMode 
                                                    ? 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300' 
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}
                                        >
                                            <Layers size={12} />
                                            Motion {bgEffects ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                    <div className="flex gap-4 justify-start flex-wrap">
                                        {(Object.keys(themes) as ThemeKey[]).map((key) => (
                                            <button
                                                key={key}
                                                onClick={() => setColorTheme(key)}
                                                className={`w-10 h-10 rounded-full bg-gradient-to-br ${themes[key].preview} ring-2 ring-offset-2 transition-all ${
                                                    colorTheme === key 
                                                    ? `ring-${isDarkMode ? 'white' : 'slate-900'} scale-110 shadow-lg` 
                                                    : `ring-transparent opacity-70 hover:opacity-100 ring-offset-${isDarkMode ? '[#0f172a]' : 'white'}`
                                                }`}
                                                title={`${key.charAt(0).toUpperCase() + key.slice(1)} Theme`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FocusTimer;
