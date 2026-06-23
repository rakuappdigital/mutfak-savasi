"use client";
import { useState, useCallback } from "react";
import { GameState, GameMode, ChefId, GameCard } from "./types";
import {
  createInitialState, rollDice, movePlayer, resolveSquare,
  buyProperty, skipBuy, payRent, startDuel, resolveDuel,
  upgradeStar, applyCardEffect, endTurnIfNeeded,
} from "./game-engine";
import { CHEFS } from "./board-data";

export interface PlayerSetup {
  chefId: ChefId;
  name: string;
}

export function useGameState() {
  const [state, setState] = useState<GameState | null>(null);

  const startGame = useCallback((mode: GameMode, players: PlayerSetup[]) => {
    const configs = players.map((p, i) => {
      const chef = CHEFS.find((c) => c.id === p.chefId)!;
      return {
        id: `player_${i}`,
        chefId: p.chefId,
        name: p.name,
        color: chef.color,
        emoji: chef.emoji,
      };
    });
    setState(createInitialState(mode, configs));
  }, []);

  const handleRoll = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== "rolling") return prev;
      const dice = rollDice();
      const steps = dice[0] + dice[1];
      const moved = movePlayer({ ...prev, lastDiceRoll: dice }, steps);
      return resolveSquare(moved);
    });
  }, []);

  const handleBuy = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== "buy_prompt") return prev;
      return buyProperty(prev);
    });
  }, []);

  const handleSkipBuy = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== "buy_prompt") return prev;
      return skipBuy(prev);
    });
  }, []);

  const handlePayRent = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== "duel_prompt") return prev;
      return payRent(prev);
    });
  }, []);

  const handleStartDuel = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== "duel_prompt") return prev;
      return startDuel(prev);
    });
  }, []);

  const handleDuelResult = useCallback((challengerScore: number, defenderScore: number) => {
    setState((prev) => {
      if (!prev || prev.phase !== "duel_active") return prev;
      return resolveDuel(prev, challengerScore, defenderScore);
    });
  }, []);

  const handleUpgrade = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== "upgrade_prompt") return prev;
      return upgradeStar(prev);
    });
  }, []);

  const handleSkipUpgrade = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.phase !== "upgrade_prompt") return prev;
      const s = { ...prev, phase: "rolling" as const };
      return endTurnIfNeeded(s);
    });
  }, []);

  const handleCardEffect = useCallback((card: GameCard) => {
    setState((prev) => {
      if (!prev || prev.phase !== "card_draw") return prev;
      return applyCardEffect(prev, card);
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(null);
  }, []);

  return {
    state,
    startGame,
    handleRoll,
    handleBuy,
    handleSkipBuy,
    handlePayRent,
    handleStartDuel,
    handleDuelResult,
    handleUpgrade,
    handleSkipUpgrade,
    handleCardEffect,
    resetGame,
  };
}
