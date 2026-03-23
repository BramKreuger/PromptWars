"use client";

import { useEffect, useRef, useCallback } from "react";

type SoundFn = () => void;

interface UseSoundReturn {
  playRoundStart: SoundFn;
  playTimerTick: SoundFn;
  playTimerUrgent: SoundFn;
  playPromptLocked: SoundFn;
  playActionResolve: SoundFn;
  playWorldEvent: SoundFn;
  playVictory: SoundFn;
}

export function useSound(enabled: boolean): UseSoundReturn {
  const toneRef = useRef<typeof import("tone") | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const initTone = async () => {
      const Tone = await import("tone");
      toneRef.current = Tone;
    };
    initTone();

    // Start audio context on first user interaction
    const handleClick = async () => {
      if (startedRef.current || !toneRef.current) return;
      await toneRef.current.start();
      startedRef.current = true;
    };

    document.addEventListener("click", handleClick, { once: true });
    return () => document.removeEventListener("click", handleClick);
  }, [enabled]);

  const play = useCallback(
    (notes: string[], duration: string, delay = 0) => {
      if (!enabled || !toneRef.current || !startedRef.current) return;
      const Tone = toneRef.current;
      const synth = new Tone.Synth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.1 },
        volume: -12,
      }).toDestination();

      const now = Tone.now() + delay;
      notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, duration, now + i * 0.12);
      });
    },
    [enabled],
  );

  return {
    playRoundStart: useCallback(() => play(["C5", "E5", "G5", "C6"], "8n"), [play]),
    playTimerTick: useCallback(() => play(["C6"], "32n"), [play]),
    playTimerUrgent: useCallback(() => play(["E6"], "32n"), [play]),
    playPromptLocked: useCallback(() => play(["C5", "E5"], "16n"), [play]),
    playActionResolve: useCallback(() => play(["G4", "C5"], "16n"), [play]),
    playWorldEvent: useCallback(() => play(["E5", "C5", "A4"], "8n"), [play]),
    playVictory: useCallback(
      () => play(["C5", "E5", "G5", "C6", "E6", "G6"], "8n"),
      [play],
    ),
  };
}
