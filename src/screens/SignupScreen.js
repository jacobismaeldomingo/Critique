// screens/SignupScreen.js
import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, Pressable } from "react-native";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { firebase_auth, db } from "../../firebaseConfig.js";
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

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  // Password validation function
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

  const handleSignup = async () => {
    setError("");

    if (!email.trim()) {
      setError("Email cannot be empty.");
      return;
    }
    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }
    if (Object.values(passwordCriteria).includes(false)) {
      setError("Password does not meet all criteria.");
      return;
    }

    try {
      // Check if username already exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error(
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
      setError(error.message);
    }
  };

  const renderValidationCheck = (condition, text) => {
    return (
      <View style={styles.passwordCriteria}>
        {condition ? (
          <Ionicons name="checkmark-circle-outline" size={20} color="green" />
        ) : (
          <Ionicons name="checkmark-circle-outline" size={20} color="red" />
        )}
        <Text style={styles.textCriteria}> {text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.text}>Email Address:</Text>
      <TextInput
        style={styles.input}
        placeholder="johndoe@email.com"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={"#888"}
      />
      <Text style={styles.text}>Username:</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={"#888"}
      />
      <Text style={styles.text}>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        secureTextEntry
        value={password}
        onChangeText={validatePassword}
        placeholderTextColor={"#888"}
      />

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
        {renderValidationCheck(passwordCriteria.number, "At least one number")}
        {renderValidationCheck(
          passwordCriteria.specialChar,
          "At least one special character (@, $, !, %, *, ?, &)"
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleSignup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
      <Pressable
        style={styles.button}
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
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  error: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  success: {
    color: "green",
    marginBottom: 16,
    textAlign: "center",
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
