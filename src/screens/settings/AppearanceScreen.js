// screens/AppearanceScreen.js
import React from "react";
import { View, Text, Pressable, StyleSheet, Button } from "react-native";
import { Ionicons } from "react-native-vector-icons";

const AppearanceScreen = ({ navigation }) => {
  return (
    <>
      <View style={styles.upperContainer} />
      <View style={[styles.container]}>
        <View style={styles.headerContainer}>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back-outline"
              size={28}
              color="black"
              style={{
                marginRight: 50,
              }}
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text style={[styles.header]}>Appearance</Text>
          </View>
        </View>
        <View style={styles.divider} />
        {/* <Button title="Toggle Theme" onPress={toggleTheme} /> */}
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
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  divider: {
    borderBottomColor: "#9E9E9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 24,
    marginLeft: 16,
  },
});

export default AppearanceScreen;
