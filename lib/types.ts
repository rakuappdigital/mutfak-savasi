export type GameMode = "classic" | "quick";

export type ChefId = "marco" | "yuki" | "fatma" | "diego";

export interface Chef {
  id: ChefId;
  name: string;
  nationality: string;
  emoji: string;
  color: string;
  passive: string;
  passiveDesc: string;
}

export type SquareType =
  | "start"
  | "rest"
  | "tax"
  | "jail"
  | "ingredient_market"
  | "recipe"
  | "equipment"
  | "chance"
  | "fire"
  | "health_inspection"
  | "season_menu"
  | "duel_square";

export type IngredientGroup =
  | "domates"
  | "un"
  | "peynir"
  | "et"
  | "sebze";

export type RecipeGroup =
  | "italyan"
  | "japon"
  | "turk"
  | "meksika";

export interface Square {
  id: number;
  name: string;
  type: SquareType;
  group?: IngredientGroup | RecipeGroup;
  price?: number;
  baseRent?: number;
  rentByStars?: [number, number, number, number]; // [0,1,2,3 stars]
  mortgageValue?: number;
  color?: string;
  emoji?: string;
}

export interface Property {
  squareId: number;
  ownerId: string;
  stars: number; // 0-3
  isClosed: boolean; // Sağlık Denetimi / Yangın ile kapanır
  closeForTurns: number;
}

export interface Player {
  id: string;
  chefId: ChefId;
  name: string;
  money: number;
  position: number;
  isInJail: boolean;
  jailTurnsLeft: number;
  isBankrupt: boolean;
  passiveUsed: boolean; // Fatma'nın pasifini kullandı mı
  color: string;
  emoji: string;
}

export type CardType = "chance" | "fire" | "health_inspection" | "season_menu" | "butterfly";

export interface GameCard {
  id: string;
  type: CardType;
  title: string;
  description: string;
  effect: CardEffect;
}

export type CardEffect =
  | { type: "gain_money"; amount: number }
  | { type: "lose_money"; amount: number }
  | { type: "collect_from_all"; amount: number }
  | { type: "pay_to_all"; amount: number }
  | { type: "move_to"; squareId: number }
  | { type: "go_to_jail" }
  | { type: "get_out_of_jail" }
  | { type: "free_property_buy" }
  | { type: "steal_star" }
  | { type: "close_top_restaurant"; turns: number }
  | { type: "close_own_restaurant"; turns: number }
  | { type: "season_menu_activate" }
  | { type: "move_back"; squares: number };

export interface DuelState {
  challengerId: string;
  defenderId: string;
  squareId: number;
  rentAmount: number;
  timeLimit: number; // saniye
  challengerScore: number;
  defenderScore: number;
  finished: boolean;
  winnerId: string | null;
}

export type GamePhase =
  | "menu"
  | "player_setup"
  | "rolling"
  | "moving"
  | "action"
  | "buy_prompt"
  | "rent_prompt"
  | "duel_prompt"
  | "duel_active"
  | "card_draw"
  | "upgrade_prompt"
  | "jail_prompt"
  | "game_over";

export interface SeasonMenuState {
  active: boolean;
  squareIds: number[];
  turnsLeft: number;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  turn: number;
  maxTurns: number;
  board: Square[];
  properties: Property[];
  duel: DuelState | null;
  drawnCard: GameCard | null;
  seasonMenu: SeasonMenuState;
  lastDiceRoll: [number, number] | null;
  pendingSquare: Square | null;
  log: string[];
  winner: Player | null;
}
