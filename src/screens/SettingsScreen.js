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
      AsyncStorage.clear();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-circle-outline"
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
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Notifications</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Appearance</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Security</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Help & Support</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
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
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SettingsScreen;
