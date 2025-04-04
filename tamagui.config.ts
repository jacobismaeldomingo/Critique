// tamagui.config.ts
import { createTamagui } from "@tamagui/core";

export const config = createTamagui({
  themes: {
    light: {
      backgroundLight: "#ffffff",
      textLight: "#000000",
    },
    dark: {
      backgroundDark: "#121212",
      textDark: "#ffffff",
    },
  },
});

export type AppConfig = typeof config;
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig {}
}
