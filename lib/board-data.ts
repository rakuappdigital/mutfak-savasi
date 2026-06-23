import { Square, Chef } from "./types";

export const CHEFS: Chef[] = [
  {
    id: "marco",
    name: "Marco",
    nationality: "İtalyan",
    emoji: "👨‍🍳",
    color: "#e74c3c",
    passive: "Pasta Ustası",
    passiveDesc: "İtalyan grubu Tarif Kartları %20 indirimli",
  },
  {
    id: "yuki",
    name: "Yuki",
    nationality: "Japon",
    emoji: "🧑‍🍳",
    color: "#3498db",
    passive: "Odak",
    passiveDesc: "Düellolarda +1 saniye ek süre",
  },
  {
    id: "fatma",
    name: "Fatma",
    nationality: "Türk",
    emoji: "👩‍🍳",
    color: "#e67e22",
    passive: "Sağlam Mutfak",
    passiveDesc: "Sağlık Denetimi kartını bir kez yok say",
  },
  {
    id: "diego",
    name: "Diego",
    nationality: "Meksikalı",
    emoji: "🧑‍🍳",
    color: "#2ecc71",
    passive: "Pazar Dostu",
    passiveDesc: "Malzeme Pazarı karelerine kira ödemez, bonus çeker",
  },
];

