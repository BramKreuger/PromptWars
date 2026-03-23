import { getIO } from "./socket";
import { SocketEvents } from "./socket-events";

interface TimerState {
  interval: ReturnType<typeof setInterval>;
  remaining: number;
  paused: boolean;
  onExpire: () => void;
}

const timers = new Map<string, TimerState>();

export function startTimer(
  gameId: string,
  durationSeconds: number,
  onExpire: () => void
): void {
  clearTimer(gameId);

  const state: TimerState = {
    interval: setInterval(() => tick(gameId), 1000),
    remaining: durationSeconds,
    paused: false,
    onExpire,
  };

  timers.set(gameId, state);

  // Emit initial tick
  getIO()
    .to(`game:${gameId}`)
    .emit(SocketEvents.TIMER_TICK, { secondsRemaining: state.remaining });
}

function tick(gameId: string): void {
  const state = timers.get(gameId);
  if (!state || state.paused) return;

  state.remaining--;

  getIO()
    .to(`game:${gameId}`)
    .emit(SocketEvents.TIMER_TICK, { secondsRemaining: state.remaining });

  if (state.remaining <= 0) {
    getIO().to(`game:${gameId}`).emit(SocketEvents.TIMER_EXPIRED, {});
    const onExpire = state.onExpire;
    clearTimer(gameId);
    onExpire();
  }
}

export function pauseTimer(gameId: string): void {
  const state = timers.get(gameId);
  if (!state) return;
  state.paused = true;
}

export function resumeTimer(gameId: string): void {
  const state = timers.get(gameId);
  if (!state) return;
  state.paused = false;
}

export function clearTimer(gameId: string): void {
  const state = timers.get(gameId);
  if (state) {
    clearInterval(state.interval);
    timers.delete(gameId);
  }
}

export function getTimerRemaining(gameId: string): number | null {
  const state = timers.get(gameId);
  return state ? state.remaining : null;
}
