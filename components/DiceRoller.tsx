"use client";
import { useState, useEffect } from "react";

interface Props {
  onRoll: () => [number, number] | null;
  disabled?: boolean;
  playerName: string;
  playerColor: string;
  playerEmoji: string;
}

const FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export default function DiceRoller({ onRoll, disabled, playerName, playerColor, playerEmoji }: Props) {
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<[number, number]>([1, 1]);
  const [result, setResult] = useState<[number, number] | null>(null);

  const handlePress = () => {
    if (disabled || rolling) return;
    setRolling(true);
    setResult(null);

    // Hızlı rastgele yüzler göster
    let frame = 0;
    const interval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      frame++;
      if (frame >= 10) {
        clearInterval(interval);
        const dice = onRoll();
        if (dice) {
          setDisplayDice(dice);
          setResult(dice);
        }
        setRolling(false);
      }
    }, 60);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Zarlar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Die value={displayDice[0]} rolling={rolling} />
        <Die value={displayDice[1]} rolling={rolling} />
        {result && (
          <div style={{
            background: "#0f3460", borderRadius: 8, padding: "4px 10px",
            color: "#f5a623", fontWeight: 700, fontSize: 16,
          }}>
            = {result[0] + result[1]}
          </div>
        )}
      </div>

      {/* Buton */}
      <button
        onClick={handlePress}
        disabled={disabled || rolling}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 12,
          border: "none",
          cursor: (disabled || rolling) ? "not-allowed" : "pointer",
          background: rolling
            ? "#2a3a5c"
            : `linear-gradient(135deg, ${playerColor}, ${playerColor}bb)`,
          color: "white",
          fontWeight: 700,
          fontSize: 16,
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.2s",
          boxShadow: rolling ? "none" : `0 4px 20px ${playerColor}55`,
          transform: rolling ? "scale(0.97)" : "scale(1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>{playerEmoji}</span>
        <span>{rolling ? "Atıyor..." : `${playerName} — Zar At`}</span>
        {!rolling && <span>🎲</span>}
      </button>

      <style>{`
        @keyframes diceShake {
          0%   { transform: rotate(0deg) scale(1); }
          20%  { transform: rotate(-15deg) scale(1.1); }
          40%  { transform: rotate(15deg) scale(0.95); }
          60%  { transform: rotate(-10deg) scale(1.05); }
          80%  { transform: rotate(10deg) scale(0.98); }
          100% { transform: rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  );
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div style={{
      width: 52, height: 52,
      background: rolling
        ? "linear-gradient(135deg, #2a3a5c, #16213e)"
        : "linear-gradient(135deg, #1e3a5f, #0f3460)",
      borderRadius: 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 34,
      border: rolling ? "2px solid #f5a623" : "2px solid #2a3a5c",
      boxShadow: rolling ? "0 0 12px #f5a62366" : "0 2px 8px #00000066",
      animation: rolling ? "diceShake 0.36s infinite" : "none",
      transition: "border 0.2s, box-shadow 0.2s",
      userSelect: "none",
    }}>
      {FACES[value - 1]}
    </div>
  );
}
