import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  SafeAreaView,
  Easing,
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const statsScale = useRef(new Animated.Value(0.8)).current;

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.spring(statsScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBackground,
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back-outline" size={28} color="#fff" />
        </Pressable>

        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          Reset Password
        </Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
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
