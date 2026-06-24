"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
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
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--bg)", overflow: "hidden", position: "relative" }}>

      {/* Atmosfer katmanı */}
      <div className="atmo-bg" />

      {/* Top bar */}
      <div className="glass" style={{
        padding: "7px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, position: "relative", zIndex: 1,
      }}>
        <div className="ui-icon">
          <Image src="/assets/ui/logo.png" alt="Mutfak Savaşları" width={90} height={36} style={{ objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="ui-icon">
            <Image src={state.mode === "quick" ? "/assets/ui/hizli-mod.png" : "/assets/ui/klasik-mod.png"}
              alt={state.mode} width={18} height={18} style={{ objectFit: "contain" }} />
          </div>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            {state.mode === "quick" ? `${state.turn}/${state.maxTurns}` : `Tur ${state.turn}`}
          </span>
          <button onClick={resetGame} style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--muted)", cursor: "pointer", fontSize: 11,
            padding: "3px 8px", borderRadius: 6,
          }}>✕</button>
        </div>
      </div>

      {/* Oyuncu mini şeridi */}
      <div style={{
        background: "rgba(0,0,0,0.3)",
        padding: "6px 12px",
        display: "flex", gap: 8, overflowX: "auto",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0, position: "relative", zIndex: 1,
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
            <Image src="/assets/ui/para-ikon.png" alt="₺" width={11} height={11} style={{ objectFit: "contain" }} />
            <span style={{ fontSize: 11, color: "#8892a4" }}>{p.money}</span>
            {p.isBankrupt && <Image src="/assets/ui/iflas.png" alt="iflas" width={14} height={14} style={{ objectFit: "contain" }} />}
          </div>
        ))}
      </div>

      {/* Tahta */}
      {/* Tahta alanı */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "auto",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: 10, position: "relative", zIndex: 1,
      }}>
        <Board state={state} animPos={animPos} highlightSquare={highlightSquare} />
      </div>

      {/* Alt panel */}
      <div className="glass" style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "10px 12px",
        flexShrink: 0,
        display: "flex", flexDirection: "column", gap: 8,
        position: "relative", zIndex: 1,
      }}>
        {/* Son log satırları */}
        <div style={{ minHeight: 28 }}>
          {state.log.slice(-2).map((l, i) => (
            <p key={i} style={{
              margin: "1px 0", fontSize: 11,
              color: i === state.log.slice(-2).length - 1 ? "#c5d0e0" : "var(--muted)",
            }}>{l}</p>
          ))}
        </div>

        {/* Zar at butonu */}
        {state.phase === "rolling" && !currentPlayer.isBankrupt && (
          <DiceRoller
            onRoll={onRollPressed}
            disabled={false}
            playerName={currentPlayer.name}
            playerColor={currentPlayer.color}
            chefId={currentPlayer.chefId}
          />
        )}

        {/* Hareket animasyonu */}
        {isMoving && (
          <div style={{
            textAlign: "center", padding: "12px 0",
            color: currentPlayer.color, fontWeight: 600, fontSize: 14,
            animation: "pulse 0.6s ease-in-out infinite alternate",
          }}>
            {currentPlayer.name} ilerliyor...
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
      background: "var(--bg)", padding: 24, position: "relative", overflow: "hidden",
    }}>
      <div className="atmo-bg" />
      <div className="ui-icon" style={{ animation: "bounce 0.6s ease-in-out infinite alternate" }}>
        <Image src="/assets/ui/kupa.png" alt="Kupa" width={120} height={120} style={{ objectFit: "contain" }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: `3px solid ${state.winner.color}`, margin: "0 auto 8px", background: "#0f1923", boxShadow: `0 0 20px ${state.winner.color}66` }}>
          <Image src={`/assets/chefs/${state.winner.chefId}-portre.png`} alt={state.winner.name} width={64} height={64} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: state.winner.color, margin: "0 0 4px" }}>
          {state.winner.name}
        </h1>
        <p style={{ color: "#8892a4", margin: 0, fontSize: 13 }}>Kazandı!</p>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#8892a4", fontSize: 12, width: 16 }}>{i + 1}.</span>
                <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", border: `1.5px solid ${p.color}`, background: "#0f1923" }}>
                  <Image src={`/assets/chefs/${p.chefId}-portre.png`} alt={p.name} width={28} height={28} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </div>
                <span style={{ color: p.color, fontWeight: 600, fontSize: 13 }}>{p.name}</span>
                {p.isBankrupt && <Image src="/assets/ui/iflas.png" alt="iflas" width={16} height={16} style={{ objectFit: "contain" }} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Image src="/assets/ui/para-ikon.png" alt="₺" width={14} height={14} style={{ objectFit: "contain" }} />
                <span style={{ color: "#f5a623", fontWeight: 700, fontSize: 13 }}>{p.money}</span>
              </div>
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
