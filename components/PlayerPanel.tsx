"use client";
import { GameState, Player } from "@/lib/types";
import { getPlayerProperties, calculateNetWorth } from "@/lib/game-engine";
import { BOARD } from "@/lib/board-data";

interface Props {
  state: GameState;
}

export default function PlayerPanel({ state }: Props) {
  const { players, currentPlayerIndex, lastDiceRoll } = state;
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {/* Mevcut oyuncu + zar */}
      <div style={{
        background: "#16213e", borderRadius: 10,
        padding: "10px 14px",
        border: `2px solid ${currentPlayer.color}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>{currentPlayer.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: currentPlayer.color }}>
              {currentPlayer.name}
            </div>
            <div style={{ color: "#8892a4", fontSize: 11 }}>
              {currentPlayer.isInJail ? `🔒 Depo (${currentPlayer.jailTurnsLeft} tur)` : `💰 ${currentPlayer.money}₺`}
            </div>
          </div>
        </div>
        {lastDiceRoll && (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <DiceFace value={lastDiceRoll[0]} />
            <DiceFace value={lastDiceRoll[1]} />
            <span style={{ color: "#8892a4", fontSize: 11 }}>=&nbsp;{lastDiceRoll[0] + lastDiceRoll[1]}</span>
          </div>
        )}
      </div>

      {/* Diğer oyuncular */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {players.map((p, i) => {
          if (i === currentPlayerIndex) return null;
          return (
            <div
              key={p.id}
              style={{
                flex: 1, minWidth: 80,
                background: p.isBankrupt ? "#1a0a0a" : "#16213e",
                borderRadius: 8, padding: "7px 10px",
                border: `1px solid ${p.isBankrupt ? "#400" : p.color + "60"}`,
                opacity: p.isBankrupt ? 0.5 : 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 14 }}>{p.emoji}</span>
                <span style={{ fontWeight: 600, fontSize: 12, color: p.color }}>{p.name}</span>
                {p.isBankrupt && <span style={{ fontSize: 10 }}>💀</span>}
              </div>
              <div style={{ color: "#8892a4", fontSize: 11 }}>
                {p.isBankrupt ? "İflas" : `${p.money}₺ · ${getPlayerProperties(state, p.id).length} mülk`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiceFace({ value }: { value: number }) {
  const dots = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return (
    <div style={{
      width: 28, height: 28, background: "#0f3460", borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 18, border: "1px solid #2a3a5c",
    }}>
      {dots[value]}
    </div>
  );
}
