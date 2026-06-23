"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { DuelState, Player } from "@/lib/types";

interface Props {
  duel: DuelState;
  players: Player[];
  onResult: (challengerScore: number, defenderScore: number) => void;
}

const FLAME_COUNT = 8;

export default function DuelMinigame({ duel, players, onResult }: Props) {
  const challenger = players.find((p) => p.id === duel.challengerId)!;
  const defender = players.find((p) => p.id === duel.defenderId)!;

  const [timeLeft, setTimeLeft] = useState(duel.timeLimit);
  const [challengerScore, setChallengerScore] = useState(0);
  const [defenderScore, setDefenderScore] = useState(0);
  const [flames, setFlames] = useState<{ id: number; side: "challenger" | "defender"; x: number; y: number; active: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  const cScore = useRef(0);
  const dScore = useRef(0);
  const nextId = useRef(0);

  const spawnFlame = useCallback((side: "challenger" | "defender") => {
    const id = nextId.current++;
    const x = Math.random() * 70 + 15;
    const y = Math.random() * 60 + 20;
    setFlames((prev) => [...prev.slice(-20), { id, side, x, y, active: true }]);
    setTimeout(() => {
      setFlames((prev) => prev.map((f) => f.id === id ? { ...f, active: false } : f));
    }, 900);
  }, []);

  // Spawn flames
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      spawnFlame(Math.random() > 0.5 ? "challenger" : "defender");
    }, 400);
    return () => clearInterval(interval);
  }, [finished, spawnFlame]);

  // Timer
  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setFinished(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [finished]);

  useEffect(() => {
    if (finished) {
      setTimeout(() => onResult(cScore.current, dScore.current), 1200);
    }
  }, [finished, onResult]);

  const tapFlame = (id: number, side: "challenger" | "defender") => {
    if (finished) return;
    setFlames((prev) => prev.map((f) => f.id === id ? { ...f, active: false } : f));
    if (side === "challenger") {
      cScore.current += 1;
      setChallengerScore((s) => s + 1);
    } else {
      dScore.current += 1;
      setDefenderScore((s) => s + 1);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0a0a0a",
      display: "flex", flexDirection: "column",
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 16px", background: "#1a1a2e",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid #2a3a5c",
      }}>
        <div style={{ color: challenger.color, fontWeight: 700, fontSize: 14 }}>
          {challenger.emoji} {challenger.name}
          <span style={{ color: "#f5a623", marginLeft: 8 }}>{challengerScore}</span>
        </div>
        <div style={{
          background: timeLeft <= 2 ? "#e94560" : "#0f3460",
          borderRadius: 20, padding: "4px 16px", fontWeight: 700, fontSize: 18,
          color: "white", transition: "background 0.3s",
        }}>
          {finished ? "🏁" : `${timeLeft}s`}
        </div>
        <div style={{ color: defender.color, fontWeight: 700, fontSize: 14, textAlign: "right" }}>
          <span style={{ color: "#f5a623", marginRight: 8 }}>{defenderScore}</span>
          {defender.name} {defender.emoji}
        </div>
      </div>

      {/* Ateş Dansı alanı — yarı yarıya */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sol: Challenger */}
        <div style={{
          flex: 1, position: "relative",
          background: finished && cScore.current > dScore.current ? "#1a0d0d" : "#0d0d1a",
          borderRight: "2px solid #2a3a5c",
        }}>
          {!finished && <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            color: challenger.color + "33", fontSize: 48, fontWeight: 800, pointerEvents: "none",
            userSelect: "none",
          }}>{challenger.emoji}</div>}

          {flames
            .filter((f) => f.side === "challenger" && f.active)
            .map((f) => (
              <button
                key={f.id}
                onClick={() => tapFlame(f.id, "challenger")}
                style={{
                  position: "absolute",
                  left: `${f.x}%`, top: `${f.y}%`,
                  transform: "translate(-50%,-50%)",
                  width: 48, height: 48, fontSize: 28,
                  background: "none", border: "none", cursor: "pointer",
                  animation: "pulse 0.9s ease-in-out",
                }}
              >
                🔥
              </button>
            ))}

          {finished && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 48,
            }}>
              {cScore.current > dScore.current ? "🏆" : "😢"}
            </div>
          )}
        </div>

        {/* Sağ: Defender */}
        <div style={{
          flex: 1, position: "relative",
          background: finished && dScore.current > cScore.current ? "#1a0d0d" : "#0d0d1a",
        }}>
          {!finished && <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            color: defender.color + "33", fontSize: 48, fontWeight: 800, pointerEvents: "none",
            userSelect: "none",
          }}>{defender.emoji}</div>}

          {flames
            .filter((f) => f.side === "defender" && f.active)
            .map((f) => (
              <button
                key={f.id}
                onClick={() => tapFlame(f.id, "defender")}
                style={{
                  position: "absolute",
                  left: `${f.x}%`, top: `${f.y}%`,
                  transform: "translate(-50%,-50%)",
                  width: 48, height: 48, fontSize: 28,
                  background: "none", border: "none", cursor: "pointer",
                }}
              >
                🔥
              </button>
            ))}

          {finished && (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 48,
            }}>
              {dScore.current > cScore.current ? "🏆" : "😢"}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 16px", background: "#1a1a2e", textAlign: "center",
        color: "#8892a4", fontSize: 12,
        borderTop: "1px solid #2a3a5c",
      }}>
        {finished
          ? (cScore.current === dScore.current
            ? "Beraberlik! Savunucu kazandı 🎯"
            : `${cScore.current > dScore.current ? challenger.name : defender.name} kazandı!`)
          : "Kendi tarafındaki ateşlere dokun! 🔥"}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: translate(-50%,-50%) scale(0.5); opacity: 0; }
          30% { transform: translate(-50%,-50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
