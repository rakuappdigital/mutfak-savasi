import {
  GameState, Player, Property, Square, GameCard, CardEffect,
  DuelState, SeasonMenuState, ChefId, GameMode,
} from "./types";
import {
  BOARD, BOARD_SIZE, TAX_AMOUNT, START_BONUS, STAR_COST, QUICK_MODE_TURNS, GROUP_SIZES,
} from "./board-data";
import { CHANCE_CARDS, shuffleCards } from "./cards";

// ─── Yardımcı ────────────────────────────────────────────────────────────────

export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

export function getSquare(id: number): Square {
  return BOARD[id % BOARD_SIZE];
}

export function getProperty(state: GameState, squareId: number): Property | undefined {
  return state.properties.find((p) => p.squareId === squareId);
}

export function getPlayerProperties(state: GameState, playerId: string): Property[] {
  return state.properties.filter((p) => p.ownerId === playerId);
}

export function ownsFullGroup(state: GameState, playerId: string, group: string): boolean {
  const groupSquares = BOARD.filter((s) => s.group === group);
  const playerOwned = state.properties.filter(
    (p) => p.ownerId === playerId && groupSquares.some((s) => s.id === p.squareId)
  );
  return playerOwned.length === (GROUP_SIZES[group] ?? 0);
}

export function calculateRent(state: GameState, square: Square, property: Property): number {
  if (property.isClosed) return 0;

  let rent = 0;
  if (square.rentByStars) {
    rent = square.rentByStars[property.stars];
  } else {
    rent = square.baseRent ?? 0;
  }

  // Tam grup bonusu (yıldızsız): 2x
  if (property.stars === 0 && square.group && ownsFullGroup(state, property.ownerId, square.group)) {
    rent *= 2;
  }

  // Mevsim Menüsü aktifse 1.5x
  if (state.seasonMenu.active && state.seasonMenu.squareIds.includes(square.id)) {
    rent = Math.floor(rent * 1.5);
  }

  return rent;
}

export function calculateNetWorth(state: GameState, playerId: string): number {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return 0;
  const propertyValue = getPlayerProperties(state, playerId).reduce((sum, prop) => {
    const sq = getSquare(prop.squareId);
    return sum + (sq.mortgageValue ?? 0) + prop.stars * STAR_COST;
  }, 0);
  return player.money + propertyValue;
}

export function getTopRestaurant(state: GameState): Property | null {
  let top: Property | null = null;
  let topRent = 0;
  for (const prop of state.properties) {
    const sq = getSquare(prop.squareId);
    const rent = calculateRent(state, sq, prop);
    if (rent > topRent) {
      topRent = rent;
      top = prop;
    }
  }
  return top;
}

// ─── Başlangıç ────────────────────────────────────────────────────────────────

export function createInitialState(
  mode: GameMode,
  playerConfigs: { id: string; chefId: ChefId; name: string; color: string; emoji: string }[]
): GameState {
  const players: Player[] = playerConfigs.map((cfg) => ({
    id: cfg.id,
    chefId: cfg.chefId,
    name: cfg.name,
    money: 1500,
    position: 0,
    isInJail: false,
    jailTurnsLeft: 0,
    isBankrupt: false,
    passiveUsed: false,
    color: cfg.color,
    emoji: cfg.emoji,
  }));

  return {
    mode,
    phase: "rolling",
    players,
    currentPlayerIndex: 0,
    turn: 1,
    maxTurns: mode === "quick" ? QUICK_MODE_TURNS : Infinity,
    board: BOARD,
    properties: [],
    duel: null,
    drawnCard: null,
    seasonMenu: { active: false, squareIds: [], turnsLeft: 0 },
    lastDiceRoll: null,
    pendingSquare: null,
    log: ["Oyun başladı! İyi şanslar! 🍽️"],
    winner: null,
  };
}

// ─── Hamle ────────────────────────────────────────────────────────────────────

// Sadece dice roll + phase moving — çözümleme animasyon bitince
export function startMove(state: GameState, dice: [number, number]): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const steps = dice[0] + dice[1];
  const oldPos = player.position;
  const newPos = (oldPos + steps) % BOARD_SIZE;

  if (newPos < oldPos || (oldPos + steps) >= BOARD_SIZE) {
    player.money += START_BONUS;
    s.log.push(`${player.name} Başlangıç'ı geçti, +${START_BONUS}₺ 🏁`);
  }

  player.position = newPos;
  s.lastDiceRoll = dice;
  s.phase = "moving"; // UI animasyon için bekler
  return s;
}

