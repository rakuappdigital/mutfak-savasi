import { SquareType } from "./types";

export function getSquareImage(type: SquareType, group?: string): string | null {
  if (group === "italyan") return "/assets/squares/italyan.png";
  if (group === "japon")   return "/assets/squares/japon.png";
  if (group === "turk")    return "/assets/squares/turk.png";
  if (group === "meksika") return "/assets/squares/meksika.png";
  if (group === "domates") return "/assets/squares/domates.png";
  if (group === "un")      return "/assets/squares/un.png";
  if (group === "peynir")  return "/assets/squares/peynir.png";
  if (group === "et")      return "/assets/squares/et.png";
  if (group === "sebze")   return "/assets/squares/sebze.png";
  switch (type) {
    case "start":             return "/assets/squares/baslangic.png";
    case "rest":              return "/assets/squares/dinlenme.png";
    case "tax":               return "/assets/squares/vergi.png";
    case "jail":              return "/assets/squares/depo.png";
    case "chance":            return "/assets/squares/sans.png";
    case "fire":              return "/assets/squares/yangin.png";
    case "health_inspection": return "/assets/squares/denetim.png";
    case "season_menu":       return "/assets/squares/mevsim.png";
    case "duel_square":       return "/assets/squares/duello.png";
    default:                  return null;
  }
}
