import React, { useState } from "react";
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

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.text}>Email:</Text>
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputContainerError : null,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Enter your email or username"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={"#888"}
        />
        {error ? (
          <Ionicons name="alert-circle-outline" size={20} color="#FF5252" />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
            marginTop: 50,
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
    borderColor: "#9E9E9E",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputContainerError: {
    borderColor: "#FF5252",
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
    backgroundColor: "#7850bf",
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
