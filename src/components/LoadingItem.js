import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const LoadingItem = () => {
  return (
    <>
      <View style={styles.upperContainer} />
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#7850bf" />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: 60,
    backgroundColor: "#7850bf",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingItem;
