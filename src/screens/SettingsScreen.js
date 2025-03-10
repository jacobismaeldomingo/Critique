// screens/SettingsScreen.js
import React from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { firebase_auth } from "../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      await signOut(firebase_auth);
      Alert.alert("Logged Out", "You have been successfully logged out.");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
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
            style={{ marginRight: 50 }}
          />
        </Pressable>
        <Text style={styles.header}>Settings</Text>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 15,
        }}
      />
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          styles.itemContainer,
        ]}
        onPress={() => {}}
      >
        <View style={styles.itemContent}>
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Text style={styles.itemText}>Notifications</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </Pressable>
      <View style={styles.itemBorder} />
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          styles.itemContainer,
        ]}
        onPress={() => {}}
      >
        <View style={styles.itemContent}>
          <Ionicons name="eye-outline" size={24} color="black" />
          <Text style={styles.itemText}>Appearance</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </Pressable>
      <View style={styles.itemBorder} />
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          styles.itemContainer,
        ]}
        onPress={() => navigation.navigate("Security")}
      >
        <View style={styles.itemContent}>
          <Ionicons name="lock-closed-outline" size={24} color="black" />
          <Text style={styles.itemText}>Security</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </Pressable>
      <View style={styles.itemBorder} />
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          styles.itemContainer,
        ]}
        onPress={() => {}}
      >
        <View style={styles.itemContent}>
          <Ionicons name="help-circle-outline" size={24} color="black" />
          <Text style={styles.itemText}>Help & Support</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </Pressable>
      <View style={styles.itemBorder} />
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          styles.logoutContainer,
        ]}
        onPress={handleLogout}
      >
        <View style={styles.itemContent}>
          <Ionicons name="log-out-outline" size={24} color="red" />
          <Text style={[styles.itemText, { color: "red" }]}>Log Out</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  headerContainer: {
    padding: 5,
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginRight: 150,
    marginLeft: 65,
    fontWeight: "bold",
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
  itemBorder: {
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoutContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
});

export default SettingsScreen;
