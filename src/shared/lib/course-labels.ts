export function getLevelLabel(level?: string | null) {
  if (level === "beginner") return "ថ្នាក់ដំបូង";
  if (level === "intermediate") return "ថ្នាក់មធ្យម";
  if (level === "advanced") return "ថ្នាក់ខ្ពស់";
  return "គ្រប់កម្រិត";
}