export function movePlayer(state: GameState, steps: number): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const oldPos = player.position;
  const newPos = (oldPos + steps) % BOARD_SIZE;

  if (newPos < oldPos || (oldPos + steps) >= BOARD_SIZE) {
    player.money += START_BONUS;
    s.log.push(`${player.name} Başlangıç'ı geçti, +${START_BONUS}₺ 🏁`);
  }

  player.position = newPos;
  const square = getSquare(newPos);
  s.pendingSquare = square;
  s.phase = "action";
  s.log.push(`${player.name} → ${square.name}`);

  return s;
}

// Animasyon bittikten sonra çağrılır
export function finishMove(state: GameState): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const square = getSquare(player.position);
  s.pendingSquare = square;
  s.phase = "action";
  s.log.push(`${player.name} → ${square.name}`);
  return resolveSquare(s);
}

// ─── Kare Eylemi ──────────────────────────────────────────────────────────────

export function resolveSquare(state: GameState): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const square = s.pendingSquare!;

  switch (square.type) {
    case "start":
      player.money += START_BONUS;
      s.log.push(`${player.name} Başlangıç'a indi, +${START_BONUS}₺`);
      s.phase = "rolling";
      return endTurnIfNeeded(s);

    case "rest":
      s.log.push(`${player.name} dinleniyor ☕`);
      s.phase = "rolling";
      return endTurnIfNeeded(s);

    case "tax": {
      const tax = Math.floor(player.money * 0.1);
      player.money = Math.max(0, player.money - tax);
      s.log.push(`${player.name} vergi ödedi: ${tax}₺ 💸`);
      s.phase = "rolling";
      return checkBankruptcy(endTurnIfNeeded(s), player.id);
    }

    case "jail":
      s.log.push(`${player.name} Depo'ya girdi! 🔒`);
      player.isInJail = true;
      player.jailTurnsLeft = 2;
      s.phase = "rolling";
      return endTurnIfNeeded(s);

    case "chance": {
      const deck = shuffleCards(CHANCE_CARDS);
      const card = deck[0];
      s.drawnCard = card;
      s.phase = "card_draw";
      s.log.push(`${player.name} Şans kartı çekti: ${card.title}`);
      return s;
    }

    case "fire": {
      // En yüksek kiralı kendi restoranı kapanır
      const ownProps = getPlayerProperties(s, player.id).filter((p) => !p.isClosed);
      if (ownProps.length === 0) {
        s.log.push(`${player.name} Mutfak Yangını: etkilenecek mülk yok 🔥`);
        s.phase = "rolling";
        return endTurnIfNeeded(s);
      }
      // En yüksek kiralıyı bul
      let topProp = ownProps[0];
      let topR = calculateRent(s, getSquare(topProp.squareId), topProp);
      for (const p of ownProps) {
        const r = calculateRent(s, getSquare(p.squareId), p);
        if (r > topR) { topR = r; topProp = p; }
      }
      const propIdx = s.properties.findIndex((p) => p.squareId === topProp.squareId);
      s.properties[propIdx].isClosed = true;
      s.properties[propIdx].closeForTurns = 2;
      s.log.push(`${player.name}'in ${getSquare(topProp.squareId).name} 2 tur kapandı! 🔥`);
      s.phase = "rolling";
      return endTurnIfNeeded(s);
    }

    case "health_inspection": {
      // Fatma pasifi
      if (player.chefId === "fatma" && !player.passiveUsed) {
        player.passiveUsed = true;
        s.log.push(`${player.name} Sağlam Mutfak pasifini kullandı — Denetim iptal! 🛡️`);
        s.phase = "rolling";
        return endTurnIfNeeded(s);
      }
      const top = getTopRestaurant(s);
      if (!top) {
        s.log.push("Sağlık Denetimi: etkilenecek restoran yok 🏥");
        s.phase = "rolling";
        return endTurnIfNeeded(s);
      }
      const idx = s.properties.findIndex((p) => p.squareId === top.squareId);
      s.properties[idx].isClosed = true;
      s.properties[idx].closeForTurns = 1;
      s.log.push(`Sağlık Denetimi: ${getSquare(top.squareId).name} 1 tur kapandı! 🏥`);
      s.phase = "rolling";
      return endTurnIfNeeded(s);
    }

    case "season_menu":
      return activateSeasonMenu(s);

    case "ingredient_market":
    case "recipe":
    case "equipment": {
      const existing = getProperty(s, square.id);
      if (!existing) {
        s.phase = "buy_prompt";
        return s;
      }
      if (existing.ownerId === player.id) {
        // Kendi mülkü — yükseltme teklif et
        s.phase = "upgrade_prompt";
        return s;
      }
      // Başkasının mülkü
      const rent = calculateRent(s, square, existing);
      // Diego pasifi: Malzeme Pazarı'nda kira ödemez
      if (player.chefId === "diego" && square.type === "ingredient_market") {
        s.log.push(`${player.name} Pazar Dostu pasifi: kira ödemedi! 🌮`);
        s.phase = "rolling";
        return endTurnIfNeeded(s);
      }
      s.phase = "duel_prompt";
      s.duel = {
        challengerId: player.id,
        defenderId: existing.ownerId,
        squareId: square.id,
        rentAmount: rent,
        timeLimit: player.chefId === "yuki" ? 6 : 5,
        challengerScore: 0,
        defenderScore: 0,
        finished: false,
        winnerId: null,
      };
      return s;
    }

    default:
      s.phase = "rolling";
      return endTurnIfNeeded(s);
  }
}

