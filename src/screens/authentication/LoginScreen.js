// screens/LoginScreen.js
import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { firebase_auth, db } from "../../../firebaseConfig.js";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";
import GoogleSignInButton from "./GoogleSignInButton";

const LoginScreen = ({ navigation }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const clearEmailOrUsername = () => {
    setEmailOrUsername("");
  };

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    try {
      if (!emailOrUsername && !password) {
        new setEmailError("Please enter your email or username.");
        new setPasswordError("Please enter your password.");
        return;
      }
      if (!emailOrUsername) {
        new setEmailError("Please enter your email or username.");
        return;
      }
      if (!password) {
        new setPasswordError("Please enter your password.");
        return;
      }

      let email = emailOrUsername.trim();

      // Check if the input is a username
      if (!emailOrUsername.includes("@")) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", emailOrUsername));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setEmailError("Username not found.");
          return;
        }

        // Get the email associated with the username
        const userData = querySnapshot.docs[0].data();
        if (!userData?.email) {
          setEmailError("Email not found for this username.");
          return;
        }
        email = userData.email;

        await AsyncStorage.setItem("username", email);
      }

      const userCredential = await signInWithEmailAndPassword(
        firebase_auth,
        email,
        password
      );

      await AsyncStorage.setItem("email", email);
      console.log("Login successfully!");
    } catch (error) {
      console.error("Login Error:", error);
      switch (error.code) {
        case "auth/invalid-email":
          setEmailError("Invalid email address.");
          break;
        case "auth/user-not-found":
          setEmailError("User not found.");
          break;
        case "auth/wrong-password":
          setPasswordError("Incorrect password.");
          break;
        case "auth/too-many-requests":
          setPasswordError("Too many attempts. Try again later.");
          break;
        default:
          setPasswordError("Login failed. Please try again.");
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.logo}
          source={require("../../../assets/critique-logo.png")}
        />
      </View>

      <Text
        style={[styles.title, { color: colors.text, opacity: colors.opacity }]}
      >
        Login
      </Text>
      <Text
        style={[styles.text, { color: colors.text, opacity: colors.opacity }]}
      >
        Email or Username:
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
          placeholder="Enter your email or username"
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
          placeholderTextColor={colors.gray}
        />
        {emailOrUsername.length > 0 && (
          <Pressable onPress={clearEmailOrUsername}>
            <Ionicons name="close-circle" size={20} color={colors.close} />
          </Pressable>
        )}
        {emailError && emailOrUsername.length === 0 ? (
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
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={colors.gray}
          onFocus={() => setShowPasswordValidation(true)} // Show validation on focus
          onBlur={() => setShowPasswordValidation(password.length > 0)} // Hide validation on blur if password is empty
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

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          styles.forgotPassword,
        ]}
        onPress={() => navigation.navigate("ForgotPassword")}
      >
        <Text style={{ color: colors.secondary, fontSize: 16 }}>
          Forgot password?
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
            backgroundColor: colors.button,
          },
          styles.button,
        ]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
        ]}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={[styles.signUpText, { color: colors.secondary }]}>
          Don't have an account yet? Sign up here!
        </Text>
      </Pressable>
      <View style={styles.itemBorderContainer}>
        <View style={[styles.itemBorder, { borderBottomColor: colors.gray }]} />
        <Text
          style={[
            styles.text,
            {
              marginHorizontal: 10,
              color: colors.text,
              opacity: colors.opacity,
            },
          ]}
        >
          or
        </Text>
        <View style={[styles.itemBorder, { borderBottomColor: colors.gray }]} />
      </View>

      {/* <GoogleSignInButton colors={colors} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  imageContainer: {
    marginBottom: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 350,
    height: 70,
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
  googleButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  goggleButtonText: {
    color: "black",
    fontSize: 16,
    marginLeft: 25,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  itemBorder: {
    borderBottomWidth: 1,
    width: "45%",
    marginBottom: 8,
  },
  itemBorderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  signUpText: {
    color: "#3F51B5",
    fontSize: 16,
    alignSelf: "center",
    marginBottom: 35,
  },
  forgotPassword: {
    marginTop: 5,
    marginBottom: 50,
    alignSelf: "flex-start",
  },
});

export default LoginScreen;
