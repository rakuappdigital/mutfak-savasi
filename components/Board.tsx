"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GameState } from "@/lib/types";
import { BOARD, GROUP_COLORS } from "@/lib/board-data";

interface Props {
  state: GameState;
  animPos: number[]; // her oyuncu için animasyon pozisyonu
  highlightSquare: number | null; // hareket sırasında parlayan kare
}

const N = BOARD.length; // 62
const SQ = 42; // kare boyutu px
const GAP = 2;

// 62 kareyi 4 kenara böl
function getLayout() {
  // Saat yönü: üst sol→sağ, sağ yukarı→aşağı, alt sağ→sol, sol aşağı→yukarı
  const perSide = Math.ceil(N / 4);
  const top: number[] = [];
  const right: number[] = [];
  const bottom: number[] = [];
  const left: number[] = [];

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

  // Highlight kareyi otomatik scroll ile görünür yap
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

    // Oyuncular bu karedeyse (animasyon pozisyonu)
    const playersHere = players.filter((p, i) => animPos[i] === id && !p.isBankrupt);

    return (
      <div
        key={id}
        data-sq={id}
        style={{
          width: SQ, height: SQ,
          borderRadius: 6,
          background: isHighlight
            ? "#fff3"
            : prop?.isClosed
              ? "#2a0000"
              : isSeason
                ? "#2a1a00"
                : groupColor
                  ? groupColor + "18"
                  : "#16213e",
          border: isHighlight
            ? `2px solid #fff`
            : owner
              ? `2px solid ${owner.color}`
              : groupColor
                ? `1px solid ${groupColor}44`
                : "1px solid #1e2d45",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.15s, border 0.15s",
          boxShadow: isHighlight ? `0 0 12px #ffffff88` : "none",
        }}
      >
        {/* Grup renk şeridi — üst */}
        {groupColor && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 3,
            background: groupColor, borderRadius: "6px 6px 0 0",
          }} />
        )}

        {/* Emoji */}
        <span style={{ fontSize: 14, lineHeight: 1, marginTop: groupColor ? 2 : 0 }}>
          {sq.emoji}
        </span>

        {/* Yıldızlar */}
        {prop && prop.stars > 0 && (
          <div style={{ fontSize: 7, color: "#f5a623", lineHeight: 1 }}>
            {"★".repeat(prop.stars)}
          </div>
        )}

        {/* Kapalı */}
        {prop?.isClosed && (
          <div style={{
            position: "absolute", inset: 0, background: "#ff000022",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14,
          }}>🔒</div>
        )}

        {/* Mevsim */}
        {isSeason && !prop?.isClosed && (
          <div style={{ position: "absolute", top: 1, right: 1, fontSize: 8 }}>🍂</div>
        )}

        {/* Oyuncu taşları — token görseli */}
        {playersHere.length > 0 && (
          <div style={{
            position: "absolute",
            bottom: 1, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap",
          }}>
            {playersHere.map((p) => (
              <div
                key={p.id}
                title={p.name}
                style={{
                  width: 18, height: 18, borderRadius: "50%",
                  overflow: "hidden",
                  border: `1.5px solid ${p.color}`,
                  boxShadow: `0 0 6px ${p.color}cc`,
                  background: "#0f1923",
                  flexShrink: 0,
                }}
              >
                <Image
                  src={`/assets/chefs/${p.chefId}-token.png`}
                  alt={p.name}
                  width={18}
                  height={18}
                  style={{ objectFit: "cover", width: "100%", height: "100%", display: "block" }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const { top, right, bottom, left } = LAYOUT;
  const sideLen = top.length;
  const boardW = (sideLen + 2) * (SQ + GAP);

  return (
    <div ref={scrollRef} style={{
      display: "inline-flex",
      flexDirection: "column",
      gap: GAP,
      background: "#0a1628",
      borderRadius: 14,
      padding: 6,
      border: "2px solid #1e3a5f",
      boxShadow: "0 8px 32px #00000088",
      flexShrink: 0,
    }}>
      {/* Üst sıra */}
      <div style={{ display: "flex", gap: GAP }}>
        <CornerSquare id={left[0]} renderFn={renderSquare} />
        {top.map((id) => renderSquare(id))}
        <CornerSquare id={right[0]} renderFn={renderSquare} />
      </div>

      {/* Orta */}
      <div style={{ display: "flex", gap: GAP }}>
        {/* Sol sütun (ters) */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          {[...left].slice(1).map((id) => renderSquare(id))}
        </div>

        {/* Merkez */}
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg, #0d1f38, #0a1628)",
          borderRadius: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minWidth: 70,
          gap: 6, padding: 6,
          border: "1px solid #1e3a5f",
        }}>
          <div style={{ fontSize: 30 }}>🍽️</div>
          <div style={{
            fontSize: 10, fontWeight: 800, color: "#eaeaea",
            textAlign: "center", letterSpacing: 0.5,
          }}>
            MUTFAK<br />SAVAŞLARI
          </div>
          {seasonMenu.active && (
            <div style={{
              fontSize: 9, color: "#f5a623", textAlign: "center",
              background: "#f5a62322", borderRadius: 4, padding: "2px 6px",
            }}>
              🍂 Mevsim Aktif
            </div>
          )}
          <div style={{
            fontSize: 10, color: "#8892a4",
            background: "#16213e", borderRadius: 4, padding: "2px 8px",
          }}>
            Tur {state.turn}
          </div>
        </div>

        {/* Sağ sütun */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
          {[...right].slice(1).map((id) => renderSquare(id))}
        </div>
      </div>

      {/* Alt sıra */}
      <div style={{ display: "flex", gap: GAP }}>
        <CornerSquare id={bottom[bottom.length - 1] ?? 0} renderFn={renderSquare} />
        {[...bottom].slice(0, -1).map((id) => renderSquare(id))}
        <CornerSquare id={right[right.length - 1] ?? 0} renderFn={renderSquare} />
      </div>
    </div>
  );
}

function CornerSquare({ id, renderFn }: { id: number; renderFn: (id: number) => React.ReactNode }) {
  return (
    <div style={{ width: SQ, height: SQ, flexShrink: 0 }}>
      {renderFn(id)}
    </div>
  );
}
