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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        padding: 24,
      }}>
        <div style={{ textAlign: "center" }}>
          <Image src="/assets/ui/logo.png" alt="Mutfak Savaşları" width={280} height={140} style={{ objectFit: "contain" }} />
          <p style={{ color: "#8892a4", marginTop: 4, fontSize: 13 }}>Şeflerin Düellosu</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
          <p style={{ color: "#8892a4", fontSize: 13, textAlign: "center", marginBottom: 4 }}>Oyun Modu Seç</p>

          <button
            className="btn"
            onClick={() => { setMode("classic"); setStep("players"); }}
            style={{
              background: mode === "classic" ? "#1e0a12" : "#16213e",
              color: "white", padding: "14px 20px", fontSize: 15,
              border: `2px solid ${mode === "classic" ? "#e94560" : "#2a3a5c"}`, borderRadius: 14,
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: mode === "classic" ? "0 0 20px #e9456044" : "none",
            }}
          >
            <Image src="/assets/ui/klasik-mod.png" alt="Klasik" width={44} height={44} style={{ objectFit: "contain", flexShrink: 0 }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>Klasik Mod</div>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 400, marginTop: 2 }}>Son ayakta kalan kazanır</div>
            </div>
          </button>

          <button
            className="btn"
            onClick={() => { setMode("quick"); setStep("players"); }}
            style={{
              background: mode === "quick" ? "#1a1200" : "#16213e",
              color: "white", padding: "14px 20px", fontSize: 15,
              border: `2px solid ${mode === "quick" ? "#f5a623" : "#2a3a5c"}`, borderRadius: 14,
              display: "flex", alignItems: "center", gap: 14,
              boxShadow: mode === "quick" ? "0 0 20px #f5a62344" : "none",
            }}
          >
            <Image src="/assets/ui/hizli-mod.png" alt="Hızlı" width={44} height={44} style={{ objectFit: "contain", flexShrink: 0 }} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700 }}>Hızlı Mod</div>
              <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 400, marginTop: 2 }}>20 tur, en zengin kazanır</div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      height: "100dvh", gap: 20,
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      padding: 24, overflowY: "auto",
    }}>
      <div style={{ textAlign: "center", paddingTop: 16 }}>
        <Image src="/assets/ui/logo.png" alt="Mutfak Savaşları" width={160} height={80} style={{ objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -4 }}>
          <Image src={mode === "quick" ? "/assets/ui/hizli-mod.png" : "/assets/ui/klasik-mod.png"} alt={mode} width={18} height={18} style={{ objectFit: "contain" }} />
          <p style={{ color: "#8892a4", fontSize: 12, margin: 0 }}>
            {mode === "quick" ? "Hızlı Mod" : "Klasik Mod"}
          </p>
        </div>
      </div>

      {/* Oyuncu sayısı */}
      <div style={{ display: "flex", gap: 8 }}>
        {[2, 3, 4].map((n) => (
          <button
            key={n}
            className="btn"
            onClick={() => setPlayerCount(n)}
            style={{
              background: playerCount === n ? "#e94560" : "#16213e",
              color: "white", width: 60, height: 44, fontSize: 16,
              border: "2px solid #2a3a5c", borderRadius: 10,
            }}
          >
            {n}
          </button>
        ))}
        <span style={{ color: "#8892a4", fontSize: 13, alignSelf: "center", marginLeft: 8 }}>kişi</span>
      </div>

      {/* Oyuncu konfigürasyonları */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 360 }}>
        {Array.from({ length: playerCount }).map((_, i) => {
          const player = players[i];
          const chef = CHEFS.find((c) => c.id === player.chefId)!;
          return (
            <div key={i} style={{
              background: "#16213e", borderRadius: 12, padding: 14,
              border: `2px solid ${chef.color}40`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  overflow: "hidden", border: `2px solid ${chef.color}`,
                  flexShrink: 0, background: "#0f1923",
                }}>
                  <Image
                    src={`/assets/chefs/${chef.id}-portre.png`}
                    alt={chef.name}
                    width={44}
                    height={44}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
                <input
                  value={player.name}
                  onChange={(e) => updatePlayer(i, "name", e.target.value)}
                  maxLength={12}
                  style={{
                    flex: 1, background: "#0f3460", border: "none", borderRadius: 8,
                    padding: "8px 12px", color: "white", fontSize: 14, fontWeight: 600,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CHEFS.map((c) => {
                  const taken = usedChefs.includes(c.id) && c.id !== player.chefId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (!taken) {
                          updatePlayer(i, "chefId", c.id);
                          updatePlayer(i, "name", DEFAULT_NAMES[CHEFS.findIndex((ch) => ch.id === c.id)]);
                        }
                      }}
                      style={{
                        padding: "5px 8px", borderRadius: 8, fontSize: 11,
                        background: player.chefId === c.id ? c.color : "#0f3460",
                        color: "white", border: "none", cursor: taken ? "not-allowed" : "pointer",
                        opacity: taken ? 0.35 : 1, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 5,
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        overflow: "hidden", flexShrink: 0, background: "#0f1923",
                      }}>
                        <Image src={`/assets/chefs/${c.id}-portre.png`} alt={c.name} width={20} height={20}
                          style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                      </div>
                      {c.name}
                    </button>
                  );
                })}
              </div>
              <p style={{ color: "#8892a4", fontSize: 11, marginTop: 8, marginBottom: 0 }}>
                🎯 {chef.passiveDesc}
              </p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8, marginBottom: 24 }}>
        <button className="btn btn-secondary" onClick={() => setStep("mode")}>
          ← Geri
        </button>
        <button
          className="btn btn-primary"
          onClick={handleStart}
          style={{ fontSize: 16, padding: "12px 32px" }}
        >
          Oyunu Başlat 🍳
        </button>
      </div>
    </div>
  );
}
