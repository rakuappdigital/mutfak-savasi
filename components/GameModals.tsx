"use client";
import { GameState, Player, Square, GameCard } from "@/lib/types";
import { getProperty, calculateRent, ownsFullGroup } from "@/lib/game-engine";
import { BOARD, STAR_COST } from "@/lib/board-data";

interface Props {
  state: GameState;
  onBuy: () => void;
  onSkipBuy: () => void;
  onPayRent: () => void;
  onStartDuel: () => void;
  onUpgrade: () => void;
  onSkipUpgrade: () => void;
  onCardEffect: (card: GameCard) => void;
  onRoll: () => void;
}

export default function GameModals({
  state, onBuy, onSkipBuy, onPayRent, onStartDuel,
  onUpgrade, onSkipUpgrade, onCardEffect, onRoll,
}: Props) {
  const { phase, players, currentPlayerIndex, pendingSquare, duel, drawnCard } = state;
  const player = players[currentPlayerIndex];

  if (phase === "buy_prompt" && pendingSquare) {
    const sq = pendingSquare;
    const price = sq.price ?? 0;
    const canAfford = player.money >= price;
    return (
      <Modal>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{sq.emoji}</div>
        <h3 style={{ margin: 0, color: "#eaeaea", fontSize: 18 }}>{sq.name}</h3>
        <p style={{ color: "#8892a4", fontSize: 12, margin: "6px 0 12px" }}>
          {sq.group ? `Grup: ${sq.group}` : sq.type}
        </p>
        <div style={{ background: "#0f3460", borderRadius: 8, padding: "10px 16px", marginBottom: 16, width: "100%" }}>
          <Row label="Fiyat" value={`${price}₺`} />
          <Row label="Taban Kira" value={`${sq.baseRent ?? 0}₺`} />
          {sq.rentByStars && (
            <>
              <Row label="⭐ Kira" value={`${sq.rentByStars[1]}₺`} />
              <Row label="⭐⭐ Kira" value={`${sq.rentByStars[2]}₺`} />
              <Row label="⭐⭐⭐ Kira" value={`${sq.rentByStars[3]}₺`} />
            </>
          )}
        </div>
        <p style={{ color: "#f5a623", fontSize: 13, marginBottom: 12 }}>
          💰 Bakiye: {player.money}₺
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={onSkipBuy}>Geç</button>
          <button className="btn btn-primary" onClick={onBuy} disabled={!canAfford}
            style={{ opacity: canAfford ? 1 : 0.5 }}>
            Satın Al ({price}₺)
          </button>
        </div>
      </Modal>
    );
  }

  if (phase === "duel_prompt" && duel && pendingSquare) {
    const prop = getProperty(state, pendingSquare.id);
    const owner = prop ? players.find((p) => p.id === prop.ownerId) : null;
    const rent = prop ? calculateRent(state, pendingSquare, prop) : 0;
    return (
      <Modal>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{pendingSquare.emoji}</div>
        <h3 style={{ margin: 0, color: "#eaeaea", fontSize: 18 }}>{pendingSquare.name}</h3>
        <p style={{ color: "#8892a4", fontSize: 12, margin: "6px 0 12px" }}>
          Sahibi: <span style={{ color: owner?.color }}>{owner?.emoji} {owner?.name}</span>
        </p>
        <div style={{ background: "#0f3460", borderRadius: 8, padding: "10px 16px", marginBottom: 16, width: "100%" }}>
          <Row label="Kira" value={`${rent}₺`} highlight />
          <Row label="Düello Süresi" value={`${duel.timeLimit}s`} />
          <Row label="Düello Kazanırsan" value="Mülkü al!" />
          <Row label="Kaybedersen" value={`${rent * 2}₺ öde`} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={onPayRent}>
            Kira Öde ({rent}₺)
          </button>
          <button className="btn" onClick={onStartDuel}
            style={{ background: "#e94560", color: "white" }}>
            ⚔️ Düello!
          </button>
        </div>
      </Modal>
    );
  }

  if (phase === "upgrade_prompt" && pendingSquare) {
    const sq = pendingSquare;
    const prop = getProperty(state, sq.id);
    const currentStars = prop?.stars ?? 0;
    const canUpgrade = currentStars < 3 && sq.group ? ownsFullGroup(state, player.id, sq.group) : false;
    const canAfford = player.money >= STAR_COST;
    return (
      <Modal>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{sq.emoji}</div>
        <h3 style={{ margin: 0, color: "#eaeaea", fontSize: 18 }}>{sq.name}</h3>
        <p style={{ color: "#f5a623", fontSize: 16, margin: "8px 0" }}>
          {"⭐".repeat(currentStars) || "Yıldızsız"}
        </p>
        {currentStars < 3 && (
          <div style={{ background: "#0f3460", borderRadius: 8, padding: "10px 16px", marginBottom: 14, width: "100%" }}>
            {sq.rentByStars && <Row label={`⭐ → ${currentStars + 1} Yıldız Kira`} value={`${sq.rentByStars[currentStars + 1]}₺`} highlight />}
            <Row label="Maliyet" value={`${STAR_COST}₺`} />
            {!canUpgrade && (
              <p style={{ color: "#e94560", fontSize: 11, marginTop: 6, marginBottom: 0 }}>
                Tüm grubu sahip olmalısın!
              </p>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={onSkipUpgrade}>Geç</button>
          {currentStars < 3 && (
            <button className="btn btn-gold" onClick={onUpgrade}
              disabled={!canUpgrade || !canAfford}
              style={{ opacity: (canUpgrade && canAfford) ? 1 : 0.4 }}>
              Yıldız Ekle ({STAR_COST}₺)
            </button>
          )}
        </div>
      </Modal>
    );
  }

  if (phase === "card_draw" && drawnCard) {
    return (
      <Modal>
        <div style={{ fontSize: 42, marginBottom: 8 }}>🎲</div>
        <div style={{
          background: "#0f3460", borderRadius: 12, padding: "16px 20px",
          marginBottom: 16, width: "100%", textAlign: "center",
        }}>
          <h3 style={{ margin: "0 0 8px", color: "#f5a623", fontSize: 16 }}>{drawnCard.title}</h3>
          <p style={{ color: "#eaeaea", fontSize: 13, margin: 0 }}>{drawnCard.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => onCardEffect(drawnCard)} style={{ width: "100%" }}>
          Tamam
        </button>
      </Modal>
    );
  }

  if (phase === "rolling") {
    return null; // Rol butonu ana sayfada
  }

  return null;
}

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "#000000aa", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 50, padding: "0 16px 24px",
    }}>
      <div style={{
        background: "#16213e", borderRadius: 16,
        padding: "24px 20px", width: "100%", maxWidth: 400,
        border: "1px solid #2a3a5c",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ color: "#8892a4", fontSize: 12 }}>{label}</span>
      <span style={{ color: highlight ? "#f5a623" : "#eaeaea", fontSize: 12, fontWeight: highlight ? 700 : 400 }}>
        {value}
      </span>
    </div>
  );
}
