import { GameCard } from "./types";

export const CHANCE_CARDS: GameCard[] = [
  {
    id: "c1",
    type: "chance",
    title: "Doğum Günü Yemeği!",
    description: "Tüm oyunculardan 50₺ topla.",
    effect: { type: "collect_from_all", amount: 50 },
  },
  {
    id: "c2",
    type: "chance",
    title: "Mutfak Sırrı",
    description: "Bankadan 100₺ al.",
    effect: { type: "gain_money", amount: 100 },
  },
  {
    id: "c3",
    type: "chance",
    title: "Malzeme Turu",
    description: "Bankadan 150₺ al.",
    effect: { type: "gain_money", amount: 150 },
  },
  {
    id: "c4",
    type: "chance",
    title: "Mutfak Kazası",
    description: "Bankaya 80₺ öde.",
    effect: { type: "lose_money", amount: 80 },
  },
  {
    id: "c5",
    type: "chance",
    title: "Kötü Yorum",
    description: "Her oyuncuya 40₺ öde.",
    effect: { type: "pay_to_all", amount: 40 },
  },
  {
    id: "c6",
    type: "chance",
    title: "Serbest Piyasa!",
    description: "Herhangi bir mülkü ücretsiz satın al.",
    effect: { type: "free_property_buy" },
  },
  {
    id: "c7",
    type: "chance",
    title: "Yıldız Hırsızı",
    description: "Bir rakibinin 1 Michelin yıldızını çal.",
    effect: { type: "steal_star" },
  },
  {
    id: "c8",
    type: "chance",
    title: "Sağlık Sertifikası",
    description: "Bir sonraki Sağlık Denetimi kartını iptal et.",
    effect: { type: "get_out_of_jail" },
  },
  {
    id: "c9",
    type: "chance",
    title: "Tatil İzni",
    description: "Başlangıca git, 200₺ al.",
    effect: { type: "move_to", squareId: 0 },
  },
  {
    id: "c10",
    type: "chance",
    title: "Sağlık Denetimi Geldi!",
    description: "Depoya git, 2 tur bekle.",
    effect: { type: "go_to_jail" },
  },
  {
    id: "c11",
    type: "chance",
    title: "Ödül Töreni",
    description: "Bankadan 200₺ al.",
    effect: { type: "gain_money", amount: 200 },
  },
  {
    id: "c12",
    type: "chance",
    title: "Teçhizat Arızası",
    description: "Bankaya 120₺ öde.",
    effect: { type: "lose_money", amount: 120 },
  },
  {
    id: "c13",
    type: "chance",
    title: "Gurme Kritik",
    description: "Bankadan 75₺ al.",
    effect: { type: "gain_money", amount: 75 },
  },
  {
    id: "c14",
    type: "chance",
    title: "Geri Adım!",
    description: "3 kare geri git.",
    effect: { type: "move_back", squares: 3 },
  },
  {
    id: "c15",
    type: "chance",
    title: "Mutfak Yangını!",
    description: "En yüksek kiralı restoranın 2 tur kapanır.",
    effect: { type: "close_top_restaurant", turns: 2 },
  },
  {
    id: "c16",
    type: "chance",
    title: "Franchise Anlaşması",
    description: "Bankadan 250₺ al.",
    effect: { type: "gain_money", amount: 250 },
  },
  {
    id: "c17",
    type: "chance",
    title: "Vergi Cezası",
    description: "Bankaya 150₺ öde.",
    effect: { type: "lose_money", amount: 150 },
  },
  {
    id: "c18",
    type: "chance",
    title: "Viral Tarif!",
    description: "Tüm oyunculardan 60₺ topla.",
    effect: { type: "collect_from_all", amount: 60 },
  },
  {
    id: "c19",
    type: "chance",
    title: "Kelebek Etkisi",
    description: "5 kare geri git.",
    effect: { type: "move_back", squares: 5 },
  },
  {
    id: "c20",
    type: "chance",
    title: "Mevsim Değişti!",
    description: "Mevsim Menüsü devreye girer.",
    effect: { type: "season_menu_activate" },
  },
];

export const shuffleCards = <T>(cards: T[]): T[] => {
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
