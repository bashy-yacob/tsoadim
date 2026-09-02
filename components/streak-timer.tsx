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
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) return current - 1;

        window.clearInterval(timer);
        setIsRunning(false);
        setIsSaving(true);
        setMessage(null);
        void addProgressEntry(goalId, durationMinutes).then((entry) => {
          setIsSaving(false);
          setMessage(entry ? "האימון נשמר בהצלחה" : "לא ניתן לשמור את האימון");
          if (entry) onCompleted?.();
        });
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [durationMinutes, goalId, isRunning, onCompleted, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const reset = () => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
    setMessage(null);
  };

  return (
    <section className="mb-5 rounded-[16px] bg-[#fff6f1] p-4">
      <p className="mb-2 text-[13px] font-medium text-[#6b5346]">טיימר לאימון</p>
      <div className="mb-3 text-center text-[34px] font-medium tracking-[2px] text-[#2d120b]">
        {minutes}:{seconds}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsRunning((running) => !running)}
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
