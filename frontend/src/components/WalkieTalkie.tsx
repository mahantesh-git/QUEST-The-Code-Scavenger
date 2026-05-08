import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';
import { Socket } from 'socket.io-client';
import { cn } from '../lib/utils';

interface WalkieTalkieProps {
  socket: Socket | null;
  teamId: string;
  role: 'runner' | 'solver';
  compact?: boolean;
}

export const WalkieTalkie: React.FC<WalkieTalkieProps> = ({ socket, teamId, role, compact = false }) => {
  const {
    isTransmitting,
    isIncoming,
    peerConnected,
    startTransmit,
    stopTransmit
  } = useWebRTC({ socket, teamId, role, enabled: true });

  const [lastState, setLastState] = useState<'idle' | 'transmitting' | 'incoming'>('idle');

  // Keybind for Solver (Spacebar)
  useEffect(() => {
    if (role !== 'solver') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow transmitting even when incoming — full-duplex, not simplex
      if (e.code === 'Space' && !isTransmitting) {
        const active = document.activeElement as HTMLElement | null;
        const isTyping = active?.tagName === 'INPUT' ||
          active?.tagName === 'TEXTAREA' ||
          active?.isContentEditable ||
          active?.closest('.monaco-editor') !== null;

        if (isTyping) return;

        e.preventDefault();
        startTransmit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const active = document.activeElement as HTMLElement | null;
        const isTyping = active?.tagName === 'INPUT' ||
          active?.tagName === 'TEXTAREA' ||
          active?.isContentEditable ||
          active?.closest('.monaco-editor') !== null;

        if (isTyping) return;

        e.preventDefault();
        stopTransmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [role, isTransmitting, startTransmit, stopTransmit]);

  useEffect(() => {
    if (isTransmitting) setLastState('transmitting');
    else if (isIncoming) setLastState('incoming');
    else setLastState('idle');
  }, [isTransmitting, isIncoming]);

  if (compact) {
    return (
      <div className="flex justify-center items-center">
        <div className="relative">
          {/* Connected idle glow — slow green breathe */}
          <AnimatePresence>
            {peerConnected && !isTransmitting && !isIncoming && (
              <motion.div
                key="connected-glow-compact"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-1 rounded-full border-2 border-emerald-400/60 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(isTransmitting || isIncoming) && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className={cn(
                  "absolute inset-0 rounded-full border",
                  isTransmitting ? "border-[var(--color-accent)]/60" : "border-blue-500/60"
                )}
              />
            )}
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onPointerDown={(e) => {
              // Capture pointer so pointerup fires even if finger slides off button
              e.currentTarget.setPointerCapture(e.pointerId);
              startTransmit();
            }}
            onPointerUp={(e) => {
              e.currentTarget.releasePointerCapture(e.pointerId);
              stopTransmit();
            }}
            onPointerCancel={stopTransmit}
            disabled={!peerConnected}
            className={cn(
              "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
              !peerConnected ? "bg-gray-800 text-gray-500 border border-gray-700" :
                isTransmitting && isIncoming
                  ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] border-purple-400"
                  : isTransmitting
                    ? "bg-[var(--color-accent)] text-white shadow-[0_0_20px_rgba(217,31,64,0.5)] border-transparent"
                    : isIncoming
                      ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border-blue-400"
                      : "bg-zinc-800 text-gray-400 border border-emerald-500/40"
            )}
          >
            {isIncoming && !isTransmitting ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
          </motion.button>

          {/* Small Visualizer */}
          {(isTransmitting || isIncoming) && (
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex gap-0.5 h-4 items-end">
              {[1, 2, 3].map((i, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: [4, 4 + (Math.random() * 10), 4] }}
                  transition={{ duration: 0.2, repeat: Infinity, delay: idx * 0.05 }}
                  className={cn(
                    "w-1 rounded-full",
                    isTransmitting ? "bg-[var(--color-accent)]" : "bg-blue-500"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex flex-col items-center justify-center w-full aspect-square max-w-[160px]">
        {/* Connected idle glow — slow green breathe */}
        <AnimatePresence>
          {peerConnected && !isTransmitting && !isIncoming && (
            <motion.div
              key="connected-glow"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-2 rounded-full border-2 border-emerald-400/70 shadow-[0_0_24px_rgba(52,211,153,0.55)]"
            />
          )}
        </AnimatePresence>

        {/* Animated Rings when transmitting */}
        <AnimatePresence>
          {(isTransmitting || isIncoming) && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                className={cn(
                  "absolute inset-0 rounded-full border-2",
                  isTransmitting ? "border-[var(--color-accent)]/50" : "border-blue-500/50"
                )}
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className={cn(
                  "absolute inset-0 rounded-full border",
                  isTransmitting ? "border-[var(--color-accent)]/30" : "border-blue-500/30"
                )}
              />
            </>
          )}
        </AnimatePresence>

        {/* The Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            startTransmit();
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId);
            stopTransmit();
          }}
          onPointerCancel={stopTransmit}
          disabled={!peerConnected}
          className={cn(
            "relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 border-4 shadow-2xl",
            !peerConnected ? "bg-gray-800 border-gray-700 shadow-none text-gray-500" :
              isTransmitting && isIncoming
                ? "bg-purple-600 border-purple-400 shadow-[0_0_50px_rgba(147,51,234,0.6)] text-white"
                : isTransmitting
                  ? "bg-[var(--color-accent)] border-transparent shadow-[0_0_50px_rgba(217,31,64,0.6)] text-white"
                  : isIncoming
                    ? "bg-blue-600 border-blue-400 shadow-[0_0_50px_rgba(37,99,235,0.5)] text-white"
                    : "bg-zinc-800 border-emerald-500/50 shadow-[0_0_20px_rgba(52,211,153,0.2)] text-emerald-400"
          )}
        >
          {isIncoming && !isTransmitting ? <Volume2 className="w-12 h-12 animate-pulse" /> : <Mic className="w-12 h-12" />}
        </motion.button>

        {/* Visualizer bars when active */}
        {(isTransmitting || isIncoming) && (
          <div className="absolute -bottom-8 flex gap-1 h-8 items-end">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((i, idx) => (
              <motion.div
                key={idx}
                animate={{ height: [8, 8 + (Math.random() * 20), 8] }}
                transition={{ duration: 0.2, repeat: Infinity, delay: idx * 0.05 }}
                className={cn(
                  "w-1.5 rounded-full",
                  isTransmitting ? "bg-[var(--color-accent)]" : "bg-blue-500"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
