"use client";
import Image from "next/image";
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
        <SquareHeader sq={sq} />
        <div style={{ background: "#0f3460", borderRadius: 8, padding: "10px 16px", marginBottom: 16, width: "100%" }}>
          <Row label="Fiyat" value={`${price}₺`} />
          <Row label="Taban Kira" value={`${sq.baseRent ?? 0}₺`} />
          {sq.rentByStars && (
            <>
              <StarRow stars={1} value={sq.rentByStars[1]} />
              <StarRow stars={2} value={sq.rentByStars[2]} />
              <StarRow stars={3} value={sq.rentByStars[3]} />
            </>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Image src="/assets/ui/para-ikon.png" alt="para" width={18} height={18} style={{ objectFit: "contain" }} />
          <span style={{ color: "#f5a623", fontSize: 13 }}>Bakiye: {player.money}₺</span>
        </div>
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
        <SquareHeader sq={pendingSquare} />
        {owner && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", border: `2px solid ${owner.color}`, background: "#0f1923" }}>
              <Image src={`/assets/chefs/${owner.chefId}-portre.png`} alt={owner.name} width={28} height={28} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <span style={{ color: owner.color, fontSize: 13, fontWeight: 600 }}>{owner.name}</span>
          </div>
        )}
        <div style={{ background: "#0f3460", borderRadius: 8, padding: "10px 16px", marginBottom: 16, width: "100%" }}>
          <Row label="Kira" value={`${rent}₺`} highlight />
          <Row label="Düello Süresi" value={`${duel.timeLimit}s`} />
          <Row label="Kazanırsan" value="Mülkü al!" />
          <Row label="Kaybedersen" value={`${rent * 2}₺ öde`} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={onPayRent}>Kira Öde ({rent}₺)</button>
          <button className="btn" onClick={onStartDuel} style={{ background: "#e94560", color: "white", display: "flex", alignItems: "center", gap: 8 }}>
            <Image src="/assets/ui/klasik-mod.png" alt="düello" width={20} height={20} style={{ objectFit: "contain" }} />
            Düello!
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
        <SquareHeader sq={sq} />
        <div style={{ display: "flex", gap: 4, margin: "8px 0", justifyContent: "center" }}>
          {currentStars === 0
            ? <span style={{ color: "#8892a4", fontSize: 12 }}>Yıldızsız</span>
            : <Image src={`/assets/squares/yildiz${currentStars}.png`} alt={`${currentStars} yıldız`} width={52} height={52} style={{ objectFit: "contain" }} />
          }
        </div>
        {currentStars < 3 && (
          <div style={{ background: "#0f3460", borderRadius: 8, padding: "10px 16px", marginBottom: 14, width: "100%" }}>
            {sq.rentByStars && <StarRow stars={currentStars + 1 as 1|2|3} value={sq.rentByStars[currentStars + 1]} highlight />}
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
        {/* Şans kartı görseli — metin üzerine overlay */}
        <div style={{ position: "relative", width: 180, height: 252, marginBottom: 16 }}>
          <Image
            src="/assets/ui/sans-karti.png"
            alt="Şans Kartı"
            fill
            style={{ objectFit: "cover", borderRadius: 10 }}
          />
          {/* Kartın beyaz metin alanına başlık + açıklama yaz */}
          <div style={{
            position: "absolute",
            top: "54%", left: "8%", right: "8%",
            textAlign: "center",
          }}>
            <p style={{ fontWeight: 700, fontSize: 12, color: "#1a1a2e", margin: "0 0 4px", lineHeight: 1.2 }}>
              {drawnCard.title}
            </p>
            <p style={{ fontSize: 10, color: "#333", margin: 0, lineHeight: 1.3 }}>
              {drawnCard.description}
            </p>
          </div>
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
      background: "#000000bb", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 50, padding: "0 12px 20px",
      animation: "fadeIn 0.15s ease",
    }}>
      <div style={{
        background: "linear-gradient(160deg, #1a2d4a, #16213e)",
        borderRadius: 20,
        padding: "24px 20px",
        width: "100%", maxWidth: 420,
        border: "1px solid #2a3d5c",
        boxShadow: "0 -4px 40px #00000066",
        display: "flex", flexDirection: "column", alignItems: "center",
        textAlign: "center",
        animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
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

function StarRow({ stars, value, highlight }: { stars: 1|2|3; value: number; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Image src="/assets/ui/yildiz-mini.png" alt="yıldız" width={14} height={14} style={{ objectFit: "contain" }} />
        <span style={{ color: "#8892a4", fontSize: 12 }}>{stars} Yıldız Kira</span>
      </div>
      <span style={{ color: highlight ? "#f5a623" : "#eaeaea", fontSize: 12, fontWeight: highlight ? 700 : 400 }}>
        {value}₺
      </span>
    </div>
  );
}

function SquareHeader({ sq }: { sq: Square }) {
  const imgMap: Record<string, string> = {
    italyan: "/assets/squares/italyan.png", japon: "/assets/squares/japon.png",
    turk:    "/assets/squares/turk.png",    meksika: "/assets/squares/meksika.png",
    domates: "/assets/squares/domates.png", un:      "/assets/squares/un.png",
    peynir:  "/assets/squares/peynir.png",  et:      "/assets/squares/et.png",
    sebze:   "/assets/squares/sebze.png",
  };
  const typeMap: Record<string, string> = {
    start: "/assets/squares/baslangic.png", rest:              "/assets/squares/dinlenme.png",
    tax:   "/assets/squares/vergi.png",     jail:              "/assets/squares/depo.png",
    chance:"/assets/squares/sans.png",      fire:              "/assets/squares/yangin.png",
    health_inspection: "/assets/squares/denetim.png",
    season_menu: "/assets/squares/mevsim.png",
    duel_square: "/assets/squares/duello.png",
  };
  const src = sq.group ? imgMap[sq.group] : typeMap[sq.type];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, width: "100%" }}>
      {src && (
        <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
          <Image src={src} alt={sq.name} width={56} height={56} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
        </div>
      )}
      <div style={{ textAlign: "left" }}>
        <h3 style={{ margin: 0, color: "#eaeaea", fontSize: 16, fontWeight: 700 }}>{sq.name}</h3>
        {sq.group && <p style={{ color: "#8892a4", fontSize: 11, margin: "3px 0 0" }}>{sq.group} grubu</p>}
      </div>
    </div>
  );
}