// ─── Satın Alma ───────────────────────────────────────────────────────────────

export function buyProperty(state: GameState): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const square = s.pendingSquare!;
  let price = square.price ?? 0;

  // Marco pasifi: İtalyan tarifler %20 indirim
  if (player.chefId === "marco" && square.group === "italyan") {
    price = Math.floor(price * 0.8);
    s.log.push(`Marco Pasta Ustası pasifi: %20 indirim!`);
  }

  if (player.money < price) {
    s.log.push(`${player.name} yeterli parası yok (${price}₺ gerekli)`);
    s.phase = "rolling";
    return endTurnIfNeeded(s);
  }

  player.money -= price;
  s.properties.push({ squareId: square.id, ownerId: player.id, stars: 0, isClosed: false, closeForTurns: 0 });
  s.log.push(`${player.name} → ${square.name} satın aldı (${price}₺) 🏠`);
  s.phase = "rolling";
  return endTurnIfNeeded(s);
}

export function skipBuy(state: GameState): GameState {
  const s = deepClone(state);
  s.log.push(`${s.players[s.currentPlayerIndex].name} satın almadı`);
  s.phase = "rolling";
  return endTurnIfNeeded(s);
}

// ─── Kira / Düello ───────────────────────────────────────────────────────────

export function payRent(state: GameState): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const square = s.pendingSquare!;
  const prop = getProperty(s, square.id)!;
  const owner = s.players.find((p) => p.id === prop.ownerId)!;
  const rent = calculateRent(s, square, prop);

  const paid = Math.min(player.money, rent);
  player.money -= paid;
  owner.money += paid;
  s.log.push(`${player.name} → ${owner.name}'e ${paid}₺ kira ödedi 💰`);
  s.phase = "rolling";
  return checkBankruptcy(endTurnIfNeeded(s), player.id);
}

export function startDuel(state: GameState): GameState {
  const s = deepClone(state);
  s.phase = "duel_active";
  s.log.push(`Düello başladı! ⚔️`);
  return s;
}

export function resolveDuel(state: GameState, challengerScore: number, defenderScore: number): GameState {
  const s = deepClone(state);
  const duel = s.duel!;
  duel.challengerScore = challengerScore;
  duel.defenderScore = defenderScore;
  duel.finished = true;

  const challenger = s.players.find((p) => p.id === duel.challengerId)!;
  const defender = s.players.find((p) => p.id === duel.defenderId)!;

  if (challengerScore > defenderScore) {
    // Challenger kazandı: mülkü çal
    duel.winnerId = duel.challengerId;
    const propIdx = s.properties.findIndex((p) => p.squareId === duel.squareId);
    s.properties[propIdx].ownerId = duel.challengerId;
    s.log.push(`${challenger.name} düelloyu kazandı! ${getSquare(duel.squareId).name}'ı aldı 🏆`);
  } else {
    // Defender kazandı: 2x kira öde
    duel.winnerId = duel.defenderId;
    const prop = getProperty(s, duel.squareId)!;
    const sq = getSquare(duel.squareId);
    const rent = calculateRent(s, sq, prop) * 2;
    const paid = Math.min(challenger.money, rent);
    challenger.money -= paid;
    defender.money += paid;
    s.log.push(`${defender.name} düelloyu kazandı! ${challenger.name} 2x kira ödedi: ${paid}₺ 💸`);
    checkBankruptcy(s, challenger.id);
  }

  s.duel = duel;
  s.phase = "rolling";
  return endTurnIfNeeded(s);
}

// ─── Yükseltme ───────────────────────────────────────────────────────────────

