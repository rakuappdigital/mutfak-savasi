"use client";
import { useGameState } from "@/lib/useGameState";
import MenuScreen from "@/components/MenuScreen";
import Board from "@/components/Board";
import PlayerPanel from "@/components/PlayerPanel";
import GameModals from "@/components/GameModals";
import DuelMinigame from "@/components/DuelMinigame";

export default function GamePage() {
  const {
    state, startGame, handleRoll, handleBuy, handleSkipBuy,
    handlePayRent, handleStartDuel, handleDuelResult,
    handleUpgrade, handleSkipUpgrade, handleCardEffect, resetGame,
  } = useGameState();

  if (!state) {
    return <MenuScreen onStart={startGame} />;
  }

  if (state.phase === "game_over" && state.winner) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100dvh", gap: 24,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: 24,
      }}>
        <div style={{ fontSize: 72 }}>🏆</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f5a623", textAlign: "center", margin: 0 }}>
          {state.winner.emoji} {state.winner.name}<br />
          <span style={{ fontSize: 18, color: "#eaeaea" }}>Kazandı!</span>
        </h1>
        <div style={{
          background: "#16213e", borderRadius: 12, padding: "16px 24px",
          border: "1px solid #2a3a5c", width: "100%", maxWidth: 320,
        }}>
          {state.players
            .filter((p) => !p.isBankrupt)
            .sort((a, b) => b.money - a.money)
            .map((p, i) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ color: p.color, fontWeight: 600 }}>{p.emoji} {p.name}</span>
                <span style={{ color: "#f5a623" }}>{p.money}₺</span>
              </div>
            ))}
        </div>
        <div style={{ background: "#16213e", borderRadius: 8, padding: "10px 16px", maxHeight: 140, overflowY: "auto", width: "100%", maxWidth: 320 }}>
          {state.log.slice(-8).map((l, i) => (
            <p key={i} style={{ color: "#8892a4", fontSize: 11, margin: "2px 0" }}>{l}</p>
          ))}
        </div>
        <button className="btn btn-primary" onClick={resetGame} style={{ fontSize: 16, padding: "12px 32px" }}>
          Ana Menü
        </button>
      </div>
    );
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: "#1a1a2e",
      overflow: "hidden",
    }}>
      {/* Top bar */}
      <div style={{
        background: "#16213e", padding: "8px 12px",
        borderBottom: "1px solid #2a3a5c",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 16 }}>🍽️</span>
        <span style={{ color: "#8892a4", fontSize: 12 }}>
          Tur {state.turn}{state.mode === "quick" ? ` / ${state.maxTurns}` : ""}
        </span>
        <button
          onClick={resetGame}
          style={{ background: "none", border: "none", color: "#8892a4", cursor: "pointer", fontSize: 12 }}
        >
          ✕ Çık
        </button>
      </div>

      {/* Board — scroll içinde */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: 8, display: "flex", justifyContent: "center" }}>
        <Board state={state} />
      </div>

      {/* Bottom panel */}
      <div style={{
        background: "#16213e", padding: "10px 12px",
        borderTop: "1px solid #2a3a5c",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <PlayerPanel state={state} />

        {/* Log - son 2 satır */}
        <div style={{ color: "#8892a4", fontSize: 11, minHeight: 28 }}>
          {state.log.slice(-2).map((l, i) => (
            <p key={i} style={{ margin: "1px 0" }}>{l}</p>
          ))}
        </div>

        {/* Aksiyon butonu */}
        {state.phase === "rolling" && !currentPlayer.isBankrupt && (
          <button
            className="btn btn-primary"
            onClick={handleRoll}
            style={{ width: "100%", fontSize: 16, padding: "12px 0" }}
          >
            {currentPlayer.emoji} {currentPlayer.name} — Zar At 🎲
          </button>
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
        onRoll={handleRoll}
      />

      {/* Düello mini oyunu */}
      {state.phase === "duel_active" && state.duel && (
        <DuelMinigame
          duel={state.duel}
          players={state.players}
          onResult={handleDuelResult}
        />
      )}
    </div>
  );
}
