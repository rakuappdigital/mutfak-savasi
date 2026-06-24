"use client";
import Image from "next/image";
import { GameState, Player } from "@/lib/types";
import { getPlayerProperties, calculateRent, ownsFullGroup } from "@/lib/game-engine";
import { BOARD, GROUP_COLORS, CHEFS } from "@/lib/board-data";
import { getSquareImage } from "@/lib/square-image";

interface Props {
  state: GameState;
  playerId: string;
  onClose: () => void;
}

export default function PlayerInventory({ state, playerId, onClose }: Props) {
  const player = state.players.find((p) => p.id === playerId)!;
  const chef = CHEFS.find((c) => c.id === player.chefId)!;
  const properties = getPlayerProperties(state, playerId);
  const netWorth = player.money + properties.reduce((sum, prop) => {
    const sq = BOARD[prop.squareId];
    return sum + (sq.mortgageValue ?? 0) + prop.stars * 150;
  }, 0);

  // Mülkleri gruba göre ayır
  const grouped: Record<string, typeof properties> = {};
  for (const prop of properties) {
    const sq = BOARD[prop.squareId];
    const key = sq.group ?? sq.type;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(prop);
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 60,
      animation: "fadeIn 0.15s ease",
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(6,12,20,0.97)",
          borderRadius: "24px 24px 0 0",
          width: "100%", maxWidth: 460,
          border: `1px solid ${player.color}33`,
          borderBottom: "none",
          boxShadow: `0 -8px 60px rgba(0,0,0,0.9), 0 0 60px ${player.color}11`,
          maxHeight: "88dvh",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 20px 12px",
          borderBottom: `1px solid ${player.color}22`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 46, height: 46, borderRadius: "50%", overflow: "hidden",
              border: `2px solid ${player.color}`,
              boxShadow: `0 0 14px ${player.color}55`,
              background: "#0f1923",
            }}>
              <Image src={`/assets/chefs/${player.chefId}-portre.png`} alt={player.name}
                width={46} height={46} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: player.color }}>
                {player.name}
              </h2>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 11 }}>
                {chef.passiveDesc}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--muted)", cursor: "pointer", fontSize: 13,
            padding: "5px 10px", borderRadius: 8,
          }}>✕</button>
        </div>

        {/* Servet özeti */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          flexShrink: 0,
        }}>
          <WealthBox label="Nakit" value={`${player.money}₺`} icon="/assets/ui/para-ikon.png" color="#f5a623" />
          <WealthBox label="Mülkler" value={`${properties.length} adet`} color={player.color} />
          <WealthBox label="Net Değer" value={`${netWorth}₺`} color="#4caf50" />
        </div>

        {/* Kartlar */}
        <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px 24px" }}>
          {properties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🏗️</div>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Henüz mülk yok</p>
            </div>
          ) : (
            Object.entries(grouped).map(([groupKey, props]) => {
              const groupColor = GROUP_COLORS[groupKey] ?? player.color;
              const hasFullGroup = ownsFullGroup(state, playerId, groupKey);
              return (
                <div key={groupKey} style={{ marginBottom: 16 }}>
                  {/* Grup başlığı */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 1, background: groupColor + "44" }} />
                    <span style={{ color: groupColor, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                      {groupKey.toUpperCase()}
                    </span>
                    {hasFullGroup && (
                      <span style={{
                        background: groupColor + "22", color: groupColor,
                        fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                        border: `1px solid ${groupColor}44`,
                      }}>TAM GRUP ✓</span>
                    )}
                    <div style={{ flex: 1, height: 1, background: groupColor + "44" }} />
                  </div>

                  {/* Kart listesi */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {props.map((prop) => {
                      const sq = BOARD[prop.squareId];
                      const rent = calculateRent(state, sq, prop);
                      const imgSrc = getSquareImage(sq.type, sq.group);
                      return (
                        <div key={prop.squareId} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          background: prop.isClosed
                            ? "rgba(80,0,0,0.4)"
                            : hasFullGroup
                              ? `rgba(${hexToRgb(groupColor)},0.08)`
                              : "rgba(255,255,255,0.03)",
                          border: `1px solid ${prop.isClosed ? "#e9456033" : groupColor + "22"}`,
                          borderRadius: 12, padding: "10px 12px",
                          opacity: prop.isClosed ? 0.7 : 1,
                        }}>
                          {/* Kare görseli */}
                          <div style={{
                            width: 52, height: 52, borderRadius: 10,
                            overflow: "hidden", flexShrink: 0, background: "#0f1923",
                            border: `1px solid ${groupColor}33`,
                          }}>
                            {imgSrc && <Image src={imgSrc} alt={sq.name} width={52} height={52}
                              style={{ objectFit: "cover", width: "100%", height: "100%" }} />}
                          </div>

                          {/* Bilgiler */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: "#e8edf5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {sq.name}
                              </span>
                              {prop.isClosed && (
                                <div className="ui-icon" style={{ flexShrink: 0 }}>
                                  <Image src="/assets/ui/kapali.png" alt="kapalı" width={16} height={16} style={{ objectFit: "contain" }} />
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {/* Yıldızlar */}
                              {prop.stars > 0 ? (
                                <div className="ui-icon">
                                  <Image src={`/assets/squares/yildiz${prop.stars}.png`} alt="yıldız"
                                    width={22} height={22} style={{ objectFit: "contain" }} />
                                </div>
                              ) : (
                                <span style={{ color: "var(--muted)", fontSize: 10 }}>Yıldızsız</span>
                              )}
                              <span style={{ color: "var(--muted)", fontSize: 10 }}>•</span>
                              {/* Kira */}
                              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                                <div className="ui-icon">
                                  <Image src="/assets/ui/para-ikon.png" alt="₺" width={12} height={12} style={{ objectFit: "contain" }} />
                                </div>
                                <span style={{
                                  color: prop.isClosed ? "#e94560" : "#f5a623",
                                  fontSize: 12, fontWeight: 700,
                                }}>
                                  {prop.isClosed ? "Kapalı" : `${rent}₺ kira`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp {
          from { transform: translateY(80px); opacity:0 }
          to   { transform: translateY(0);    opacity:1 }
        }
      `}</style>
    </div>
  );
}

function WealthBox({ label, value, icon, color }: { label: string; value: string; icon?: string; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "8px 10px", textAlign: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 3 }}>
        {icon && <div className="ui-icon"><Image src={icon} alt="" width={12} height={12} style={{ objectFit: "contain" }} /></div>}
        <span style={{ color: "var(--muted)", fontSize: 10 }}>{label}</span>
      </div>
      <span style={{ color, fontSize: 13, fontWeight: 800 }}>{value}</span>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
