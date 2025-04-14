// screens/authentication/SignupScreen.js
import React, { useState, useContext } from "react";
import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { firebase_auth, db } from "../../../firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { Ionicons } from "react-native-vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Toggles the visibility of the password input field
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Clears the email input field
  const clearEmail = () => {
    setEmail("");
  };

  // Clears the username input field
  const clearUsername = () => {
    setUsername("");
  };

  // Validates the password based on length and character requirements
  const validatePassword = (password) => {
    setPassword(password);

    setPasswordCriteria({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  // Handles user signup with Firebase Authentication and stores user profile in Firestore
  // Performs form validation and username availability check
  const handleSignup = async () => {
    setEmailError("");
    setUsernameError("");
    setPasswordError("");

    if (!email.trim() && !username.trim() && !password.trim()) {
      setEmailError("Email cannot be empty.");
      setUsernameError("Username cannot be empty.");
      setPasswordError("Password cannot be empty.");
    }

    if (!email.trim()) {
      setEmailError("Email cannot be empty.");
      return;
    }
    if (!username.trim()) {
      setUsernameError("Username cannot be empty.");
      return;
    }
    if (Object.values(passwordCriteria).includes(false)) {
      setPasswordError("Password does not meet all criteria.");
      return;
    }

    try {
      // Check if username already exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUsernameError(
          "Username is already taken. Please choose another one."
        );
      }

      const userCredential = await createUserWithEmailAndPassword(
        firebase_auth,
        email,
        password
      );

      await sendEmailVerification(userCredential.user);

      // Save user profile in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        username,
      });

      await AsyncStorage.setItem("username", username);
      await AsyncStorage.setItem("email", email);
      console.log("Signup successfully!");
    } catch (error) {
      console.error("Signup Error:", error);
      switch (error.code) {
        case "auth/email-already-in-use":
          setEmailError("Email already in use.");
          break;
        case "auth/invalid-email":
          setEmailError("Invalid email address.");
          break;
        case "auth/weak-password":
          setPasswordError("Password is too weak.");
          break;
        default:
          setEmailError("Signup failed. Please try again.");
      }
    }
  };

  // Renders a visual checkmark or error for each password validation rule
  const renderValidationCheck = (condition, text) => {
    return (
      <View style={styles.passwordCriteria}>
        {condition ? (
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={colors.success}
          />
        ) : (
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={colors.error}
          />
        )}
        <Text
          style={[
            styles.textCriteria,
            { color: colors.text, opacity: colors.opacity },
          ]}
        >
          {" "}
          {text}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text
        style={[styles.title, { color: colors.text, opacity: colors.opacity }]}
      >
        Sign Up
      </Text>
      <Text
        style={[styles.text, { color: colors.text, opacity: colors.opacity }]}
      >
        Email Address:
      </Text>
      <View
        style={[
          styles.inputContainer,
          { borderColor: colors.gray },
          emailError ? { borderColor: colors.error } : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text, opacity: colors.opacity },
          ]}
          placeholder="john.doe@domain.com"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={colors.gray}
        />
        {email.length > 0 && (
          <Pressable onPress={clearEmail}>
            <Ionicons name="close-circle" size={20} color={colors.close} />
          </Pressable>
        )}
        {emailError && email.length === 0 ? (
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colors.error}
          />
        ) : null}
      </View>
      {emailError ? (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {emailError}
        </Text>
      ) : null}

      <Text
        style={[styles.text, { color: colors.text, opacity: colors.opacity }]}
      >
        Username:
      </Text>
      <View
        style={[
          styles.inputContainer,
          { borderColor: colors.gray },
          usernameError ? { borderColor: colors.error } : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text, opacity: colors.opacity },
          ]}
          placeholder="Create a username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor={colors.gray}
        />
        {username.length > 0 && (
          <Pressable onPress={clearUsername}>
            <Ionicons name="close-circle" size={20} color={colors.close} />
          </Pressable>
        )}
        {usernameError && username.length === 0 ? (
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colors.error}
          />
        ) : null}
      </View>
      {usernameError ? (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {usernameError}
        </Text>
      ) : null}

      <Text
        style={[styles.text, { color: colors.text, opacity: colors.opacity }]}
      >
        Password:
      </Text>
      <View
        style={[
          styles.inputContainer,
          { borderColor: colors.gray },
          passwordError ? { borderColor: colors.error } : null,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text, opacity: colors.opacity },
          ]}
          placeholder="Create a password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={validatePassword}
          onFocus={() => setShowPasswordValidation(true)} // Show validation on focus
          onBlur={() => setShowPasswordValidation(password.length > 0)} // Hide validation on blur if password is empty
          placeholderTextColor={colors.gray}
        />
        {showPasswordValidation && (
          <Pressable onPress={togglePasswordVisibility}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color={colors.close}
            />
          </Pressable>
        )}
        {passwordError && !showPasswordValidation ? (
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={colors.error}
          />
        ) : null}
      </View>
      {passwordError ? (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {passwordError}
        </Text>
      ) : null}

      {showPasswordValidation && (
        <View style={styles.passwordValidation}>
          {renderValidationCheck(
            passwordCriteria.length,
            "At least 8 characters"
          )}
          {renderValidationCheck(
            passwordCriteria.lowercase,
            "At least one lowercase letter"
          )}
          {renderValidationCheck(
            passwordCriteria.uppercase,
            "At least one uppercase letter"
          )}
          {renderValidationCheck(
            passwordCriteria.number,
            "At least one number"
          )}
          {renderValidationCheck(
            passwordCriteria.specialChar,
            "At least one special character (@, $, !, %, *, ?, &)"
          )}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
            marginTop: 50,
            backgroundColor: colors.button,
          },
          styles.button,
        ]}
        onPress={handleSignup}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
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
    marginBottom: 16,
    textAlign: "center",
    marginBottom: 50,
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
  passwordValidation: {
    marginBottom: 16,
  },
  passwordCriteria: {
    flexDirection: "row",
    marginBottom: 2,
  },
  textCriteria: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
});

export default SignupScreen;
