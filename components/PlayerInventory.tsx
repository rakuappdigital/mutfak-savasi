"use client";
import { useState } from "react";
import Image from "next/image";
import { GameState, Property } from "@/lib/types";
import { getPlayerProperties, calculateRent, ownsFullGroup } from "@/lib/game-engine";
import { BOARD, GROUP_COLORS, CHEFS } from "@/lib/board-data";
import { getSquareImage } from "@/lib/square-image";

interface Props {
  state: GameState;
  playerId: string;
  onClose: () => void;
}

export default function PlayerInventory({ state, playerId, onClose }: Props) {
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const player = state.players.find((p) => p.id === playerId)!;
  const chef = CHEFS.find((c) => c.id === player.chefId)!;
  const properties = getPlayerProperties(state, playerId);
  const netWorth = player.money + properties.reduce((sum, prop) => {
    const sq = BOARD[prop.squareId];
    return sum + (sq.mortgageValue ?? 0) + prop.stars * 150;
  }, 0);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      zIndex: 60,
    }} onClick={onClose}>

      {/* Ana panel */}
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "rgba(5,10,18,0.97)",
        borderRadius: "22px 22px 0 0",
        width: "100%", maxWidth: 460,
        border: `1px solid ${player.color}33`,
        borderBottom: "none",
        boxShadow: `0 -8px 60px rgba(0,0,0,0.9), 0 0 60px ${player.color}11`,
        maxHeight: "88dvh",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 16px 10px",
          borderBottom: `1px solid ${player.color}18`,
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", overflow: "hidden",
            border: `2px solid ${player.color}`, background: "#0f1923",
            boxShadow: `0 0 12px ${player.color}44`, flexShrink: 0,
          }}>
            <Image src={`/assets/chefs/${player.chefId}-portre.png`} alt={player.name}
              width={44} height={44} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="title-lg" style={{ color: player.color, margin: 0 }}>{player.name}</h2>
            <p style={{ color: "var(--muted)", fontSize: 11, margin: 0, fontFamily: "var(--font-body)" }}>{chef.passiveDesc}</p>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "var(--muted)", cursor: "pointer", fontSize: 13,
            padding: "5px 10px", borderRadius: 8, fontFamily: "var(--font-body)",
          }}>✕</button>
        </div>

        {/* Servet özeti */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8, padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
        }}>
          <WealthBox label="NAKİT" value={`${player.money}₺`} color="var(--gold)" />
          <WealthBox label="MÜLK" value={`${properties.length}`} color={player.color} />
          <WealthBox label="NET DEĞER" value={`${netWorth}₺`} color="#4caf50" />
        </div>

        {/* Kart galerisi */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px 24px" }}>
          {properties.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "var(--muted)", fontSize: 14, fontFamily: "var(--font-body)" }}>Henüz mülk yok</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {properties.map((prop) => {
                const sq = BOARD[prop.squareId];
                const imgSrc = getSquareImage(sq.type, sq.group);
                const groupColor = sq.group ? GROUP_COLORS[sq.group] : player.color;
                const rent = calculateRent(state, sq, prop);
                const fullGroup = sq.group ? ownsFullGroup(state, playerId, sq.group) : false;

                return (
                  <button key={prop.squareId}
                    onClick={() => setSelectedProp(prop)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: 0, textAlign: "left",
                    }}
                  >
                    <div style={{
                      borderRadius: 12,
                      border: `1.5px solid ${prop.isClosed ? "#e9456044" : groupColor + "44"}`,
                      overflow: "hidden",
                      boxShadow: fullGroup ? `0 0 10px ${groupColor}33` : "none",
                      position: "relative",
                      transition: "transform 0.1s",
                    }}>
                      {/* Görsel */}
                      <div style={{ width: "100%", aspectRatio: "1/1", position: "relative", background: "#0f1923" }}>
                        {imgSrc && <Image src={imgSrc} alt={sq.name} fill
                          style={{ objectFit: "cover" }} sizes="120px" />}
                        {prop.isClosed && (
                          <div style={{
                            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <div className="ui-icon">
                              <Image src="/assets/ui/kapali.png" alt="kapalı" width={32} height={32} style={{ objectFit: "contain" }} />
                            </div>
                          </div>
                        )}
                        {/* Yıldız badge */}
                        {prop.stars > 0 && (
                          <div style={{ position: "absolute", top: 4, right: 4 }}>
                            <div className="ui-icon">
                              <Image src={`/assets/squares/yildiz${prop.stars}.png`} alt="yıldız"
                                width={24} height={24} style={{ objectFit: "contain" }} />
                            </div>
                          </div>
                        )}
                        {/* Tam grup rozeti */}
                        {fullGroup && (
                          <div style={{
                            position: "absolute", top: 4, left: 4,
                            background: groupColor, borderRadius: 4,
                            padding: "1px 4px",
                            fontSize: 8, color: "white", fontFamily: "var(--font-display)",
                            fontWeight: 700, letterSpacing: "0.04em",
                          }}>TAM</div>
                        )}
                      </div>

                      {/* Alt bilgi şeridi */}
                      <div style={{
                        background: "rgba(5,10,18,0.92)",
                        padding: "5px 6px",
                        borderTop: `1px solid ${groupColor}22`,
                      }}>
                        <p style={{
                          margin: 0, color: "var(--text)", fontSize: 9,
                          fontFamily: "var(--font-body)", fontWeight: 700,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{sq.name}</p>
                        <p style={{
                          margin: 0, color: prop.isClosed ? "var(--accent)" : "var(--gold)",
                          fontSize: 9, fontFamily: "var(--font-display)", fontWeight: 600,
                        }}>
                          {prop.isClosed ? "Kapalı" : `${rent}₺ kira`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detay modalı — seçili kart */}
      {selectedProp && (
        <CardDetailModal
          prop={selectedProp}
          state={state}
          playerId={playerId}
          onClose={() => setSelectedProp(null)}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(60px); opacity:0; }
          to   { transform: translateY(0); opacity:1; }
        }
      `}</style>
    </div>
  );
}

function CardDetailModal({ prop, state, playerId, onClose }: {
  prop: Property; state: GameState; playerId: string; onClose: () => void;
}) {
  const sq = BOARD[prop.squareId];
  const imgSrc = getSquareImage(sq.type, sq.group);
  const groupColor = sq.group ? GROUP_COLORS[sq.group] : "#f5a623";
  const rent = calculateRent(state, sq, prop);
  const fullGroup = sq.group ? ownsFullGroup(state, playerId, sq.group) : false;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "rgba(6,10,18,0.97)",
        borderRadius: 20,
        width: "100%", maxWidth: 340,
        border: `1px solid ${groupColor}44`,
        boxShadow: `0 8px 48px rgba(0,0,0,0.9), 0 0 40px ${groupColor}11`,
        overflow: "hidden",
        animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* Hero görsel */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/3" }}>
          {imgSrc && <Image src={imgSrc} alt={sq.name} fill style={{ objectFit: "cover" }} sizes="340px" />}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to bottom, transparent 30%, rgba(6,10,18,0.95) 100%)`,
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: `radial-gradient(ellipse at 50% 30%, ${groupColor}18 0%, transparent 70%)`,
          }} />
          {/* Kapat */}
          <button onClick={onClose} style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
            color: "white", borderRadius: 8, padding: "4px 10px",
            cursor: "pointer", fontSize: 12, fontFamily: "var(--font-body)",
          }}>✕</button>
          {/* Yıldız */}
          {prop.stars > 0 && (
            <div style={{ position: "absolute", top: 10, left: 10 }}>
              <div className="ui-icon">
                <Image src={`/assets/squares/yildiz${prop.stars}.png`} alt="yıldız"
                  width={40} height={40} style={{ objectFit: "contain" }} />
              </div>
            </div>
          )}
        </div>

        {/* Bilgiler */}
        <div style={{ padding: "14px 16px 18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h3 className="title-lg" style={{ margin: 0, color: "var(--text)" }}>{sq.name}</h3>
              {sq.group && (
                <span style={{
                  display: "inline-block", marginTop: 4,
                  background: groupColor + "22", color: groupColor,
                  fontSize: 10, fontFamily: "var(--font-display)", fontWeight: 700,
                  padding: "2px 8px", borderRadius: 4, letterSpacing: "0.06em",
                }}>
                  {sq.group.toUpperCase()} {fullGroup ? "✓ TAM GRUP" : ""}
                </span>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="mono-stat" style={{ color: prop.isClosed ? "var(--accent)" : "var(--gold)", margin: 0, fontSize: 18 }}>
                {prop.isClosed ? "Kapalı" : `${rent}₺`}
              </p>
              <p style={{ color: "var(--muted)", fontSize: 10, margin: 0, fontFamily: "var(--font-body)" }}>
                {prop.isClosed ? `${prop.closeForTurns} tur` : "kira"}
              </p>
            </div>
          </div>

          {sq.rentByStars && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {([0,1,2,3] as const).map((stars) => (
                <div key={stars} style={{
                  background: prop.stars === stars ? groupColor + "22" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${prop.stars === stars ? groupColor + "55" : "rgba(255,255,255,0.05)"}`,
                  borderRadius: 8, padding: "6px 10px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                    {stars > 0 ? (
                      <div className="ui-icon">
                        <Image src={`/assets/squares/yildiz${stars}.png`} alt="y" width={14} height={14} style={{ objectFit: "contain" }} />
                      </div>
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 10, fontFamily: "var(--font-body)" }}>Taban</span>
                    )}
                  </div>
                  <span className="mono-stat" style={{
                    color: prop.stars === stars ? groupColor : "var(--muted)",
                    fontSize: 13,
                  }}>{sq.rentByStars?.[stars] ?? 0}₺</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.85); opacity:0; }
          to   { transform: scale(1);    opacity:1; }
        }
      `}</style>
    </div>
  );
}

function WealthBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "7px 8px", textAlign: "center",
    }}>
      <p className="title-sm" style={{ color: "var(--muted)", margin: "0 0 3px", fontSize: 8 }}>{label}</p>
      <p className="mono-stat" style={{ color, margin: 0, fontSize: 14 }}>{value}</p>
    </div>
  );
}
