export const PET_COLOR_THEME_MAP: Record<string, string> = {
  Red: "#ef4444",
  Orange: "#f97316",
  Yellow: "#eab308",
  Green: "#22c55e",
  Teal: "#14b8a6",
  Blue: "#3b82f6",
  Purple: "#a855f7",
  Pink: "#ec4899",
  Brown: "#92400e",
};

export const PET_COLOR_NONE = "#9ca3af";

export function getColorForPet(themeColor: string | undefined): string {
  if (!themeColor || themeColor === "None") return PET_COLOR_NONE;
  return PET_COLOR_THEME_MAP[themeColor] ?? PET_COLOR_NONE;
}
