"use client";

import { useEffect, useState } from "react";
import { addProgressEntry } from "@/lib/database";

type StreakTimerProps = {
  goalId: string;
  durationMinutes: number;
  onCompleted?: () => void;
};

export function StreakTimer({ goalId, durationMinutes, onCompleted }: StreakTimerProps) {
  const totalSeconds = Math.max(1, Math.round(durationMinutes * 60));
  const storageKey = `streak-timer:${goalId}`;
  const getSavedTimer = () => {
    if (typeof window === "undefined") return null;

    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return null;

    try {
      const parsed = JSON.parse(saved) as {
        durationSeconds?: number;
        secondsLeft?: number;
        isRunning?: boolean;
        endAt?: number | null;
      };
      if (parsed.durationSeconds !== totalSeconds) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const [secondsLeft, setSecondsLeft] = useState(() => {
    const saved = getSavedTimer();
    if (!saved) return totalSeconds;
    const remaining = saved.isRunning && saved.endAt
      ? Math.ceil(Math.max(0, saved.endAt - Date.now()) / 1000)
      : Number(saved.secondsLeft ?? totalSeconds);
    return Math.min(totalSeconds, Math.max(0, remaining));
  });
  const [isRunning, setIsRunning] = useState(() => {
    return getSavedTimer()?.isRunning === true;
  });
  const [endAt, setEndAt] = useState<number | null>(() => getSavedTimer()?.endAt ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify({
      durationSeconds: totalSeconds,
      secondsLeft,
      isRunning,
      endAt,
    }));
  }, [endAt, isRunning, secondsLeft, storageKey, totalSeconds]);

  useEffect(() => {
    if (!isRunning || !endAt || isSaving) return;

    const updateTimer = () => {
      const remaining = Math.ceil(Math.max(0, endAt - Date.now()) / 1000);
      setSecondsLeft(remaining);

      if (remaining > 0) return;

      setIsRunning(false);
      setEndAt(null);
      setIsSaving(true);
      setMessage(null);
      window.localStorage.removeItem(storageKey);
      void addProgressEntry(goalId, durationMinutes).then((entry) => {
        setIsSaving(false);
        setMessage(entry ? "האימון נשמר בהצלחה" : "לא ניתן לשמור את האימון");
        if (entry) onCompleted?.();
      });
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 1000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") updateTimer();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [durationMinutes, endAt, goalId, isRunning, isSaving, onCompleted, secondsLeft, storageKey]);

  useEffect(() => {
    if (!isRunning || !("wakeLock" in navigator)) return;

    let wakeLock: { release: () => Promise<void> } | null = null;
    void (navigator as Navigator & {
      wakeLock?: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> };
    }).wakeLock?.request("screen").then((lock) => {
      wakeLock = lock;
    }).catch(() => undefined);

    return () => {
      void wakeLock?.release();
    };
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const progressPercent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  const reset = () => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setEndAt(null);
    setMessage(null);
    window.localStorage.removeItem(storageKey);
  };

  const toggleRunning = () => {
    if (isRunning) {
      const remaining = endAt ? Math.ceil(Math.max(0, endAt - Date.now()) / 1000) : secondsLeft;
      setSecondsLeft(remaining);
      setEndAt(null);
      setIsRunning(false);
      return;
    }

    setEndAt(Date.now() + secondsLeft * 1000);
    setIsRunning(true);
  };

  return (
    <section className="mb-5 rounded-[16px] bg-[#fff6f1] p-4">
      <p className="mb-2 text-[13px] font-medium text-[#6b5346]">טיימר לאימון</p>
      <div className="mb-3 text-center text-[34px] font-medium tracking-[2px] text-[#2d120b]">
        {minutes}:{seconds}
      </div>
      <div className="mb-3 h-[7px] overflow-hidden rounded-full bg-[#f0dfd5]">
        <div className="h-full rounded-full bg-[#D85A30] transition-[width]" style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="mb-3 text-center text-[12px] text-[#6b5346]">התקדמות האימון: {progressPercent}%</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={toggleRunning}
          disabled={isSaving || secondsLeft === 0}
          className="flex-1 rounded-[10px] bg-[#D85A30] px-3 py-2 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {isRunning ? "השהה" : "התחל"}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={isSaving}
          className="rounded-[10px] bg-[#f0dfd5] px-3 py-2 text-[13px] font-medium text-[#2d120b] disabled:opacity-50"
        >
          איפוס
        </button>
      </div>
      {message && <p className="mt-2 text-center text-[12px] text-[#6b5346]">{message}</p>}
    </section>
  );
}
