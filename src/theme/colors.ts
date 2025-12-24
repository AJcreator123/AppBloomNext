const light = {
  bg: "#F7FBF8",
  card: "#FFFFFF",
  glass: "#F1F6F2",
  panel: "#FFFFFF",
  text: "#1F2D26",
  textMuted: "#6B7C73",
  border: "#DCE6DF",
  line: "#E4EFE8",
  primary: "#2E7D32",
  accent: "#66BB6A",
};

const dark = {
  bg: "#0F1A14",
  card: "#16251D",
  glass: "#1C2E24",
  panel: "#16251D",
  text: "#E6F1EA",
  textMuted: "#9FB4A8",
  border: "#22382C",
  line: "#22382C",
  primary: "#66BB6A",
  accent: "#81C784",
};

export type AppColors = typeof light;

export const themes = {
  light,
  dark,
};
