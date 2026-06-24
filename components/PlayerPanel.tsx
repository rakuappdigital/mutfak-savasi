"use client";
import Image from "next/image";
import { GameState } from "@/lib/types";
import { getPlayerProperties } from "@/lib/game-engine";

interface Props {
  state: GameState;
}

export default function PlayerPanel({ state }: Props) {
  const { players, currentPlayerIndex, lastDiceRoll } = state;
  const currentPlayer = players[currentPlayerIndex];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      {/* Aktif oyuncu kartı */}
      <div style={{
        background: "linear-gradient(135deg, #1a2d4a, #16213e)",
        borderRadius: 12,
        padding: "10px 12px",
        border: `2px solid ${currentPlayer.color}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: `0 2px 16px ${currentPlayer.color}33`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Portre */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${currentPlayer.color}`,
            boxShadow: `0 0 10px ${currentPlayer.color}66`,
            flexShrink: 0,
            background: "#0f1923",
          }}>
            <Image
              src={`/assets/chefs/${currentPlayer.chefId}-portre.png`}
              alt={currentPlayer.name}
              width={44}
              height={44}
              style={{ objectFit: "cover", width: "100%", height: "100%" }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: currentPlayer.color }}>
              {currentPlayer.name}
            </div>
            <div style={{ color: "#8892a4", fontSize: 11, marginTop: 1 }}>
              {currentPlayer.isInJail
                ? `🔒 Depo — ${currentPlayer.jailTurnsLeft} tur`
                : `💰 ${currentPlayer.money}₺`}
            </div>
          </div>
        </div>

        {/* Son zar */}
        {lastDiceRoll && (
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <DiceFace value={lastDiceRoll[0]} />
            <DiceFace value={lastDiceRoll[1]} />
            <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 13, marginLeft: 2 }}>
              {lastDiceRoll[0] + lastDiceRoll[1]}
            </span>
          </div>
        )}
      </div>

      {/* Diğer oyuncular */}
      <div style={{ display: "flex", gap: 6 }}>
        {players.map((p, i) => {
          if (i === currentPlayerIndex) return null;
          return (
            <div
              key={p.id}
              style={{
                flex: 1,
                background: p.isBankrupt ? "#140a0a" : "#111d2e",
                borderRadius: 10, padding: "7px 8px",
                border: `1px solid ${p.isBankrupt ? "#3a0000" : p.color + "55"}`,
                opacity: p.isBankrupt ? 0.5 : 1,
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              {/* Küçük portre */}
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                overflow: "hidden",
                border: `1.5px solid ${p.color}`,
                flexShrink: 0,
                background: "#0f1923",
              }}>
                <Image
                  src={`/assets/chefs/${p.chefId}-portre.png`}
                  alt={p.name}
                  width={30}
                  height={30}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 11, color: p.color }}>
                  {p.name} {p.isBankrupt ? "💀" : ""}
                </div>
                <div style={{ color: "#8892a4", fontSize: 10 }}>
                  {p.isBankrupt
                    ? "İflas"
                    : `${p.money}₺ · ${getPlayerProperties(state, p.id).length} mülk`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiceFace({ value }: { value: number }) {
  return (
    <div style={{
      width: 26, height: 26, borderRadius: 6,
      overflow: "hidden",
      border: "1px solid #1e3a5f",
      background: "#0f1923",
      flexShrink: 0,
    }}>
      <Image
        src={`/assets/dice/zar${value}.png`}
        alt={`${value}`}
        width={26}
        height={26}
        style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
