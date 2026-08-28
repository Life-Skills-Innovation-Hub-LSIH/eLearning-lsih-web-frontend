const AVATAR_COLORS = [
  { background: "#2b7cc3", text: "#111827" },
  { background: "#7c3aed", text: "#ffffff" },
  { background: "#059669", text: "#ffffff" },
  { background: "#d97706", text: "#111827" },
  { background: "#db2777", text: "#ffffff" },
  { background: "#0d9488", text: "#ffffff" },
  { background: "#4f46e5", text: "#ffffff" },
  { background: "#dc2626", text: "#ffffff" },
  { background: "#0891b2", text: "#ffffff" },
  { background: "#65a30d", text: "#111827" },
  { background: "#9333ea", text: "#ffffff" },
  { background: "#ea580c", text: "#ffffff" },
] as const;

export function getAvatarInitial(name: string, firstName?: string) {
  const source = (firstName || name || "U").trim();
  return source[0]?.toUpperCase() ?? "U";
}

export function getAvatarColor(seed: string) {
  const char = (seed.trim()[0] ?? "A").toUpperCase();
  const code = char.charCodeAt(0);
  const index = ((code - 65) % AVATAR_COLORS.length + AVATAR_COLORS.length) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
