// screens/SettingsScreen.js
import React from "react";
import { View, Text, Pressable, StyleSheet, Alert, Switch } from "react-native";
import { signOut } from "firebase/auth";
import { firebase_auth } from "../../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";

const SettingsScreen = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleDarkMode = () => setIsDarkMode((previousState) => !previousState);
  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log Out",
          onPress: async () => {
            try {
              await signOut(firebase_auth);
              // Alert.alert(
              //   "Logged Out",
              //   "You have been successfully logged out."
              // );
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <View style={styles.upperContainer} />
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
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Settings</Text>
          </View>
        </View>
        <View style={styles.divider} />
        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <Pressable
          style={({ pressed }) => [
            { opacity: pressed ? 0.5 : 1 },
            styles.itemContainer,
          ]}
          onPress={() => navigation.navigate("Notifications")}
        >
          <View style={styles.itemContent}>
            <Ionicons name="notifications-outline" size={24} color="black" />
            <Text style={styles.itemText}>Notification Settings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </Pressable>
        <View style={styles.itemBorder} />

        {/* Appearance Section */}
        <Text style={styles.sectionHeader}>Appearance</Text>
        <View style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Ionicons name="moon-outline" size={24} color="black" />
            <Text style={styles.itemText}>Dark Mode</Text>
          </View>
          <Switch
            trackColor={{ false: "#9E9E9E", true: "#7850bf" }}
            thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            onValueChange={toggleDarkMode}
            value={isDarkMode}
          />
        </View>
        <View style={styles.itemBorder} />

        {/* Security Section */}
        <Text style={styles.sectionHeader}>Security</Text>
        <Pressable
          style={({ pressed }) => [
            { opacity: pressed ? 0.5 : 1 },
            styles.itemContainer,
          ]}
          onPress={() => navigation.navigate("ResetPassword")}
        >
          <View style={styles.itemContent}>
            <Ionicons name="lock-closed-outline" size={24} color="black" />
            <Text style={styles.itemText}>Reset Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </Pressable>
        <View style={styles.itemBorder} />

        {/* Help & Support Section */}
        <Text style={styles.sectionHeader}>Help & Support</Text>
        {/* <Pressable
          style={({ pressed }) => [
            { opacity: pressed ? 0.5 : 1 },
            styles.itemContainer,
          ]}
          onPress={() => navigation.navigate("Help")}
        >
          <View style={styles.itemContent}>
            <Ionicons name="help-circle-outline" size={24} color="black" />
            <Text style={styles.itemText}>Help</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </Pressable> */}
        <Pressable
          style={({ pressed }) => [
            { opacity: pressed ? 0.5 : 1 },
            styles.itemContainer,
          ]}
          onPress={() => navigation.navigate("About")}
        >
          <View style={styles.itemContent}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="black"
            />
            <Text style={styles.itemText}>About</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="gray" />
        </Pressable>
        <View style={styles.itemBorder} />

        {/* Logout Section */}
        <Pressable
          style={({ pressed }) => [
            { opacity: pressed ? 0.5 : 1 },
            styles.logoutContainer,
          ]}
          onPress={handleLogout}
        >
          <View style={styles.itemContent}>
            <Ionicons name="log-out-outline" size={24} color="#FF5252" />
            <Text style={[styles.itemText, { color: "#FF5252" }]}>Log Out</Text>
          </View>
        </Pressable>
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
  sectionHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 20,
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
    paddingVertical: 20,
  },
});

export default SettingsScreen;