export function upgradeStar(state: GameState): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const square = s.pendingSquare!;
  const propIdx = s.properties.findIndex((p) => p.squareId === square.id);
  const prop = s.properties[propIdx];

  if (prop.stars >= 3) {
    s.log.push(`${square.name} zaten 3 yıldızlı! ⭐⭐⭐`);
    s.phase = "rolling";
    return endTurnIfNeeded(s);
  }

  if (!ownsFullGroup(s, player.id, square.group!)) {
    s.log.push(`Yıldız için tüm grubu sahip olmalısın!`);
    s.phase = "rolling";
    return endTurnIfNeeded(s);
  }

  if (player.money < STAR_COST) {
    s.log.push(`Yeterli para yok (${STAR_COST}₺ gerekli)`);
    s.phase = "rolling";
    return endTurnIfNeeded(s);
  }

  player.money -= STAR_COST;
  s.properties[propIdx].stars += 1;
  const stars = "⭐".repeat(s.properties[propIdx].stars);
  s.log.push(`${square.name} → ${stars} (${STAR_COST}₺)`);
  s.phase = "rolling";
  return endTurnIfNeeded(s);
}

// ─── Kart Etkisi ─────────────────────────────────────────────────────────────

export function applyCardEffect(state: GameState, card: GameCard): GameState {
  const s = deepClone(state);
  const player = s.players[s.currentPlayerIndex];
  const effect: CardEffect = card.effect;

  switch (effect.type) {
    case "gain_money":
      player.money += effect.amount;
      break;
    case "lose_money":
      player.money = Math.max(0, player.money - effect.amount);
      checkBankruptcy(s, player.id);
      break;
    case "collect_from_all":
      s.players.forEach((p) => {
        if (p.id !== player.id) {
          const paid = Math.min(p.money, effect.amount);
          p.money -= paid;
          player.money += paid;
        }
      });
      break;
    case "pay_to_all":
      s.players.forEach((p) => {
        if (p.id !== player.id) {
          const paid = Math.min(player.money, effect.amount);
          player.money -= paid;
          p.money += paid;
        }
      });
      checkBankruptcy(s, player.id);
      break;
    case "move_to": {
      const target = effect.squareId;
      if (target < player.position) {
        player.money += START_BONUS;
        s.log.push(`${player.name} Başlangıç'ı geçti, +${START_BONUS}₺`);
      }
      player.position = target;
      s.pendingSquare = getSquare(target);
      s.drawnCard = null;
      return resolveSquare(s);
    }
    case "go_to_jail":
      player.isInJail = true;
      player.jailTurnsLeft = 2;
      player.position = 19;
      break;
    case "get_out_of_jail":
      player.isInJail = false;
      player.jailTurnsLeft = 0;
      s.log.push(`${player.name} Depo'dan çıktı 🔓`);
      break;
    case "steal_star": {
      const victims = s.players.filter((p) => p.id !== player.id && !p.isBankrupt);
      if (victims.length > 0) {
        const victim = victims[Math.floor(Math.random() * victims.length)];
        const victimProps = getPlayerProperties(s, victim.id).filter((p) => p.stars > 0);
        if (victimProps.length > 0) {
          const target = victimProps[Math.floor(Math.random() * victimProps.length)];
          const idx = s.properties.findIndex((p) => p.squareId === target.squareId);
          s.properties[idx].stars -= 1;
          s.log.push(`${player.name}, ${victim.name}'in ${getSquare(target.squareId).name}'dan yıldız çaldı! ⭐`);
        }
      }
      break;
    }
    case "close_top_restaurant": {
      const top = getTopRestaurant(s);
      if (top) {
        const idx = s.properties.findIndex((p) => p.squareId === top.squareId);
        s.properties[idx].isClosed = true;
        s.properties[idx].closeForTurns = effect.turns;
        s.log.push(`${getSquare(top.squareId).name} ${effect.turns} tur kapandı! 🔥`);
      }
      break;
    }
    case "season_menu_activate":
      return activateSeasonMenu(s);
    case "free_property_buy":
      s.log.push(`${player.name} ücretsiz mülk satın alma hakkı kazandı! (Bir sonraki durağında geçerli)`);
      break;
    case "move_back": {
      const newPos = (player.position - effect.squares + BOARD_SIZE) % BOARD_SIZE;
      player.position = newPos;
      s.pendingSquare = getSquare(newPos);
      s.drawnCard = null;
      return resolveSquare(s);
    }
    default:
      break;
  }

  s.drawnCard = null;
  s.phase = "rolling";
  return endTurnIfNeeded(s);
}

