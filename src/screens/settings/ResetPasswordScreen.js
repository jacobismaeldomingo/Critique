import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebase_auth } from "../../../firebaseConfig";

const ResetPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

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
            <Text style={styles.header}>Reset Password</Text>
          </View>
        </View>
        <View style={styles.divider} />
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
            },
            styles.button,
          ]}
          onPress={handleResetPassword}
        >
          <Text style={styles.buttonText}>Send Email</Text>
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
