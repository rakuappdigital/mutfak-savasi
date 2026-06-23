"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useGameState } from "@/lib/useGameState";
import { BOARD_SIZE } from "@/lib/board-data";
import MenuScreen from "@/components/MenuScreen";
import Board from "@/components/Board";
import PlayerPanel from "@/components/PlayerPanel";
import GameModals from "@/components/GameModals";
import DuelMinigame from "@/components/DuelMinigame";
import DiceRoller from "@/components/DiceRoller";

export default function GamePage() {
  const {
    state, startGame, handleRoll, handleFinishMove,
    handleBuy, handleSkipBuy, handlePayRent, handleStartDuel,
    handleDuelResult, handleUpgrade, handleSkipUpgrade,
    handleCardEffect, resetGame,
  } = useGameState();

  // Animasyon pozisyonları — her oyuncu için ayrı
  const [animPos, setAnimPos] = useState<number[]>([0, 0, 0, 0]);
  const [highlightSquare, setHighlightSquare] = useState<number | null>(null);
  const animatingRef = useRef(false);

  // Oyun başladığında animPos'u sıfırla
  useEffect(() => {
    if (state && state.turn === 1 && state.phase === "rolling") {
      setAnimPos(state.players.map(() => 0));
    }
  }, [state?.players.length]);

  // "moving" fazı algıla → adım adım animasyon başlat
  useEffect(() => {
    if (!state || state.phase !== "moving" || animatingRef.current) return;

    const playerIdx = state.currentPlayerIndex;
    const targetPos = state.players[playerIdx].position;
    const startPos = animPos[playerIdx];

    // Kaç adım gidecek?
    const steps = targetPos >= startPos
      ? targetPos - startPos
      : BOARD_SIZE - startPos + targetPos;

    animatingRef.current = true;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const pos = (startPos + step) % BOARD_SIZE;
      setHighlightSquare(pos);
      setAnimPos((prev) => {
        const next = [...prev];
        next[playerIdx] = pos;
        return next;
      });

      if (step >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setHighlightSquare(null);
          animatingRef.current = false;
          handleFinishMove();
        }, 350);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [state?.phase, state?.currentPlayerIndex]);

  const onRollPressed = useCallback(() => {
    return handleRoll();
  }, [handleRoll]);

  if (!state) return <MenuScreen onStart={startGame} />;

  if (state.phase === "game_over" && state.winner) {
    return <WinScreen state={state} onReset={resetGame} />;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  const isMoving = state.phase === "moving";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: "#0d1520",
      overflow: "hidden",
    }}>
      {/* Top bar */}
      <div style={{
        background: "#16213e",
        padding: "8px 14px",
        borderBottom: "1px solid #1e3a5f",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>🍽️</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#eaeaea" }}>Mutfak Savaşları</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#8892a4", fontSize: 12 }}>
            {state.mode === "quick" ? `⚡ ${state.turn}/${state.maxTurns}` : `Tur ${state.turn}`}
          </span>
          <button
            onClick={resetGame}
            style={{
              background: "none", border: "1px solid #2a3a5c",
              color: "#8892a4", cursor: "pointer", fontSize: 11,
              padding: "3px 8px", borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Oyuncu mini şeridi */}
      <div style={{
        background: "#111d2e",
        padding: "6px 12px",
        display: "flex", gap: 8, overflowX: "auto",
        borderBottom: "1px solid #1e3a5f",
        flexShrink: 0,
      }}>
        {state.players.map((p, i) => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 5,
            background: i === state.currentPlayerIndex ? "#16213e" : "transparent",
            borderRadius: 8, padding: "4px 8px",
            border: i === state.currentPlayerIndex ? `1px solid ${p.color}` : "1px solid transparent",
            opacity: p.isBankrupt ? 0.4 : 1,
            flexShrink: 0,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: p.color, flexShrink: 0,
              boxShadow: i === state.currentPlayerIndex ? `0 0 6px ${p.color}` : "none",
            }} />
            <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontSize: 11, color: "#8892a4" }}>{p.money}₺</span>
            {p.isBankrupt && <span style={{ fontSize: 10 }}>💀</span>}
          </div>
        ))}
      </div>

      {/* Tahta */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "auto",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: 10,
      }}>
        <Board state={state} animPos={animPos} highlightSquare={highlightSquare} />
      </div>

      {/* Alt panel */}
      <div style={{
        background: "#16213e",
        borderTop: "1px solid #1e3a5f",
        padding: "10px 12px",
        flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        {/* Son log satırları */}
        <div style={{ minHeight: 30 }}>
          {state.log.slice(-2).map((l, i) => (
            <p key={i} style={{
              margin: "1px 0", fontSize: 11,
              color: i === state.log.slice(-2).length - 1 ? "#c5d0e0" : "#8892a4",
            }}>
              {l}
            </p>
          ))}
        </div>

        {/* Zar at butonu */}
        {state.phase === "rolling" && !currentPlayer.isBankrupt && (
          <DiceRoller
            onRoll={onRollPressed}
            disabled={false}
            playerName={currentPlayer.name}
            playerColor={currentPlayer.color}
            playerEmoji={currentPlayer.emoji}
          />
        )}

        {/* Hareket animasyonu sırasında */}
        {isMoving && (
          <div style={{
            textAlign: "center", padding: "12px 0",
            color: currentPlayer.color, fontWeight: 600, fontSize: 14,
            animation: "pulse 0.6s ease-in-out infinite alternate",
          }}>
            {currentPlayer.emoji} {currentPlayer.name} ilerliyor...
          </div>
        )}
      </div>

      {/* Modallar */}
      <GameModals
        state={state}
        onBuy={handleBuy}
        onSkipBuy={handleSkipBuy}
        onPayRent={handlePayRent}
        onStartDuel={handleStartDuel}
        onUpgrade={handleUpgrade}
        onSkipUpgrade={handleSkipUpgrade}
        onCardEffect={handleCardEffect}
        onRoll={() => handleRoll()}
      />

      {/* Düello */}
      {state.phase === "duel_active" && state.duel && (
        <DuelMinigame
          duel={state.duel}
          players={state.players}
          onResult={handleDuelResult}
        />
      )}

      <style>{`
        @keyframes pulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function WinScreen({ state, onReset }: { state: ReturnType<typeof useGameState>["state"] & object; onReset: () => void }) {
  if (!state || !state.winner) return null;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100dvh", gap: 20,
      background: "linear-gradient(135deg, #0d1520 0%, #16213e 60%, #1a2a4a 100%)",
      padding: 24,
    }}>
      <div style={{
        fontSize: 80,
        animation: "bounce 0.6s ease-in-out infinite alternate",
      }}>🏆</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>{state.winner.emoji}</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: state.winner.color, margin: "8px 0 4px" }}>
          {state.winner.name}
        </h1>
        <p style={{ color: "#8892a4", margin: 0 }}>Kazandı!</p>
      </div>

      <div style={{
        background: "#16213e", borderRadius: 14, padding: "14px 20px",
        border: "1px solid #1e3a5f", width: "100%", maxWidth: 300,
      }}>
        {[...state.players]
          .sort((a, b) => b.money - a.money)
          .map((p, i) => (
            <div key={p.id} style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "6px 0",
              borderBottom: i < state.players.length - 1 ? "1px solid #1e3a5f" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#8892a4", fontSize: 12, width: 16 }}>{i + 1}.</span>
                <span style={{ fontSize: 16 }}>{p.emoji}</span>
                <span style={{ color: p.color, fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                {p.isBankrupt && <span style={{ fontSize: 11 }}>💀</span>}
              </div>
              <span style={{ color: "#f5a623", fontWeight: 700 }}>{p.money}₺</span>
            </div>
          ))}
      </div>

      <button
        onClick={onReset}
        style={{
          padding: "14px 40px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg, #e94560, #c0392b)",
          color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer",
          boxShadow: "0 4px 20px #e9456055",
        }}
      >
        Ana Menü
      </button>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
