"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { GameState } from "@/lib/types";
import { BOARD, GROUP_COLORS } from "@/lib/board-data";
import { getSquareImage } from "@/lib/square-image";

interface Props {
  state: GameState;
  animPos: number[];
  highlightSquare: number | null;
}

const N = BOARD.length;
const SQ = 48;
const GAP = 2;

// Kare tipine/gruba göre görsel yolu

function getLayout() {
  const top: number[] = [], right: number[] = [], bottom: number[] = [], left: number[] = [];
  for (let i = 0; i < N; i++) {
    const side = Math.floor((i * 4) / N);
    if (side === 0) top.push(i);
    else if (side === 1) right.push(i);
    else if (side === 2) bottom.push(i);
    else left.push(i);
  }
  return { top, right, bottom: [...bottom].reverse(), left: [...left].reverse() };
}

const LAYOUT = getLayout();

export default function Board({ state, animPos, highlightSquare }: Props) {
  const { players, properties, seasonMenu } = state;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightSquare !== null && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-sq="${highlightSquare}"]`);
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [highlightSquare]);

  const renderSquare = (id: number) => {
    const sq = BOARD[id];
    const prop = properties.find((p) => p.squareId === id);
    const owner = prop ? players.find((p) => p.id === prop.ownerId) : null;
    const isHighlight = highlightSquare === id;
    const isSeason = seasonMenu.active && seasonMenu.squareIds.includes(id);
    const groupColor = sq.group ? GROUP_COLORS[sq.group] : null;
    const imgSrc = getSquareImage(sq.type, sq.group);
    const playersHere = players.filter((_, i) => animPos[i] === id && !players[i].isBankrupt);

    return (
      <div
        key={id}
        data-sq={id}
        style={{
          width: SQ, height: SQ,
          borderRadius: 7,
          position: "relative",
          flexShrink: 0,
          overflow: "hidden",
          border: isHighlight
            ? "2px solid #ffffff"
            : owner
              ? `2px solid ${owner.color}`
              : groupColor
                ? `1px solid ${groupColor}55`
                : "1px solid #1e2d45",
          boxShadow: isHighlight
            ? "0 0 14px #ffffffaa"
            : owner
              ? `0 0 6px ${owner.color}66`
              : "none",
          background: "#0f1923",
          transition: "box-shadow 0.15s, border 0.15s",
        }}
      >
        {/* Görsel */}
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={sq.name}
            fill
            sizes={`${SQ}px`}
            style={{ objectFit: "cover" }}
          />
        ) : (
          /* Görsel yoksa (malzeme kareleri) → grup rengi + emoji */
          <div style={{
            width: "100%", height: "100%",
            background: groupColor ? groupColor + "22" : "#16213e",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 1,
          }}>
            {groupColor && (
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 4,
                background: groupColor,
              }} />
            )}
            <span style={{ fontSize: 16, lineHeight: 1 }}>{sq.emoji}</span>
          </div>
        )}

        {/* Kapalı overlay */}
        {prop?.isClosed && (
          <div style={{
            position: "absolute", inset: 0,
            background: "#00000099",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Image src="/assets/ui/kapali.png" alt="kapalı" width={28} height={28} style={{ objectFit: "contain" }} />
          </div>
        )}

        {/* Mevsim overlay */}
        {isSeason && !prop?.isClosed && (
          <div style={{ position: "absolute", top: 1, right: 1 }}>
            <Image src="/assets/ui/mevsim-mini.png" alt="mevsim" width={14} height={14} style={{ objectFit: "contain" }} />
          </div>
        )}

        {/* Yıldız göstergesi */}
        {prop && prop.stars > 0 && (
          <div style={{
            position: "absolute", bottom: 1, left: 0, right: 0,
            display: "flex", justifyContent: "center",
          }}>
            <Image
              src={`/assets/squares/yildiz${prop.stars}.png`}
              alt={`${prop.stars} yıldız`}
              width={22}
              height={22}
              style={{ objectFit: "contain" }}
            />
          </div>
        )}

        {/* Sahip renk şeridi — alt */}
        {owner && !prop?.isClosed && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
            background: owner.color,
          }} />
        )}

        {/* Oyuncu taşları */}
        {playersHere.length > 0 && (
          <div style={{
            position: "absolute", top: 1, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap",
          }}>
            {playersHere.map((p) => (
              <div key={p.id} style={{
                width: 16, height: 16, borderRadius: "50%",
                overflow: "hidden",
                border: `1.5px solid ${p.color}`,
                boxShadow: `0 0 5px ${p.color}`,
                background: "#0f1923",
                flexShrink: 0,
              }}>
                <Image
                  src={`/assets/chefs/${p.chefId}-token.png`}
                  alt={p.name}
                  width={16}
                  height={16}
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const { top, right, bottom, left } = LAYOUT;

  return (
    <div ref={scrollRef} style={{
      display: "inline-flex",
      flexDirection: "column",
      gap: GAP,
      backgroundImage: "url('/assets/ui/tahta-dokusu.png')",
      backgroundSize: "cover",
      borderRadius: 14,
      padding: 8,
      border: "3px solid #5a3a1a",
      boxShadow: "0 8px 40px #00000099, inset 0 0 30px #00000044",
      flexShrink: 0,
    }}>
      {/* Üst sıra */}
      <div style={{ display: "flex", gap: GAP }}>
        <Corner id={left[0] ?? 0} render={renderSquare} />
        {top.map((id) => renderSquare(id))}
        <Corner id={right[0] ?? 0} render={renderSquare} />
      </div>

      {/* Orta */}
      <div style={{ display: "flex", gap: GAP }}>
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          {left.slice(1).map((id) => renderSquare(id))}
        </div>

        {/* Merkez */}
        <div style={{
          flex: 1, minWidth: 80,
          background: "#00000088",
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 6, padding: 8,
          border: "1px solid #5a3a1a55",
        }}>
          <Image src="/assets/ui/logo.png" alt="Mutfak Savaşları" width={90} height={45} style={{ objectFit: "contain" }} />
          {seasonMenu.active && (
            <div style={{
              display: "flex", alignItems: "center", gap: 3,
              background: "#00000066", borderRadius: 4, padding: "2px 6px",
            }}>
              <Image src="/assets/ui/mevsim-mini.png" alt="mevsim" width={12} height={12} style={{ objectFit: "contain" }} />
              <span style={{ fontSize: 9, color: "#f5a623" }}>Mevsim Aktif</span>
            </div>
          )}
          <div style={{
            fontSize: 10, color: "#c8a97a",
            background: "#00000055", borderRadius: 4, padding: "2px 8px",
          }}>
            Tur {state.turn}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          {right.slice(1).map((id) => renderSquare(id))}
        </div>
      </div>

      {/* Alt sıra */}
      <div style={{ display: "flex", gap: GAP }}>
        <Corner id={bottom[bottom.length - 1] ?? 0} render={renderSquare} />
        {bottom.slice(0, -1).map((id) => renderSquare(id))}
        <Corner id={right[right.length - 1] ?? 0} render={renderSquare} />
      </div>
    </div>
  );
}

function Corner({ id, render }: { id: number; render: (id: number) => React.ReactNode }) {
  return <div style={{ width: SQ, height: SQ, flexShrink: 0 }}>{render(id)}</div>;
}
