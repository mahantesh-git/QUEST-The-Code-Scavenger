import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Timer, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HardModeHUDProps {
  startTime: string;
  paused?: boolean;
  pausedAt?: string | null;
}

export function HardModeHUD({ startTime, paused = false, pausedAt = null }: HardModeHUDProps) {
  const [jackpot, setJackpot] = useState(1000);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants for 20m duration
  const decayInterval = 30;
  const decayRate = 25; // 1000 / (1200 / 30) = 25
  const jackpotStart = 1000;
  const totalDuration = 1200; // 20 minutes in seconds

  useEffect(() => {
    const calculate = () => {
      const start = new Date(startTime).getTime();
      const now = paused && pausedAt ? new Date(pausedAt).getTime() : Date.now();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      
      const periods = Math.floor(elapsedSeconds / decayInterval);
      const currentJackpot = Math.max(0, jackpotStart - (periods * decayRate));
      
      if (currentJackpot === 0) {
        setJackpot(0);
        setTimeLeft(0);
        return;
      }

      const remainingInPeriod = decayInterval - (elapsedSeconds % decayInterval);
      
      setJackpot(currentJackpot);
      setTimeLeft(remainingInPeriod);
    };

    calculate();
    if (paused) return;
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [startTime, paused, pausedAt]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  // Calculate percentage of total time passed for radial border
  // Actually, user said "border should be acts as timer"
  // Usually this means the border of the circle represents the jackpot remaining or the decay cycle.
  // I'll make it represent the Jackpot progress (from 1000 to 0).
  const jackpotProgress = jackpot / jackpotStart;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  return (
    <div 
      ref={containerRef}
      className="fixed top-24 right-4 md:right-8 z-50 flex items-start justify-end"
    >
      <motion.div 
        initial={false}
        animate={{ 
          width: isExpanded ? 'auto' : 64,
          height: isExpanded ? 'auto' : 64,
          borderRadius: isExpanded ? 8 : 32,
        }}
        className={cn(
          "relative overflow-hidden glass-morphism border-[var(--color-accent)]/30 group pointer-events-auto",
          isExpanded ? "corner-card p-4 md:p-5 min-w-[200px]" : "cursor-pointer hover:border-[var(--color-accent)]/50"
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Radial Progress Border */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circumference}
                  animate={{ strokeDashoffset: circumference * (1 - jackpotProgress) }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="text-[var(--color-accent)]"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Content: Total Points Remaining */}
              <div className="relative flex flex-col items-center justify-center">
                <span className="text-[14px] font-black tracking-tighter text-white tabular-nums">
                  {jackpot}
                </span>
                <span className="text-[6px] font-mono text-[var(--color-accent)] uppercase tracking-tighter -mt-1 font-bold">
                  PTS
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {/* Status Label */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <Zap className={cn("w-3 h-3 fill-[var(--color-accent)]", jackpot > 0 && "animate-pulse")} />
                  <span className={cn("text-[8px] font-mono uppercase tracking-[0.2em] font-black",
                    jackpot > 0 ? "text-[var(--color-accent)]" : "text-white/40"
                  )}>
                    {jackpot > 0 ? 'Omega_Jackpot' : 'Jackpot_Depleted'}
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                  className="p-1 hover:bg-white/5 rounded transition-colors pointer-events-auto"
                >
                  <ChevronRight className="w-3 h-3 text-white/40" />
                </button>
              </div>
              
              {/* Jackpot Value */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-[var(--color-accent)] text-sm font-mono font-bold opacity-60">$</span>
                  <span className={cn("text-3xl font-black tracking-tighter tabular-nums text-white")}>
                    {jackpot.toLocaleString()}
                  </span>
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] text-white/30">Available_Credits</span>
              </div>

              {/* Progress Bar & Timer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[7px] font-mono uppercase tracking-widest">
                  <span className="text-white/40">Decay_Cycle</span>
                  <div className="flex items-center gap-1 text-white/60">
                    <Timer className="w-2.5 h-2.5" />
                    <span>{timeLeft}S</span>
                  </div>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={false}
                    animate={{ width: `${(timeLeft / 30) * 100}%` }}
                    className={cn("absolute top-0 left-0 h-full transition-colors duration-500 bg-[var(--color-accent)]")}
                  />
                </div>
              </div>

              {/* Secondary Info */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[6px] font-mono text-white/20 uppercase tracking-[0.2em]">
                  {jackpot > 0 ? 'Rate: -25 PTS / 30S' : 'Limit: Baseline reached'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative HUD Corners (only when expanded) */}
        {isExpanded && (
          <>
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/20" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/20" />
          </>
        )}
      </motion.div>
    </div>
  );
}
