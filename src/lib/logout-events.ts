export type LogoutReason = "manual" | "401" | "session-expired" | "forced";

export interface LogoutEvent {
  reason: LogoutReason;
  redirectTo?: string;
  initiatedAt: number;
}

type LogoutListener = (event: LogoutEvent) => void | Promise<void>;

const listeners = new Set<LogoutListener>();
let inFlight: Promise<void> | null = null;

export function subscribeToLogout(listener: LogoutListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function requestLogout(event: Partial<LogoutEvent> = {}): Promise<void> {
  if (inFlight) {
    return inFlight;
  }

  const fullEvent: LogoutEvent = {
    reason: event.reason ?? "manual",
    redirectTo: event.redirectTo,
    initiatedAt: Date.now(),
  };

  if (listeners.size === 0) {
    inFlight = Promise.resolve().finally(() => {
      inFlight = null;
    });
    return inFlight;
  }

  const tasks = Array.from(listeners, (listener) => {
    try {
      return Promise.resolve(listener(fullEvent));
    } catch (error) {
      return Promise.reject(error);
    }
  });

  inFlight = Promise.all(tasks)
    .then(() => undefined)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function isLogoutInProgress() {
  return inFlight !== null;
}
