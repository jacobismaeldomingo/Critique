import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    try {
      console.log("Reset password email sent.");
    } catch (error) {
      console.log("Forgot Password Error:", error);
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
          <Ionicons name="alert-circle-outline" size={20} color="red" />
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{emailError}</Text> : null}

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
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputContainerError: {
    borderColor: "red",
  },
  input: {
    flex: 1,
    height: 40,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    fontSize: 14,
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
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default ForgotPasswordScreen;
