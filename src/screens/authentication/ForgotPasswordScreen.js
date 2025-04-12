import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebase_auth } from "../../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  const handleForgotPassword = async () => {
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
      navigation.navigate("Login");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[styles.title, { color: colors.text, opacity: colors.opacity }]}
      >
        Forgot Password
      </Text>
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
          placeholderTextColor={"#888"}
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
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
            marginTop: 50,
            backgroundColor: colors.button,
          },
          styles.button,
        ]}
        onPress={handleForgotPassword}
      >
        <Text style={styles.buttonText}>Send Email</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
            backgroundColor: colors.button,
          },
          styles.button,
        ]}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 50,
    textAlign: "center",
    fontWeight: "bold",
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
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ForgotPasswordScreen;
