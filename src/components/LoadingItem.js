// components/LoadingItem.js
import React, { useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { ThemeContext } from "./ThemeContext";
import { getTheme } from "./theme";

const LoadingItem = () => {
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  return (
    <>
      <View
        style={[
          styles.upperContainer,
          { backgroundColor: colors.headerBackground },
        ]}
      />
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingItem;
