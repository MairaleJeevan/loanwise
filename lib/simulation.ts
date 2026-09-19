"use client";

/**
 * Presenter-controlled failure simulation. Lets the demo show edge cases
 * (network failure, upload failure, AI outage, session timeout) on demand.
 * Mock services read these flags; real services would simply ignore them.
 */
import { useSyncExternalStore } from "react";

export interface SimulationFlags {
  /** One-shot: the next service call fails with a network error. */
  networkFailure: boolean;
  /** Persistent: every upload fails until switched off. */
  uploadFailure: boolean;
  /** Persistent: the assistant endpoint is unreachable. */
  aiUnavailable: boolean;
}

const KEY = "loanwise.simulation.v1";
const DEFAULTS: SimulationFlags = { networkFailure: false, uploadFailure: false, aiUnavailable: false };

let flags: SimulationFlags = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) flags = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* storage unavailable — keep defaults */
  }
}

function emit() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(flags));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

export const simulation = {
  get(): SimulationFlags {
    load();
    return flags;
  },
  set(patch: Partial<SimulationFlags>) {
    load();
    flags = { ...flags, ...patch };
    emit();
  },
  /** Returns true (and clears the flag) if a one-shot network failure is armed. */
  consumeNetworkFailure() {
    load();
    if (!flags.networkFailure) return false;
    flags = { ...flags, networkFailure: false };
    emit();
    return true;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSimulation() {
  return useSyncExternalStore(simulation.subscribe, simulation.get, () => DEFAULTS);
}

/* Session-timeout trigger: a tiny event bus the SessionTimeout component listens to. */
const TIMEOUT_EVENT = "loanwise:session-timeout";
export function triggerSessionTimeout() {
  window.dispatchEvent(new Event(TIMEOUT_EVENT));
}
export function onSessionTimeout(cb: () => void) {
  window.addEventListener(TIMEOUT_EVENT, cb);
  return () => window.removeEventListener(TIMEOUT_EVENT, cb);
}

export class NetworkError extends Error {
  constructor(message = "We couldn't reach our servers. Please check your connection and try again.") {
    super(message);
    this.name = "NetworkError";
  }
}