// 62 kare
export const BOARD: Square[] = [
  // KÖŞE 1
  { id: 0, name: "Başlangıç", type: "start", emoji: "🏁" },

  // GRUP 1 — Domates (kırmızı)
  { id: 1, name: "Domates Tezgahı", type: "ingredient_market", group: "domates", price: 60, baseRent: 10, rentByStars: [10, 30, 90, 160], mortgageValue: 30, color: "#e74c3c", emoji: "🍅" },
  { id: 2, name: "Şans", type: "chance", emoji: "🎲" },
  { id: 3, name: "Domates Bahçesi", type: "ingredient_market", group: "domates", price: 80, baseRent: 15, rentByStars: [15, 45, 110, 200], mortgageValue: 40, color: "#e74c3c", emoji: "🍅" },
  { id: 4, name: "Sağlık Vergisi", type: "tax", emoji: "💸" },

  // Ekipman 1
  { id: 5, name: "Fırın", type: "equipment", price: 200, baseRent: 25, rentByStars: [25, 50, 100, 200], mortgageValue: 100, emoji: "🔥" },

  // GRUP 2 — Un (sarı)
  { id: 6, name: "Un Değirmeni", type: "ingredient_market", group: "un", price: 100, baseRent: 20, rentByStars: [20, 60, 180, 320], mortgageValue: 50, color: "#f1c40f", emoji: "🌾" },
  { id: 7, name: "Sağlık Denetimi", type: "health_inspection", emoji: "🏥" },
  { id: 8, name: "Un Ambarı", type: "ingredient_market", group: "un", price: 100, baseRent: 20, rentByStars: [20, 60, 180, 320], mortgageValue: 50, color: "#f1c40f", emoji: "🌾" },
  { id: 9, name: "Un Fabrikası", type: "ingredient_market", group: "un", price: 120, baseRent: 25, rentByStars: [25, 75, 220, 400], mortgageValue: 60, color: "#f1c40f", emoji: "🌾" },

  // KÖŞE 2
  { id: 10, name: "Dinlenme Molası", type: "rest", emoji: "☕" },

  // GRUP 3 — Peynir (turuncu)
  { id: 11, name: "Peynir Mahzeni", type: "ingredient_market", group: "peynir", price: 140, baseRent: 30, rentByStars: [30, 90, 270, 400], mortgageValue: 70, color: "#e67e22", emoji: "🧀" },
  { id: 12, name: "Ekipman", type: "equipment", price: 200, baseRent: 25, mortgageValue: 100, emoji: "🔪" },
  { id: 13, name: "Peynir Çiftliği", type: "ingredient_market", group: "peynir", price: 140, baseRent: 30, rentByStars: [30, 90, 270, 400], mortgageValue: 70, color: "#e67e22", emoji: "🧀" },
  { id: 14, name: "Peynir Deposu", type: "ingredient_market", group: "peynir", price: 160, baseRent: 35, rentByStars: [35, 100, 300, 450], mortgageValue: 80, color: "#e67e22", emoji: "🧀" },

  // GRUP 4 — Tarifler (İtalyan - yeşil)
  { id: 15, name: "Pizza Margherita", type: "recipe", group: "italyan", price: 180, baseRent: 40, rentByStars: [40, 120, 360, 500], mortgageValue: 90, color: "#27ae60", emoji: "🍕" },
  { id: 16, name: "Mutfak Yangını", type: "fire", emoji: "🔥" },
  { id: 17, name: "Spaghetti Bolognese", type: "recipe", group: "italyan", price: 180, baseRent: 40, rentByStars: [40, 120, 360, 500], mortgageValue: 90, color: "#27ae60", emoji: "🍝" },
  { id: 18, name: "Tiramisu", type: "recipe", group: "italyan", price: 200, baseRent: 50, rentByStars: [50, 150, 450, 600], mortgageValue: 100, color: "#27ae60", emoji: "🍮" },

  // KÖŞE 3 — Depo (Hapis)
  { id: 19, name: "Depo", type: "jail", emoji: "🔒" },

  // GRUP 5 — Et (mor)
  { id: 20, name: "Et Kasabı", type: "ingredient_market", group: "et", price: 220, baseRent: 55, rentByStars: [55, 165, 495, 700], mortgageValue: 110, color: "#9b59b6", emoji: "🥩" },
  { id: 21, name: "Şans", type: "chance", emoji: "🎲" },
  { id: 22, name: "Et Çiftliği", type: "ingredient_market", group: "et", price: 220, baseRent: 55, rentByStars: [55, 165, 495, 700], mortgageValue: 110, color: "#9b59b6", emoji: "🥩" },
  { id: 23, name: "Gurme Kasap", type: "ingredient_market", group: "et", price: 240, baseRent: 65, rentByStars: [65, 195, 580, 800], mortgageValue: 120, color: "#9b59b6", emoji: "🥩" },

  // Ekipman 3
  { id: 24, name: "Mixer", type: "equipment", price: 200, baseRent: 25, mortgageValue: 100, emoji: "🥣" },

  // GRUP 6 — Sebze (açık yeşil)
  { id: 25, name: "Pazar Tezgahı", type: "ingredient_market", group: "sebze", price: 260, baseRent: 75, rentByStars: [75, 225, 675, 900], mortgageValue: 130, color: "#1abc9c", emoji: "🥦" },
  { id: 26, name: "Mevsim Menüsü", type: "season_menu", emoji: "🍂" },
  { id: 27, name: "Organik Bahçe", type: "ingredient_market", group: "sebze", price: 260, baseRent: 75, rentByStars: [75, 225, 675, 900], mortgageValue: 130, color: "#1abc9c", emoji: "🥬" },
  { id: 28, name: "Sebze Deposu", type: "ingredient_market", group: "sebze", price: 280, baseRent: 85, rentByStars: [85, 250, 750, 1000], mortgageValue: 140, color: "#1abc9c", emoji: "🫑" },

  // KÖŞE 4 — Sağlık Vergisi
  { id: 29, name: "Sağlık Vergisi", type: "tax", emoji: "💸" },

  // GRUP 7 — Tarifler (Japon - mavi)
  { id: 30, name: "Sushi Tabağı", type: "recipe", group: "japon", price: 300, baseRent: 90, rentByStars: [90, 270, 800, 1100], mortgageValue: 150, color: "#2980b9", emoji: "🍱" },
  { id: 31, name: "Sağlık Denetimi", type: "health_inspection", emoji: "🏥" },
  { id: 32, name: "Ramen", type: "recipe", group: "japon", price: 300, baseRent: 90, rentByStars: [90, 270, 800, 1100], mortgageValue: 150, color: "#2980b9", emoji: "🍜" },
  { id: 33, name: "Tempura", type: "recipe", group: "japon", price: 320, baseRent: 100, rentByStars: [100, 300, 900, 1200], mortgageValue: 160, color: "#2980b9", emoji: "🍤" },

  // Ekipman 4
  { id: 34, name: "Buharlı Tencere", type: "equipment", price: 200, baseRent: 25, mortgageValue: 100, emoji: "♨️" },

  // GRUP 8 — Tarifler (Türk - kırmızı koyu)
  { id: 35, name: "Döner", type: "recipe", group: "turk", price: 340, baseRent: 110, rentByStars: [110, 330, 1000, 1300], mortgageValue: 170, color: "#c0392b", emoji: "🌯" },
  { id: 36, name: "Mutfak Yangını", type: "fire", emoji: "🔥" },
  { id: 37, name: "Mantı", type: "recipe", group: "turk", price: 340, baseRent: 110, rentByStars: [110, 330, 1000, 1300], mortgageValue: 170, color: "#c0392b", emoji: "🥟" },
  { id: 38, name: "Baklava", type: "recipe", group: "turk", price: 360, baseRent: 120, rentByStars: [120, 360, 1100, 1500], mortgageValue: 180, color: "#c0392b", emoji: "🍯" },

  // KÖŞE 5
  { id: 39, name: "Başlangıç", type: "start", emoji: "🏁" }, // ikinci başlangıç (62 kare döngüsel)

  // GRUP 9 — Tarifler (Meksika - turuncu)
  { id: 40, name: "Taco", type: "recipe", group: "meksika", price: 380, baseRent: 130, rentByStars: [130, 390, 1200, 1600], mortgageValue: 190, color: "#d35400", emoji: "🌮" },
  { id: 41, name: "Şans", type: "chance", emoji: "🎲" },
  { id: 42, name: "Burrito", type: "recipe", group: "meksika", price: 380, baseRent: 130, rentByStars: [130, 390, 1200, 1600], mortgageValue: 190, color: "#d35400", emoji: "🌯" },
  { id: 43, name: "Enchilada", type: "recipe", group: "meksika", price: 400, baseRent: 150, rentByStars: [150, 450, 1400, 2000], mortgageValue: 200, color: "#d35400", emoji: "🫔" },

  // Ekipman 5
  { id: 44, name: "Barbekü", type: "equipment", price: 200, baseRent: 25, mortgageValue: 100, emoji: "🍖" },

  // Ekstra malzeme kareleri (tekrar gruplar zenginleştirme)
  { id: 45, name: "Şans", type: "chance", emoji: "🎲" },
  { id: 46, name: "Mevsim Menüsü", type: "season_menu", emoji: "🍂" },
  { id: 47, name: "Düello Meydanı", type: "duel_square", emoji: "⚔️" },

  // Daha fazla malzeme — tekrar gruplar
  { id: 48, name: "Özel Domates", type: "ingredient_market", group: "domates", price: 420, baseRent: 160, rentByStars: [160, 480, 1500, 2000], mortgageValue: 210, color: "#e74c3c", emoji: "🍅" },
  { id: 49, name: "Sağlık Denetimi", type: "health_inspection", emoji: "🏥" },
  { id: 50, name: "Gurme Un", type: "ingredient_market", group: "un", price: 440, baseRent: 170, rentByStars: [170, 510, 1600, 2200], mortgageValue: 220, color: "#f1c40f", emoji: "🌾" },

  // KÖŞE 6
  { id: 51, name: "Depo", type: "jail", emoji: "🔒" },

  { id: 52, name: "Gurme Peynir", type: "ingredient_market", group: "peynir", price: 460, baseRent: 180, rentByStars: [180, 540, 1700, 2400], mortgageValue: 230, color: "#e67e22", emoji: "🧀" },
  { id: 53, name: "Mutfak Yangını", type: "fire", emoji: "🔥" },
  { id: 54, name: "Gurme Et", type: "ingredient_market", group: "et", price: 480, baseRent: 200, rentByStars: [200, 600, 1800, 2600], mortgageValue: 240, color: "#9b59b6", emoji: "🥩" },
  { id: 55, name: "Ekipman", type: "equipment", price: 200, baseRent: 25, mortgageValue: 100, emoji: "🫕" },

  { id: 56, name: "Şans", type: "chance", emoji: "🎲" },
  { id: 57, name: "Tropikal Sebze", type: "ingredient_market", group: "sebze", price: 500, baseRent: 220, rentByStars: [220, 660, 2000, 2800], mortgageValue: 250, color: "#1abc9c", emoji: "🥑" },
  { id: 58, name: "Düello Meydanı", type: "duel_square", emoji: "⚔️" },
  { id: 59, name: "Mevsim Menüsü", type: "season_menu", emoji: "🍂" },

  // KÖŞE 7
  { id: 60, name: "Sağlık Vergisi", type: "tax", emoji: "💸" },

  { id: 61, name: "Şef Mutfağı (Joker)", type: "recipe", group: "italyan", price: 560, baseRent: 250, rentByStars: [250, 750, 2500, 4000], mortgageValue: 300, color: "#8e44ad", emoji: "⭐" },
];

export const BOARD_SIZE = BOARD.length; // 62

export const GROUP_COLORS: Record<string, string> = {
  domates: "#e74c3c",
  un: "#f1c40f",
  peynir: "#e67e22",
  et: "#9b59b6",
  sebze: "#1abc9c",
  italyan: "#27ae60",
  japon: "#2980b9",
  turk: "#c0392b",
  meksika: "#d35400",
};

export const GROUP_SIZES: Record<string, number> = {
  domates: 3,
  un: 3,
  peynir: 3,
  et: 3,
  sebze: 3,
  italyan: 3,
  japon: 3,
  turk: 3,
  meksika: 3,
};

export const TAX_AMOUNT = 75;
export const START_BONUS = 200;
export const STARTING_MONEY = 1500;
export const STAR_COST = 150; // Her yıldız için maliyet
export const QUICK_MODE_TURNS = 20;
