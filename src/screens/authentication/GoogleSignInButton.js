// screen/authentication/GoogleSignInButton.js
import React from "react";
import { Pressable, Image, Text, Alert, StyleSheet } from "react-native";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { firebase_auth, db } from "../../../firebaseConfig.js";
import { setDoc, doc, getDoc } from "firebase/firestore";

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    "542453473907-ic8dh5ffa6gf17q5a0e9u0p49fc2dnvn.apps.googleusercontent.com", // From Firebase Console
  iosClientId:
    "542453473907-5tlr2aif8kopft2q0bn11p4be0ile9u8.apps.googleusercontent.com", // From GoogleService-Info.plist
});

export default function GoogleSignInButton({ colors }) {
  // Handles Google Sign-In using Firebase and saves user profile if new
  // Initiates sign-in flow, obtains token, signs in to Firebase, and stores user data
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

      const uid = userCredential.user.uid;
      const userDocRef = doc(db, "users", uid);
      const userDocSnap = await getDoc(userDocRef);

      // Only save user profile if it's a new user (doc doesn't exist)
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid,
          email: userCredential.user.email,
          username: userCredential.user.displayName,
          phoneNumber: userCredential.user.phoneNumber,
          provider: "google",
        });
        console.log("New user profile saved.");
      }

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

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.5 : 1,
          backgroundColor: colors.google,
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
  );
}

const styles = StyleSheet.create({
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
});