// ─── Mevsim Menüsü ───────────────────────────────────────────────────────────

function activateSeasonMenu(state: GameState): GameState {
  const s = deepClone(state);
  const purchasable = BOARD.filter((sq) =>
    sq.type === "ingredient_market" || sq.type === "recipe"
  );
  const shuffled = shuffleCards(purchasable);
  const chosen = shuffled.slice(0, 3).map((sq) => sq.id);
  s.seasonMenu = { active: true, squareIds: chosen, turnsLeft: 1 };
  const names = chosen.map((id) => getSquare(id).name).join(", ");
  s.log.push(`🍂 Mevsim Menüsü: ${names} → 1 tur boyunca 1.5x kira!`);
  s.phase = "rolling";
  return endTurnIfNeeded(s);
}

// ─── İflas ───────────────────────────────────────────────────────────────────

function checkBankruptcy(state: GameState, playerId: string): GameState {
  const s = state;
  const player = s.players.find((p) => p.id === playerId)!;
  if (player.money <= 0) {
    player.isBankrupt = true;
    player.money = 0;
    // Mülkleri serbest bırak
    s.properties = s.properties.filter((p) => p.ownerId !== playerId);
    s.log.push(`${player.name} iflas etti! 💀`);
    return checkWinCondition(s);
  }
  return s;
}

function checkWinCondition(state: GameState): GameState {
  const s = state;
  const active = s.players.filter((p) => !p.isBankrupt);
  if (active.length === 1) {
    s.winner = active[0];
    s.phase = "game_over";
    s.log.push(`🏆 ${active[0].name} kazandı!`);
  }
  return s;
}

// ─── Tur Sonu ────────────────────────────────────────────────────────────────

export function endTurnIfNeeded(state: GameState): GameState {
  const s = deepClone(state);
  if (s.phase !== "rolling") return s;

  // Kapalı mülklerin sayacını azalt
  s.properties = s.properties.map((p) => {
    if (p.isClosed && p.closeForTurns > 0) {
      const newTurns = p.closeForTurns - 1;
      return { ...p, closeForTurns: newTurns, isClosed: newTurns > 0 };
    }
    return p;
  });

  // Mevsim Menüsü sayacını azalt
  if (s.seasonMenu.active) {
    s.seasonMenu.turnsLeft -= 1;
    if (s.seasonMenu.turnsLeft <= 0) {
      s.seasonMenu = { active: false, squareIds: [], turnsLeft: 0 };
      s.log.push("🍂 Mevsim Menüsü sona erdi.");
    }
  }

  // Sıradaki oyuncu
  let nextIdx = (s.currentPlayerIndex + 1) % s.players.length;
  // İflas etmişleri atla
  let attempts = 0;
  while (s.players[nextIdx].isBankrupt && attempts < s.players.length) {
    nextIdx = (nextIdx + 1) % s.players.length;
    attempts++;
  }

  // Eğer döngü tamamlandıysa tur arttır
  if (nextIdx <= s.currentPlayerIndex) {
    s.turn += 1;

    // Her 5 turda Mevsim Menüsü tetikle
    if (s.turn % 5 === 0 && !s.seasonMenu.active) {
      return activateSeasonMenu(s);
    }

    // Hızlı mod: tur limiti
    if (s.mode === "quick" && s.turn > s.maxTurns) {
      return resolveQuickModeWinner(s);
    }
  }

  s.currentPlayerIndex = nextIdx;

  // Hapisteki oyuncu
  const nextPlayer = s.players[nextIdx];
  if (nextPlayer.isInJail) {
    nextPlayer.jailTurnsLeft -= 1;
    if (nextPlayer.jailTurnsLeft <= 0) {
      nextPlayer.isInJail = false;
      s.log.push(`${nextPlayer.name} Depo'dan çıktı! 🔓`);
    } else {
      s.log.push(`${nextPlayer.name} Depo'da (${nextPlayer.jailTurnsLeft} tur kaldı) 🔒`);
    }
  }

  return s;
}

function resolveQuickModeWinner(state: GameState): GameState {
  const s = state;
  const active = s.players.filter((p) => !p.isBankrupt);
  const ranked = active.sort((a, b) => calculateNetWorth(s, b.id) - calculateNetWorth(s, a.id));
  s.winner = ranked[0];
  s.phase = "game_over";
  s.log.push(`⏱️ Süre doldu! En zengin şef: ${ranked[0].name} (${calculateNetWorth(s, ranked[0].id)}₺)`);
  return s;
}

// ─── Yardımcı ────────────────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
