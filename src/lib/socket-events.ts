export const SocketEvents = {
  // Server -> Client
  GAME_STATE_UPDATE: "game:state",
  TIMER_TICK: "timer:tick",
  TIMER_EXPIRED: "timer:expired",
  ACTION_RESOLVED: "action:resolved",
  PHASE_CHANGED: "phase:changed",
  PLAYER_JOINED: "player:joined",
  PLAYER_DISCONNECTED: "player:disconnected",
  ERROR: "game:error",

  // Client -> Server
  JOIN_GAME: "join",
  SUBMIT_PROMPT: "prompt:submit",
  GM_ADVANCE: "gm:advance",
  GM_PAUSE: "gm:pause",
  GM_RESUME: "gm:resume",
  GM_EDIT_WORLD_EVENT: "gm:edit-world-event",
  GM_SKIP_WORLD_EVENT: "gm:skip-world-event",
} as const;
