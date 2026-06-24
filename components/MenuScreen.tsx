"use client";
import { useState } from "react";
import Image from "next/image";
import { GameMode, ChefId } from "@/lib/types";
import { CHEFS } from "@/lib/board-data";
import { PlayerSetup } from "@/lib/useGameState";

interface Props {
  onStart: (mode: GameMode, players: PlayerSetup[]) => void;
}

const DEFAULT_NAMES = ["Marco", "Yuki", "Fatma", "Diego"];

export default function MenuScreen({ onStart }: Props) {
  const [step, setStep] = useState<"mode" | "players">("mode");
  const [mode, setMode] = useState<GameMode>("classic");
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { chefId: "marco", name: "Marco" },
    { chefId: "yuki", name: "Yuki" },
    { chefId: "fatma", name: "Fatma" },
    { chefId: "diego", name: "Diego" },
  ]);

  const usedChefs = players.slice(0, playerCount).map((p) => p.chefId);

  const updatePlayer = (i: number, field: keyof PlayerSetup, value: string) => {
    setPlayers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const handleStart = () => {
    onStart(mode, players.slice(0, playerCount));
  };

  if (step === "mode") {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100dvh", gap: 32,
        background: "var(--bg)", padding: 24, position: "relative", overflow: "hidden",
      }}>
        <div className="atmo-bg" />
        <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="ui-icon">
            <Image src="/assets/ui/logo.png" alt="Mutfak Savaşları" width={280} height={140} style={{ objectFit: "contain" }} />
          </div>
          <p className="title-sm" style={{ color: "var(--muted)", marginTop: 6 }}>Şeflerin Düellosu</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 340 }}>
          <p className="title-sm" style={{ color: "var(--muted)", textAlign: "center", marginBottom: 4 }}>
            — Oyun Modu Seç —
          </p>

          <button className="btn" onClick={() => { setMode("classic"); setStep("players"); }} style={{
            background: mode === "classic"
              ? "linear-gradient(160deg,rgba(255,90,114,0.18),rgba(192,57,43,0.18))"
              : "rgba(13,24,40,0.55)",
            color: "white", padding: "14px 18px",
            border: `1.5px solid ${mode === "classic" ? "#e94560" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 14, gap: 14, justifyContent: "flex-start",
            boxShadow: mode === "classic" ? "0 0 28px rgba(233,69,96,0.25), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
            backdropFilter: "blur(8px)",
          }}>
            <div className="ui-icon" style={{ flexShrink: 0, width: 46, height: 46 }}>
              <Image src="/assets/ui/klasik-mod.png" alt="Klasik" width={46} height={46} style={{ objectFit: "contain" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="label" style={{ fontSize: 16, color: mode === "classic" ? "#ff7a8a" : "var(--text)" }}>Klasik Mod</div>
              <div style={{ fontSize: 11, opacity: 0.55, fontFamily: "var(--font-body)", marginTop: 3 }}>Son ayakta kalan kazanır</div>
            </div>
          </button>

          <button className="btn" onClick={() => { setMode("quick"); setStep("players"); }} style={{
            background: mode === "quick"
              ? "linear-gradient(160deg,rgba(255,209,102,0.18),rgba(200,125,15,0.18))"
              : "rgba(13,24,40,0.55)",
            color: "white", padding: "14px 18px",
            border: `1.5px solid ${mode === "quick" ? "#f5a623" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 14, gap: 14, justifyContent: "flex-start",
            boxShadow: mode === "quick" ? "0 0 28px rgba(245,166,35,0.22), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
            backdropFilter: "blur(8px)",
          }}>
            <div className="ui-icon" style={{ flexShrink: 0, width: 46, height: 46 }}>
              <Image src="/assets/ui/hizli-mod.png" alt="Hızlı" width={46} height={46} style={{ objectFit: "contain" }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div className="label" style={{ fontSize: 16, color: mode === "quick" ? "#ffd166" : "var(--text)" }}>Hızlı Mod</div>
              <div style={{ fontSize: 11, opacity: 0.55, fontFamily: "var(--font-body)", marginTop: 3 }}>20 tur, en zengin kazanır</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: "var(--bg)",
      position: "relative", overflow: "hidden",
    }}>
      <div className="atmo-bg" />

      {/* Sabit header */}
      <div className="glass" style={{
        padding: "10px 16px", flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", zIndex: 1,
      }}>
        <button className="btn btn-secondary" onClick={() => setStep("mode")}
          style={{ padding: "7px 14px", fontSize: 13 }}>← Geri</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="ui-icon"><Image src={mode === "quick" ? "/assets/ui/hizli-mod.png" : "/assets/ui/klasik-mod.png"} alt={mode} width={18} height={18} style={{ objectFit: "contain" }} /></div>
          <span className="title-sm" style={{ color: "var(--muted)" }}>{mode === "quick" ? "Hızlı Mod" : "Klasik Mod"}</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[2, 3, 4].map((n) => (
            <button key={n} onClick={() => setPlayerCount(n)}
              style={{
                width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
                background: playerCount === n ? "var(--accent)" : "rgba(255,255,255,0.07)",
                color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
              }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Oyuncu kartları — scroll */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}>
        {Array.from({ length: playerCount }).map((_, i) => {
          const player = players[i];
          const chef = CHEFS.find((c) => c.id === player.chefId)!;
          return (
            <div key={i} style={{
              background: `linear-gradient(135deg, rgba(13,24,40,0.9), rgba(9,18,32,0.95))`,
              borderRadius: 14, padding: "12px 14px",
              border: `1.5px solid ${chef.color}44`,
              boxShadow: `0 2px 16px ${chef.color}11`,
            }}>
              {/* Üst: portre + isim */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  overflow: "hidden", border: `2px solid ${chef.color}`,
                  flexShrink: 0, background: "#0f1923",
                  boxShadow: `0 0 10px ${chef.color}44`,
                }}>
                  <Image src={`/assets/chefs/${chef.id}-portre.png`} alt={chef.name}
                    width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input
                    value={player.name}
                    onChange={(e) => updatePlayer(i, "name", e.target.value)}
                    maxLength={12}
                    placeholder="İsim gir..."
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${chef.color}33`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: "white",
                      fontSize: 15,
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                  <p style={{ color: "var(--muted)", fontSize: 10, margin: "4px 0 0", fontFamily: "var(--font-body)" }}>
                    {chef.passiveDesc}
                  </p>
                </div>
              </div>

              {/* Şef seçimi */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
                {CHEFS.map((c) => {
                  const taken = usedChefs.includes(c.id) && c.id !== player.chefId;
                  const selected = player.chefId === c.id;
                  return (
                    <button key={c.id}
                      onClick={() => {
                        if (!taken) {
                          updatePlayer(i, "chefId", c.id);
                          updatePlayer(i, "name", DEFAULT_NAMES[CHEFS.findIndex((ch) => ch.id === c.id)]);
                        }
                      }}
                      style={{
                        padding: "6px 4px", borderRadius: 10, fontSize: 10,
                        background: selected ? c.color + "33" : "rgba(255,255,255,0.04)",
                        color: selected ? c.color : "var(--muted)",
                        border: `1.5px solid ${selected ? c.color : "rgba(255,255,255,0.06)"}`,
                        cursor: taken ? "not-allowed" : "pointer",
                        opacity: taken ? 0.3 : 1,
                        fontWeight: 700,
                        fontFamily: "var(--font-body)",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", border: `1.5px solid ${c.color}66`, background: "#0f1923" }}>
                        <Image src={`/assets/chefs/${c.id}-portre.png`} alt={c.name} width={30} height={30}
                          style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      </div>
                      <span style={{ fontSize: 10 }}>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sabit alt buton */}
      <div className="glass" style={{
        padding: "12px 16px", flexShrink: 0,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        position: "relative", zIndex: 1,
      }}>
        <button className="btn btn-primary" onClick={handleStart}
          style={{ width: "100%", fontSize: 17, height: 54 }}>
          Oyunu Başlat
        </button>
      </div>
    </div>
  );
}
