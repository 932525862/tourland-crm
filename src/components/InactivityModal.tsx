import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { saveSession } from "@/lib/store";
import { Clock } from "lucide-react";

const INACTIVITY_MS = 30 * 60 * 1000; // 30 daqiqa
const COUNTDOWN_SEC = 60;              // 1 daqiqa sanash

export function InactivityModal() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const logout = () => {
    clearTimers();
    saveSession(null);
    navigate({ to: "/login" });
  };

  const clearTimers = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);
  };

  const startInactivityTimer = () => {
    clearTimers();
    setShowModal(false);
    inactivityTimer.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(COUNTDOWN_SEC);
    }, INACTIVITY_MS);
  };

  // Modal ochilganda sanashni boshlash
  useEffect(() => {
    if (!showModal) return;

    countdownTimer.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer.current!);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [showModal]);

  // 30 daqiqa taymerini ishga tushirish
  useEffect(() => {
    startInactivityTimer();
    return () => clearTimers();
  }, []);

  const handleStillHere = () => {
    startInactivityTimer();
  };

  if (!showModal) return null;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (countdown / COUNTDOWN_SEC) * circumference;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />

      <div className="relative bg-card border border-border w-full max-w-sm rounded-[24px] shadow-[var(--shadow-lg)] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-warning/15 flex items-center justify-center text-warning-foreground">
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">
              Siz haliham ishlayabsizmi?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
             Tizimda faollik aniqlanmadi. Agar javob bermasangiz, sessiya avtomatik tarzda yopiladi.
            </p>
          </div>

          {/* Countdown ring */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="absolute" width="72" height="72" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                className="text-warning-foreground transition-all duration-1000"
                transform="rotate(-90 36 36)"
              />
            </svg>
            <span className="text-2xl font-bold text-foreground">{countdown}</span>
          </div>
        </div>

        <div className="p-4 bg-secondary/30 border-t border-border">
          <button
            type="button"
            onClick={handleStillHere}
            className="w-full py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary-hover transition-all shadow-md"
          >
            Ha, ishlayabman
          </button>
        </div>
      </div>
    </div>
  );
}
