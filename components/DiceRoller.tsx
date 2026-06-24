"use client";
import { useState } from "react";
import Image from "next/image";
import { ChefId } from "@/lib/types";

interface Props {
  onRoll: () => [number, number] | null;
  disabled?: boolean;
  playerName: string;
  playerColor: string;
  chefId: ChefId;
}

export default function DiceRoller({ onRoll, disabled, playerName, playerColor, chefId }: Props) {
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState<[number, number]>([1, 1]);
  const [result, setResult] = useState<[number, number] | null>(null);

  const handlePress = () => {
    if (disabled || rolling) return;
    setRolling(true);
    setResult(null);

    let frame = 0;
    const interval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      frame++;
      if (frame >= 12) {
        clearInterval(interval);
        const dice = onRoll();
        if (dice) {
          setDisplayDice(dice);
          setResult(dice);
        }
        setRolling(false);
      }
    }, 55);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Zar + toplam */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
        <Die value={displayDice[0]} rolling={rolling} />
        <Die value={displayDice[1]} rolling={rolling} />
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          minWidth: 36,
        }}>
          {result && (
            <>
              <span style={{ color: "#8892a4", fontSize: 10 }}>toplam</span>
              <span style={{
                color: "#f5a623", fontWeight: 800, fontSize: 22,
                textShadow: "0 0 12px #f5a62388",
              }}>
                {result[0] + result[1]}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Buton */}
      <button
        onClick={handlePress}
        disabled={disabled || rolling}
        style={{
          width: "100%",
          padding: "0",
          height: 56,
          borderRadius: 14,
          border: "none",
          cursor: (disabled || rolling) ? "not-allowed" : "pointer",
          background: rolling
            ? "#1e2d45"
            : `linear-gradient(135deg, ${playerColor}dd, ${playerColor}88)`,
          color: "white",
          fontWeight: 700,
          fontSize: 15,
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.2s",
          boxShadow: rolling ? "none" : `0 4px 24px ${playerColor}44`,
          transform: rolling ? "scale(0.97)" : "scale(1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Şef portresi — butonda küçük */}
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          overflow: "hidden", border: `2px solid ${playerColor}`,
          flexShrink: 0,
          background: "#0f1923",
        }}>
          <Image
            src={`/assets/chefs/${chefId}-portre.png`}
            alt={playerName}
            width={40}
            height={40}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        </div>
        <span>{rolling ? "Atıyor..." : `${playerName} — Zar At`}</span>
      </button>

      <style>{`
        @keyframes diceShake {
          0%   { transform: rotate(0deg) scale(1); }
          20%  { transform: rotate(-18deg) scale(1.12); }
          40%  { transform: rotate(18deg) scale(0.93); }
          60%  { transform: rotate(-12deg) scale(1.06); }
          80%  { transform: rotate(12deg) scale(0.97); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes diceBounce {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <div style={{
      width: 60, height: 60,
      borderRadius: 12,
      overflow: "hidden",
      border: rolling ? "2px solid #f5a623" : "2px solid #1e3a5f",
      boxShadow: rolling
        ? "0 0 16px #f5a62366, 0 4px 12px #00000088"
        : "0 4px 12px #00000066",
      animation: rolling ? "diceShake 0.3s infinite" : "diceBounce 2s ease-in-out infinite",
      background: "#0f1923",
      flexShrink: 0,
      transition: "border 0.15s, box-shadow 0.15s",
    }}>
      <Image
        src={`/assets/dice/zar${value}.png`}
        alt={`${value}`}
        width={60}
        height={60}
        style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
