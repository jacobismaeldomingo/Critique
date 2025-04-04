// screens/LoginScreen.js
import React, { useState } from "react";
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
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "react-native-vector-icons";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "542453473907-ic8dh5ffa6gf17q5a0e9u0p49fc2dnvn.apps.googleusercontent.com", // From Firebase Console
  iosClientId:
    "542453473907-5tlr2aif8kopft2q0bn11p4be0ile9u8.apps.googleusercontent.com", // From GoogleService-Info.plist
});

const handleGoogleSignIn = async () => {
  try {
    console.log("Trying Google Sign in ...");

    const userInfo = await GoogleSignin.signIn();

    const { idToken } = userInfo.data;
    if (!idToken) throw new Error("No ID Token received from Google");

    // Create a Firebase credential with the Google ID token
    const googleCredential = GoogleAuthProvider.credential(idToken);

    // Sign in with the credential
    const userCredential = await signInWithCredential(
      firebase_auth,
      googleCredential
    );

    // Save user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      username: userCredential.user.displayName, // Use Google's given name as the username
      phoneNumber: userCredential.user.phoneNumber,
      provider: "google",
    });

    console.log("Login successfully!");
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      Alert.alert("Signing in cancelled");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      Alert.alert("Signing in, in progress");
    } else {
      Alert.alert("Error", error.message);
    }
  }
};

const LoginScreen = ({ navigation }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);

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
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.logo}
          source={require("../../../assets/critique-logo.png")}
        />
      </View>

      <Text style={styles.title}>Login</Text>
      <Text style={styles.text}>Email or Username:</Text>
      <View
        style={[
          styles.inputContainer,
          emailError ? styles.inputContainerError : null,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Enter your email or username"
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
          placeholderTextColor={"#9E9E9E"}
        />
        {emailOrUsername.length > 0 && (
          <Pressable onPress={clearEmailOrUsername}>
            <Ionicons name="close-circle" size={20} color="#9E9E9E" />
          </Pressable>
        )}
        {emailError && emailOrUsername.length === 0 ? (
          <Ionicons name="alert-circle-outline" size={20} color="#FF5252" />
        ) : null}
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <Text style={styles.text}>Password:</Text>
      <View
        style={[
          styles.inputContainer,
          passwordError ? styles.inputContainerError : null,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={"#9E9E9E"}
          onFocus={() => setShowPasswordValidation(true)} // Show validation on focus
          onBlur={() => setShowPasswordValidation(password.length > 0)} // Hide validation on blur if password is empty
        />
        {showPasswordValidation && (
          <Pressable onPress={togglePasswordVisibility}>
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#9E9E9E"
            />
          </Pressable>
        )}
        {passwordError && !showPasswordValidation ? (
          <Ionicons name="alert-circle-outline" size={20} color="#FF5252" />
        ) : null}
      </View>
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
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
        <Text style={{ color: "#3F51B5", fontSize: 16 }}>Forgot password?</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
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
        <Text style={styles.signUpText}>
          Don't have an account yet? Sign up here!
        </Text>
      </Pressable>
      <View style={styles.itemBorderContainer}>
        <View style={styles.itemBorder} />
        <Text style={[styles.text, { marginHorizontal: 10 }]}>or</Text>
        <View style={styles.itemBorder} />
      </View>

      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.5 : 1,
          },
          styles.googleButton,
        ]}
        onPress={handleGoogleSignIn}
      >
        <Image
          source={require("../../../assets/google-logo.png")}
          style={{ width: 25, height: 25 }}
        />
        <Text style={styles.goggleButtonText}>Sign in with Google</Text>
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
    backgroundColor: "#9575CD",
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
    backgroundColor: "#f2f2f2",
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
    borderBottomColor: "#9E9E9E",
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
