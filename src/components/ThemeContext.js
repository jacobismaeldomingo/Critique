// ThemeContext.js
import React, { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

// Theme keys for AsyncStorage
const THEME_PREFERENCE_KEY = "@theme_preference";
const USE_SYSTEM_THEME_KEY = "@use_system_theme";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");
  const [useSystemTheme, setUseSystemTheme] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const [savedTheme, savedUseSystemTheme] = await Promise.all([
          AsyncStorage.getItem(THEME_PREFERENCE_KEY),
          AsyncStorage.getItem(USE_SYSTEM_THEME_KEY),
        ]);

        // Check if we should use system theme
        const shouldUseSystemTheme = savedUseSystemTheme === "true";
        setUseSystemTheme(shouldUseSystemTheme);

        if (shouldUseSystemTheme) {
          // Use the system theme
          setTheme(Appearance.getColorScheme() || "light");
        } else if (savedTheme) {
          // Use the saved theme
          setTheme(savedTheme);
        } else {
          // Default to system theme if no preference is saved
          setTheme(Appearance.getColorScheme() || "light");
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load theme preferences:", error);
        setTheme(Appearance.getColorScheme() || "light");
        setIsLoading(false);
      }
    };

    loadThemePreferences();
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (useSystemTheme) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(colorScheme || "light");
      });

      // Clean up subscription
      return () => subscription.remove();
    }
  }, [useSystemTheme]);

  // Toggle theme manually
  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // When manually toggling, disable system theme and save preference
    setUseSystemTheme(false);

    try {
      await Promise.all([
        AsyncStorage.setItem(THEME_PREFERENCE_KEY, newTheme),
        AsyncStorage.setItem(USE_SYSTEM_THEME_KEY, "false"),
      ]);
    } catch (error) {
      console.error("Failed to save theme preferences:", error);
    }
  };

  // Set a specific theme and save it
  const setThemeAndSave = async (newTheme) => {
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  // Toggle system theme following
  const toggleUseSystemTheme = async (value) => {
    setUseSystemTheme(value);

    try {
      await AsyncStorage.setItem(USE_SYSTEM_THEME_KEY, value.toString());

      if (value) {
        // Update to current system theme
        const systemTheme = Appearance.getColorScheme() || "light";
        setTheme(systemTheme);
      }
    } catch (error) {
      console.error("Failed to save system theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setThemeAndSave,
        useSystemTheme,
        toggleUseSystemTheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
