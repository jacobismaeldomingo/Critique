// screens/SettingsScreen.js
import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Switch,
  Animated,
  SafeAreaView,
  Easing,
} from "react-native";
import { signOut } from "firebase/auth";
import { firebase_auth } from "../../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme, useSystemTheme, toggleUseSystemTheme } =
    useContext(ThemeContext);
  const colors = getTheme(theme);
  const isDarkMode = theme === "dark";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const statsScale = useRef(new Animated.Value(0.8)).current;

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.spring(statsScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Prompts the user with a confirmation alert before logging out.
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBackground,
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back-outline" size={28} color="#fff" />
        </Pressable>

        <Text style={[styles.headerTitle, { color: "#fff" }]}>Settings</Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={{ paddingHorizontal: 5 }}>
          {/* Notifications Section */}
          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Notifications
          </Text>
          <Pressable
            style={({ pressed }) => [
              { opacity: pressed ? 0.5 : 1 },
              styles.itemContainer,
            ]}
            onPress={() => navigation.navigate("Notifications")}
          >
            <View style={styles.itemContent}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.icon}
              />
              <Text style={[styles.itemText, { color: colors.text }]}>
                Notification Settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.grey} />
          </Pressable>
          <View
            style={[
              styles.itemBorder,
              { borderBottomColor: colors.itemBorder },
            ]}
          />

          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Appearance
          </Text>

          <View style={styles.itemContainer}>
            <View style={styles.itemContent}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color={colors.icon}
              />
              <Text style={[styles.itemText, { color: colors.text }]}>
                Use System Theme
              </Text>
            </View>
            <Switch
              trackColor={{
                false: colors.switchTrackFalse,
                true: colors.switchTrackTrue,
              }}
              thumbColor={
                useSystemTheme
                  ? colors.switchThumbTrue
                  : colors.switchThumbFalse
              }
              onValueChange={toggleUseSystemTheme}
              value={useSystemTheme}
            />
          </View>
          <View
            style={[
              styles.itemBorder,
              { borderBottomColor: colors.itemBorder },
            ]}
          />

          <View style={styles.itemContainer}>
            <View style={styles.itemContent}>
              <Ionicons
                name="moon-outline"
                size={24}
                color={useSystemTheme ? colors.gray : colors.icon}
              />
              <Text
                style={[
                  styles.itemText,
                  {
                    color: useSystemTheme ? colors.gray : colors.text,
                  },
                ]}
              >
                Dark Mode
              </Text>
            </View>
            <Switch
              trackColor={{
                false: colors.switchTrackFalse,
                true: colors.switchTrackTrue,
              }}
              thumbColor={
                isDarkMode ? colors.switchThumbTrue : colors.switchThumbFalse
              }
              onValueChange={toggleTheme}
              value={isDarkMode}
              disabled={useSystemTheme}
            />
          </View>
          <View
            style={[
              styles.itemBorder,
              { borderBottomColor: colors.itemBorder },
            ]}
          />

          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Security
          </Text>
          <Pressable
            style={({ pressed }) => [
              { opacity: pressed ? 0.5 : 1 },
              styles.itemContainer,
            ]}
            onPress={() => navigation.navigate("ResetPassword")}
          >
            <View style={styles.itemContent}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={colors.icon}
              />
              <Text style={[styles.itemText, { color: colors.text }]}>
                Reset Password
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.grey} />
          </Pressable>
          <View
            style={[
              styles.itemBorder,
              { borderBottomColor: colors.itemBorder },
            ]}
          />

          <Text style={[styles.sectionHeader, { color: colors.text }]}>
            Credits & Info
          </Text>
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
                color={colors.icon}
              />
              <Text style={[styles.itemText, { color: colors.text }]}>
                About Critique
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.grey} />
          </Pressable>
          <View
            style={[
              styles.itemBorder,
              { borderBottomColor: colors.itemBorder },
            ]}
          />

          <Pressable
            style={({ pressed }) => [
              { opacity: pressed ? 0.5 : 1 },
              styles.logoutContainer,
            ]}
            onPress={handleLogout}
          >
            <View style={styles.itemContent}>
              <Ionicons name="log-out-outline" size={24} color={colors.error} />
              <Text style={[styles.itemText, { color: colors.error }]}>
                Log Out
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
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
