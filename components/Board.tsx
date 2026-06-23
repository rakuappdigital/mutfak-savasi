"use client";
import { GameState } from "@/lib/types";
import { BOARD, GROUP_COLORS } from "@/lib/board-data";

interface Props {
  state: GameState;
}

const BOARD_SIZE = BOARD.length; // 62
const SIDE = Math.ceil(BOARD_SIZE / 4); // ~16 per side

export default function Board({ state }: Props) {
  const { players, properties, seasonMenu } = state;

  const getSquareStyle = (id: number) => {
    const sq = BOARD[id];
    const prop = properties.find((p) => p.squareId === id);
    const isSeasonActive = seasonMenu.active && seasonMenu.squareIds.includes(id);

    let bg = "#16213e";
    let border = "1px solid #2a3a5c";

    if (sq.group && GROUP_COLORS[sq.group]) {
      bg = GROUP_COLORS[sq.group] + "22";
      border = `1px solid ${GROUP_COLORS[sq.group]}55`;
    }
    if (prop) {
      const owner = players.find((p) => p.id === prop.ownerId);
      if (owner) border = `2px solid ${owner.color}`;
    }
    if (prop?.isClosed) bg = "#300";
    if (isSeasonActive) bg = "#2d1b00";

    return { background: bg, border };
  };

  const getPlayersOnSquare = (id: number) => {
    return players.filter((p) => p.position === id && !p.isBankrupt);
  };

  const renderSquare = (id: number, size: "sm" | "md" = "sm") => {
    const sq = BOARD[id];
    const prop = properties.find((p) => p.squareId === id);
    const playersHere = getPlayersOnSquare(id);
    const isSeasonActive = seasonMenu.active && seasonMenu.squareIds.includes(id);
    const s = getSquareStyle(id);
    const dim = size === "md" ? 52 : 38;

    return (
      <div
        key={id}
        style={{
          width: dim, height: dim,
          ...s,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          fontSize: size === "md" ? 14 : 11,
          flexShrink: 0,
        }}
      >
        {/* Emoji */}
        <span style={{ lineHeight: 1 }}>{sq.emoji}</span>

        {/* Yıldızlar */}
        {prop && prop.stars > 0 && (
          <span style={{ fontSize: 8, lineHeight: 1, color: "#f5a623" }}>
            {"⭐".repeat(prop.stars)}
          </span>
        )}

        {/* Kapalı */}
        {prop?.isClosed && (
          <span style={{ position: "absolute", top: 1, right: 1, fontSize: 8 }}>🔒</span>
        )}

        {/* Mevsim */}
        {isSeasonActive && (
          <span style={{ position: "absolute", top: 1, left: 1, fontSize: 7 }}>🍂</span>
        )}

        {/* Oyuncular */}
        {playersHere.length > 0 && (
          <div style={{
            position: "absolute", bottom: 1, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap",
          }}>
            {playersHere.map((p) => (
              <div
                key={p.id}
                style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: p.color, border: "1px solid white",
                  fontSize: 7, display: "flex", alignItems: "center", justifyContent: "center",
                }}
              />
            ))}
          </div>
        )}

        {/* Sahip rengi çizgisi */}
        {prop && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
            background: players.find((p) => p.id === prop.ownerId)?.color ?? "transparent",
            borderRadius: "0 0 4px 4px",
          }} />
        )}
      </div>
    );
  };

  // 4 kenarlı klasik board düzeni (küçük ekran için compact)
  // Top row: 0..15 (sol→sağ)
  // Right col: 16..30 (yukarı→aşağı)
  // Bottom row: 31..46 (sağ→sol)
  // Left col: 47..61 (aşağı→yukarı)

  const topRow = Array.from({ length: 16 }, (_, i) => i); // 0-15
  const rightCol = Array.from({ length: 16 }, (_, i) => i + 16); // 16-31
  const bottomRow = Array.from({ length: 16 }, (_, i) => 47 - i); // 47..32 → reversed 32-47
  const leftCol = Array.from({ length: 15 }, (_, i) => 61 - i); // 61..47 → reversed

  return (
    <div style={{
      background: "#0d1b2a",
      borderRadius: 12,
      padding: 6,
      border: "2px solid #2a3a5c",
      display: "inline-flex",
      flexDirection: "column",
      gap: 2,
      alignSelf: "center",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", gap: 2 }}>
        <div style={{ width: 52 }} /> {/* corner spacer */}
        {topRow.map((id) => renderSquare(id))}
        <div style={{ width: 52 }} /> {/* corner spacer */}
      </div>

      {/* Middle: left col + center info + right col */}
      <div style={{ display: "flex", gap: 2, alignItems: "stretch" }}>
        {/* Left col — rendered bottom-up */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {leftCol.map((id) => renderSquare(id))}
        </div>

        {/* Center */}
        <div style={{
          flex: 1, background: "#0a1628", borderRadius: 8,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minWidth: 80, padding: 8, gap: 4,
        }}>
          <div style={{ fontSize: 28 }}>🍽️</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#eaeaea", textAlign: "center" }}>
            Mutfak<br />Savaşları
          </div>
          {state.seasonMenu.active && (
            <div style={{ fontSize: 10, color: "#f5a623", textAlign: "center" }}>
              🍂 Mevsim<br />Menüsü Aktif
            </div>
          )}
          <div style={{ fontSize: 10, color: "#8892a4" }}>
            Tur {state.turn}
          </div>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rightCol.map((id) => renderSquare(id))}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "flex", gap: 2 }}>
        <div style={{ width: 52 }} />
        {bottomRow.map((id) => renderSquare(id))}
        <div style={{ width: 52 }} />
      </div>
    </div>
  );
}
