"use client";
import Image from "next/image";
import { GameState, Square, GameCard } from "@/lib/types";
import { getProperty, calculateRent, ownsFullGroup } from "@/lib/game-engine";
import { STAR_COST } from "@/lib/board-data";
import { getSquareImage } from "@/lib/square-image";
import { GROUP_COLORS } from "@/lib/board-data";

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
  onUpgrade, onSkipUpgrade, onCardEffect,
}: Props) {
  const { phase, players, currentPlayerIndex, pendingSquare, duel, drawnCard } = state;
  const player = players[currentPlayerIndex];

  // ── Satın Alma ─────────────────────────────────────────────────────────────
  if (phase === "buy_prompt" && pendingSquare) {
    const sq = pendingSquare;
    const price = sq.price ?? 0;
    const canAfford = player.money >= price;
    const imgSrc = getSquareImage(sq.type, sq.group);
    const groupColor = sq.group ? GROUP_COLORS[sq.group] : "#e94560";

    return (
      <HeroModal accentColor={groupColor}>
        <HeroImage src={imgSrc} alt={sq.name} accentColor={groupColor} />
        <div style={{ padding: "0 20px 20px", width: "100%" }}>
          <div style={{ marginBottom: 14 }}>
            <h2 className="title-lg" style={{ margin: 0, color: "#fff" }}>{sq.name}</h2>
            {sq.group && (
              <span style={{
                display: "inline-block", marginTop: 4,
                background: groupColor + "33", color: groupColor,
                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                border: `1px solid ${groupColor}44`,
              }}>
                {sq.group.toUpperCase()} GRUBU
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            <StatBox label="Fiyat" value={`${price}₺`} accent={groupColor} large />
            <StatBox label="Taban Kira" value={`${sq.baseRent ?? 0}₺`} />
            {sq.rentByStars && (<>
              <StatBox label="⭐ Kira" value={`${sq.rentByStars[1]}₺`} icon="/assets/ui/yildiz-mini.png" />
              <StatBox label="⭐⭐ Kira" value={`${sq.rentByStars[2]}₺`} icon="/assets/ui/yildiz-mini.png" />
              <StatBox label="⭐⭐⭐ Kira" value={`${sq.rentByStars[3]}₺`} icon="/assets/ui/yildiz-mini.png" />
            </>)}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
            <div className="ui-icon"><Image src="/assets/ui/para-ikon.png" alt="₺" width={16} height={16} style={{ objectFit: "contain" }} /></div>
            <span style={{ color: canAfford ? "#f5a623" : "#e94560", fontSize: 13, fontWeight: 600 }}>
              Bakiye: {player.money}₺ {!canAfford && "— Yetersiz!"}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={onSkipBuy} style={{ flex: 1 }}>Geç</button>
            <button className="btn btn-green" onClick={onBuy} disabled={!canAfford}
              style={{ flex: 2, opacity: canAfford ? 1 : 0.38, fontSize: 15 }}>
              Satın Al — {price}₺
            </button>
          </div>
        </div>
      </HeroModal>
    );
  }

  // ── Düello Prompt ──────────────────────────────────────────────────────────
  if (phase === "duel_prompt" && duel && pendingSquare) {
    const prop = getProperty(state, pendingSquare.id);
    const owner = prop ? players.find((p) => p.id === prop.ownerId) : null;
    const rent = prop ? calculateRent(state, pendingSquare, prop) : 0;
    const imgSrc = getSquareImage(pendingSquare.type, pendingSquare.group);
    const groupColor = pendingSquare.group ? GROUP_COLORS[pendingSquare.group] : "#e94560";

    return (
      <HeroModal accentColor={owner?.color ?? "#e94560"}>
        <HeroImage src={imgSrc} alt={pendingSquare.name} accentColor={groupColor} />
        <div style={{ padding: "0 20px 20px", width: "100%" }}>
          <div style={{ marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>{pendingSquare.name}</h2>
            {owner && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", overflow: "hidden", border: `2px solid ${owner.color}`, background: "#0f1923" }}>
                  <Image src={`/assets/chefs/${owner.chefId}-portre.png`} alt={owner.name} width={26} height={26} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </div>
                <span style={{ color: owner.color, fontSize: 13, fontWeight: 600 }}>{owner.name}'in mülkü</span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
            <StatBox label="Ödenecek Kira" value={`${rent}₺`} accent="#e94560" large />
            <StatBox label="Düello Süresi" value={`${duel.timeLimit}s`} />
            <StatBox label="Kazanırsan" value="Mülkü al!" accent="#4caf50" />
            <StatBox label="Kaybedersen" value={`${rent * 2}₺`} accent="#e94560" />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={onPayRent} style={{ flex: 1 }}>
              Kira Öde
            </button>
            <button className="btn btn-primary" onClick={onStartDuel}
              style={{ flex: 2, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <div className="ui-icon"><Image src="/assets/ui/klasik-mod.png" alt="" width={20} height={20} style={{ objectFit: "contain" }} /></div>
              Düello!
            </button>
          </div>
        </div>
      </HeroModal>
    );
  }

  // ── Yükseltme ──────────────────────────────────────────────────────────────
  if (phase === "upgrade_prompt" && pendingSquare) {
    const sq = pendingSquare;
    const prop = getProperty(state, sq.id);
    const currentStars = prop?.stars ?? 0;
    const canUpgrade = currentStars < 3 && sq.group ? ownsFullGroup(state, player.id, sq.group) : false;
    const canAfford = player.money >= STAR_COST;
    const imgSrc = getSquareImage(sq.type, sq.group);
    const groupColor = sq.group ? GROUP_COLORS[sq.group] : "#f5a623";

    return (
      <HeroModal accentColor="#f5a623">
        <HeroImage src={imgSrc} alt={sq.name} accentColor={groupColor} />
        <div style={{ padding: "0 20px 20px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>{sq.name}</h2>
            {currentStars > 0 && (
              <div className="ui-icon">
                <Image src={`/assets/squares/yildiz${currentStars}.png`} alt={`${currentStars} yıldız`} width={44} height={44} style={{ objectFit: "contain" }} />
              </div>
            )}
          </div>

          {currentStars < 3 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                <StatBox label="Mevcut Kira" value={`${sq.rentByStars?.[currentStars] ?? 0}₺`} />
                <StatBox label="Yeni Kira" value={`${sq.rentByStars?.[currentStars + 1] ?? 0}₺`} accent="#4caf50" large />
                <StatBox label="Yıldız Maliyeti" value={`${STAR_COST}₺`} accent="#f5a623" />
                <StatBox label="Bakiye" value={`${player.money}₺`} />
              </div>
              {!canUpgrade && (
                <p style={{ color: "#e94560", fontSize: 12, marginBottom: 12, textAlign: "center" }}>
                  Yıldız eklemek için tüm grubu sahip olmalısın!
                </p>
              )}
            </>
          ) : (
            <p style={{ color: "#f5a623", fontSize: 14, textAlign: "center", marginBottom: 14, fontWeight: 700 }}>
              Maksimum yıldıza ulaşıldı! ⭐⭐⭐
            </p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-secondary" onClick={onSkipUpgrade} style={{ flex: 1 }}>Geç</button>
            {currentStars < 3 && (
              <button className="btn btn-gold" onClick={onUpgrade}
                disabled={!canUpgrade || !canAfford}
                style={{ flex: 2, opacity: (canUpgrade && canAfford) ? 1 : 0.4, fontSize: 15 }}>
                Yıldız Ekle — {STAR_COST}₺
              </button>
            )}
          </div>
        </div>
      </HeroModal>
    );
  }

  // ── Şans Kartı ─────────────────────────────────────────────────────────────
  if (phase === "card_draw" && drawnCard) {
    return (
      <HeroModal accentColor="#f5a623">
        <div style={{
          position: "relative", width: "100%",
          display: "flex", justifyContent: "center",
          padding: "20px 20px 0",
        }}>
          {/* Kart görseli */}
          <div style={{
            position: "relative", width: 200, height: 280,
            animation: "cardFlip 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            filter: "drop-shadow(0 8px 32px #f5a62344)",
          }}>
            <Image src="/assets/ui/sans-karti.png" alt="Şans Kartı" fill style={{ objectFit: "cover", borderRadius: 12 }} />
            {/* Metin overlay */}
            <div style={{
              position: "absolute",
              top: "55%", left: "8%", right: "8%",
              textAlign: "center",
            }}>
              <p style={{ fontWeight: 800, fontSize: 13, color: "#1a1a2e", margin: "0 0 4px", lineHeight: 1.2 }}>
                {drawnCard.title}
              </p>
              <p style={{ fontSize: 10, color: "#2a2a3e", margin: 0, lineHeight: 1.4 }}>
                {drawnCard.description}
              </p>
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 20px 20px", width: "100%" }}>
          <button className="btn btn-gold" onClick={() => onCardEffect(drawnCard)} style={{ width: "100%", fontSize: 15 }}>
            Tamam
          </button>
        </div>
      </HeroModal>
    );
  }

  return null;
}

// ── Alt Bileşenler ───────────────────────────────────────────────────────────

function HeroModal({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 50,
      animation: "fadeIn 0.15s ease",
    }}>
      <div style={{
        background: "rgba(8,15,26,0.96)",
        borderRadius: "24px 24px 0 0",
        width: "100%", maxWidth: 460,
        border: `1px solid ${accentColor}33`,
        borderBottom: "none",
        boxShadow: `0 -8px 60px rgba(0,0,0,0.9), 0 0 80px ${accentColor}11`,
        display: "flex", flexDirection: "column", alignItems: "center",
        overflow: "hidden",
        animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        maxHeight: "90dvh",
        overflowY: "auto",
      }}>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp {
          from { transform: translateY(80px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes cardFlip {
          from { transform: rotateY(90deg) scale(0.8); opacity: 0; }
          to   { transform: rotateY(0deg)  scale(1);   opacity: 1; }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function HeroImage({ src, alt, accentColor }: { src: string | null; alt: string; accentColor: string }) {
  if (!src) return null;
  return (
    <div style={{
      width: "100%", position: "relative",
      aspectRatio: "16/9",
      overflow: "hidden",
    }}>
      {/* Gradient alt kararma */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: `linear-gradient(to bottom, transparent 40%, rgba(8,15,26,0.95) 100%)`,
      }} />
      {/* Renk glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: `radial-gradient(ellipse at 50% 30%, ${accentColor}18 0%, transparent 70%)`,
        animation: "heroGlow 3s ease-in-out infinite",
      }} />
      <Image src={src} alt={alt} fill style={{ objectFit: "cover" }} sizes="460px" />
    </div>
  );
}

function StatBox({ label, value, accent, large, icon }: {
  label: string; value: string; accent?: string; large?: boolean; icon?: string;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${accent ? accent + "33" : "rgba(255,255,255,0.06)"}`,
      borderRadius: 10, padding: "8px 10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
        {icon && <div className="ui-icon"><Image src={icon} alt="" width={11} height={11} style={{ objectFit: "contain" }} /></div>}
        <span className="title-sm" style={{ color: "var(--muted)", fontSize: 9 }}>{label}</span>
      </div>
      <span className="mono-stat" style={{
        color: accent ?? "#e8edf5",
        fontSize: large ? 18 : 14,
      }}>{value}</span>
    </div>
  );
}
