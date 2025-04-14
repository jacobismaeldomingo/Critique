import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebase_auth } from "../../../firebaseConfig";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  const handleResetPassword = async () => {
    setError("");

    const actionCodeSettings = {
      url: "https://critique-pass-reset.vercel.app/reset-password",
      handleCodeInApp: true, // This ensures Firebase does not handle it directly
    };

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(firebase_auth, email, actionCodeSettings);
      Alert.alert(
        "Success",
        "A password reset link has been sent to your email."
      );
      navigation.goBack();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={[
          styles.upperContainer,
          { backgroundColor: colors.headerBackground },
        ]}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              color={colors.icon}
              style={{ marginRight: 50 }}
              opacity={colors.opacity}
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text
              style={[
                styles.header,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              Reset Password
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <Text
          style={[styles.text, { color: colors.text, opacity: colors.opacity }]}
        >
          Email:
        </Text>
        <View
          style={[
            styles.inputContainer,
            { borderColor: colors.gray },
            error ? { borderColor: colors.error } : null,
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { color: colors.text, opacity: colors.opacity },
            ]}
            placeholder="Enter your email or username"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={colors.gray}
          />
          {error ? (
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.error}
            />
          ) : null}
        </View>
        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
              backgroundColor: colors.button,
            },
            styles.button,
          ]}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>Send Email</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: Platform.select({
      ios: 60,
      android: 20,
    }),
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: 40,
  },
  errorText: {
    color: "#FF5252",
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 250,
  },
});

export default ResetPasswordScreen;
