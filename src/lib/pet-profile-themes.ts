export const petProfileThemeIds = [
  "azul",
  "rosado",
  "morado",
  "rojo",
  "verde",
  "naranja",
  "pastel",
  "tierra",
  "neon",
  "grafito"
] as const;

export type PetProfileThemeId = (typeof petProfileThemeIds)[number];

export type PetProfileTheme = {
  id: PetProfileThemeId;
  label: string;
  swatch: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  primaryText: string;
  text: string;
  mutedText: string;
  border: string;
  badgeBackground: string;
  badgeText: string;
};

export const petProfileThemes: Record<PetProfileThemeId, PetProfileTheme> = {
  azul: {
    id: "azul",
    label: "Azul",
    swatch: "#2563eb",
    background: "#eff6ff",
    surface: "#ffffff",
    surfaceMuted: "#dbeafe",
    primary: "#2563eb",
    primaryText: "#ffffff",
    text: "#172554",
    mutedText: "#475569",
    border: "#bfdbfe",
    badgeBackground: "#dbeafe",
    badgeText: "#1e3a8a"
  },
  rosado: {
    id: "rosado",
    label: "Rosado",
    swatch: "#db2777",
    background: "#fdf2f8",
    surface: "#ffffff",
    surfaceMuted: "#fce7f3",
    primary: "#db2777",
    primaryText: "#ffffff",
    text: "#831843",
    mutedText: "#6b4f5f",
    border: "#fbcfe8",
    badgeBackground: "#fce7f3",
    badgeText: "#9d174d"
  },
  morado: {
    id: "morado",
    label: "Morado",
    swatch: "#7c3aed",
    background: "#f5f3ff",
    surface: "#ffffff",
    surfaceMuted: "#ede9fe",
    primary: "#7c3aed",
    primaryText: "#ffffff",
    text: "#3b0764",
    mutedText: "#5b5367",
    border: "#ddd6fe",
    badgeBackground: "#ede9fe",
    badgeText: "#5b21b6"
  },
  rojo: {
    id: "rojo",
    label: "Rojo",
    swatch: "#dc2626",
    background: "#fef2f2",
    surface: "#ffffff",
    surfaceMuted: "#fee2e2",
    primary: "#dc2626",
    primaryText: "#ffffff",
    text: "#7f1d1d",
    mutedText: "#6b4d4d",
    border: "#fecaca",
    badgeBackground: "#fee2e2",
    badgeText: "#991b1b"
  },
  verde: {
    id: "verde",
    label: "Verde",
    swatch: "#059669",
    background: "#ecfdf5",
    surface: "#ffffff",
    surfaceMuted: "#d1fae5",
    primary: "#047857",
    primaryText: "#ffffff",
    text: "#064e3b",
    mutedText: "#45645a",
    border: "#a7f3d0",
    badgeBackground: "#d1fae5",
    badgeText: "#065f46"
  },
  naranja: {
    id: "naranja",
    label: "Naranja",
    swatch: "#ea580c",
    background: "#fff7ed",
    surface: "#ffffff",
    surfaceMuted: "#ffedd5",
    primary: "#c2410c",
    primaryText: "#ffffff",
    text: "#7c2d12",
    mutedText: "#6f5844",
    border: "#fed7aa",
    badgeBackground: "#ffedd5",
    badgeText: "#9a3412"
  },
  pastel: {
    id: "pastel",
    label: "Pastel",
    swatch: "#8b5cf6",
    background: "#fff7fb",
    surface: "#ffffff",
    surfaceMuted: "#e0f2fe",
    primary: "#7c3aed",
    primaryText: "#ffffff",
    text: "#273044",
    mutedText: "#667085",
    border: "#f0d9ff",
    badgeBackground: "#dcfce7",
    badgeText: "#166534"
  },
  tierra: {
    id: "tierra",
    label: "Tierra",
    swatch: "#92400e",
    background: "#f8f1e7",
    surface: "#fffaf3",
    surfaceMuted: "#ead9c2",
    primary: "#7c2d12",
    primaryText: "#ffffff",
    text: "#3f2a1d",
    mutedText: "#6b5b4d",
    border: "#d6b995",
    badgeBackground: "#ead9c2",
    badgeText: "#4a2f1d"
  },
  neon: {
    id: "neon",
    label: "Neón",
    swatch: "#22d3ee",
    background: "#0f172a",
    surface: "#111827",
    surfaceMuted: "#1f2937",
    primary: "#22d3ee",
    primaryText: "#082f49",
    text: "#f8fafc",
    mutedText: "#cbd5e1",
    border: "#334155",
    badgeBackground: "#164e63",
    badgeText: "#cffafe"
  },
  grafito: {
    id: "grafito",
    label: "Grafito",
    swatch: "#334155",
    background: "#f8fafc",
    surface: "#ffffff",
    surfaceMuted: "#e2e8f0",
    primary: "#334155",
    primaryText: "#ffffff",
    text: "#0f172a",
    mutedText: "#475569",
    border: "#cbd5e1",
    badgeBackground: "#e2e8f0",
    badgeText: "#1e293b"
  }
};

export function getPetProfileTheme(theme?: string | null) {
  if (theme && theme in petProfileThemes) return petProfileThemes[theme as PetProfileThemeId];
  return petProfileThemes.azul;
}
