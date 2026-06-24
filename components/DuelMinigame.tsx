"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { DuelState, Player } from "@/lib/types";

interface Props {
  duel: DuelState;
  players: Player[];
  onResult: (challengerScore: number, defenderScore: number) => void;
}

export default function DuelMinigame({ duel, players, onResult }: Props) {
  const challenger = players.find((p) => p.id === duel.challengerId)!;
  const defender   = players.find((p) => p.id === duel.defenderId)!;

  const [timeLeft, setTimeLeft] = useState(duel.timeLimit);
  const [challengerScore, setChallengerScore] = useState(0);
  const [defenderScore,   setDefenderScore]   = useState(0);
  const [flames, setFlames] = useState<{ id: number; side: "challenger" | "defender"; x: number; y: number; active: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const cScore  = useRef(0);
  const dScore  = useRef(0);
  const nextId  = useRef(0);

  const spawnFlame = useCallback((side: "challenger" | "defender") => {
    const id = nextId.current++;
    const x  = Math.random() * 65 + 10;
    const y  = Math.random() * 55 + 15;
    setFlames((prev) => [...prev.slice(-24), { id, side, x, y, active: true }]);
    setTimeout(() => {
      setFlames((prev) => prev.map((f) => f.id === id ? { ...f, active: false } : f));
    }, 900);
  }, []);

  useEffect(() => {
    if (finished) return;
    const iv = setInterval(() => {
      spawnFlame(Math.random() > 0.5 ? "challenger" : "defender");
    }, 380);
    return () => clearInterval(iv);
  }, [finished, spawnFlame]);

  useEffect(() => {
    if (finished) return;
    const iv = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [finished]);

  useEffect(() => {
    if (finished) setTimeout(() => onResult(cScore.current, dScore.current), 1400);
  }, [finished, onResult]);

  const tapFlame = (id: number, side: "challenger" | "defender") => {
    if (finished) return;
    setFlames((prev) => prev.map((f) => f.id === id ? { ...f, active: false } : f));
    if (side === "challenger") { cScore.current++; setChallengerScore((s) => s + 1); }
    else                       { dScore.current++;  setDefenderScore((s)   => s + 1); }
  };

  const cWon = cScore.current > dScore.current;
  const dWon = dScore.current > cScore.current;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#08111c", display: "flex", flexDirection: "column", zIndex: 100 }}>

      {/* Header */}
      <div style={{
        padding: "10px 14px", background: "#111d2e",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #1e3a5f",
      }}>
        {/* Challenger */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: `2px solid ${challenger.color}`, background: "#0f1923" }}>
            <Image src={`/assets/chefs/${challenger.chefId}-portre.png`} alt={challenger.name} width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </div>
          <div>
            <div style={{ color: challenger.color, fontWeight: 700, fontSize: 13 }}>{challenger.name}</div>
            <div style={{ color: "#f5a623", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{challengerScore}</div>
          </div>
        </div>

        {/* Timer */}
        <div style={{
          background: finished ? "#1a1a1a" : timeLeft <= 2 ? "#e94560" : "#0f3460",
          borderRadius: 24, padding: "6px 18px",
          fontWeight: 800, fontSize: 20, color: "white",
          transition: "background 0.3s",
          boxShadow: timeLeft <= 2 && !finished ? "0 0 16px #e9456088" : "none",
        }}>
          {finished
            ? <Image src="/assets/ui/duel-bitis.png" alt="Bitti" width={80} height={32} style={{ objectFit: "contain", display: "block" }} />
            : `${timeLeft}s`}
        </div>

        {/* Defender */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "row-reverse" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: `2px solid ${defender.color}`, background: "#0f1923" }}>
            <Image src={`/assets/chefs/${defender.chefId}-portre.png`} alt={defender.name} width={36} height={36} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: defender.color, fontWeight: 700, fontSize: 13 }}>{defender.name}</div>
            <div style={{ color: "#f5a623", fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{defenderScore}</div>
          </div>
        </div>
      </div>

      {/* Alan */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Challenger tarafı */}
        <div style={{ flex: 1, position: "relative", background: finished && cWon ? "#1a0800" : "#0d0d1a", borderRight: "2px solid #1e3a5f" }}>
          {/* Büyük portre arkaplan */}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.08, pointerEvents: "none" }}>
            <Image src={`/assets/chefs/${challenger.chefId}-portre.png`} alt="" fill style={{ objectFit: "cover" }} />
          </div>

          {flames.filter((f) => f.side === "challenger" && f.active).map((f) => (
            <button key={f.id} onClick={() => tapFlame(f.id, "challenger")} style={{
              position: "absolute", left: `${f.x}%`, top: `${f.y}%`,
              transform: "translate(-50%,-50%)",
              width: 56, height: 56,
              background: "none", border: "none", cursor: "pointer", padding: 0,
              animation: "flameIn 0.9s ease-in-out",
            }}>
              <Image src="/assets/ui/ates.png" alt="ateş" width={56} height={56} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
            </button>
          ))}

          {finished && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {cWon
                ? <Image src="/assets/ui/kupa.png" alt="kazandı" width={100} height={100} style={{ objectFit: "contain" }} />
                : <Image src="/assets/ui/iflas.png" alt="kaybetti" width={80} height={80} style={{ objectFit: "contain", opacity: 0.8 }} />}
            </div>
          )}
        </div>

        {/* Defender tarafı */}
        <div style={{ flex: 1, position: "relative", background: finished && dWon ? "#1a0800" : "#0d0d1a" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.08, pointerEvents: "none" }}>
            <Image src={`/assets/chefs/${defender.chefId}-portre.png`} alt="" fill style={{ objectFit: "cover" }} />
          </div>

          {flames.filter((f) => f.side === "defender" && f.active).map((f) => (
            <button key={f.id} onClick={() => tapFlame(f.id, "defender")} style={{
              position: "absolute", left: `${f.x}%`, top: `${f.y}%`,
              transform: "translate(-50%,-50%)",
              width: 56, height: 56,
              background: "none", border: "none", cursor: "pointer", padding: 0,
              animation: "flameIn 0.9s ease-in-out",
            }}>
              <Image src="/assets/ui/ates.png" alt="ateş" width={56} height={56} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
            </button>
          ))}

          {finished && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {dWon
                ? <Image src="/assets/ui/kupa.png" alt="kazandı" width={100} height={100} style={{ objectFit: "contain" }} />
                : <Image src="/assets/ui/iflas.png" alt="kaybetti" width={80} height={80} style={{ objectFit: "contain", opacity: 0.8 }} />}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 16px", background: "#111d2e", textAlign: "center", color: "#8892a4", fontSize: 12, borderTop: "1px solid #1e3a5f" }}>
        {finished
          ? (cScore.current === dScore.current
              ? "Beraberlik! Savunucu kazandı."
              : `${cWon ? challenger.name : defender.name} kazandı!`)
          : "Kendi tarafındaki aleve dokun!"}
      </div>

      <style>{`
        @keyframes flameIn {
          0%   { transform: translate(-50%,-50%) scale(0.3); opacity: 0; }
          40%  { transform: translate(-50%,-50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1);   opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
