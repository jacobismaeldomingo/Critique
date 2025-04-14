// components/theme.js

const sharedColors = {
  // Fixed brand colors
  headerBackground: "#7850bf",
  primary: "#7850bf",
  button: "#7850bf",
  secondary: "#3F51B5",
  error: "#FF5252",
  success: "#4CAF50",
  statusBar: "#9575CD",
  switchTrackFalse: "#9E9E9E",
  switchTrackTrue: "#7850bf",
  switchThumbFalse: "#f4f3f4",
  switchThumbTrue: "#ffffff",
};

// Light Theme Mode
export const lightTheme = {
  ...sharedColors,
  background: "#FFFFFF",
  text: "#000000",
  icon: "#000000",
  gray: "#9E9E9E",
  lightGray: "#D3D3D3",
  input: "#FFFFFF",
  opacity: 1,
  subtitle: "#666666",
  close: "#888888",
  google: "#ffffff",
  itemBorder: "#e0e0e0",
  details: "#f7f7f7",
  viewAll: "#f8f8f8",
  bar: "black",
  episode: "#EDE7F6",
  camera: "#007BFF",
  grey: "#808080",
};

// Dark Theme Mode
export const darkTheme = {
  headerBackground: "#9575CD",
  primary: "#B39DDB",
  button: "#9575CD",
  secondary: "#606fc7",
  error: "#FF6E6E",
  success: "#66BB6A",
  statusBar: "#B39DDB",
  background: "#18191A",
  text: "#FFFFFF",
  icon: "#FFFFFF",
  gray: "#b8b8b8",
  lightGray: "#424242",
  switchTrackFalse: "#b8b8b8",
  switchTrackTrue: "#9575CD",
  switchThumbFalse: "#f4f3f4",
  switchThumbTrue: "#ffffff",
  input: "#7B7B7B",
  opacity: 0.87,
  subtitle: "#A8A8A8",
  close: "#B0B0B0",
  google: "#b8b8b8",
  itemBorder: "#2C2C2C",
  details: "#2C2C2C",
  viewAll: "#2A2A2A",
  bar: "white",
  episode: "#3A2D57",
  camera: "#339CFF",
  grey: "#B0B0B0",
};

export const getTheme = (mode) => {
  return mode === "dark" ? darkTheme : lightTheme;
};
