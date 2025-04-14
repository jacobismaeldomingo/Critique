// screens/settings/AboutScreen.js
import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Image,
  Animated,
  SafeAreaView,
  Easing,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const AboutScreen = ({ navigation }) => {
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
          About Critique
        </Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Critique
          </Text>
          <Text
            style={[
              styles.sectionText,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            A Film Diary app that allows users to record, track and review
            movies, TV shows, and films they watch across different platforms.
            It provides personalized recommendations based on your viewing
            history and preferences.
          </Text>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Version
          </Text>
          <Text
            style={[
              styles.sectionText,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            1.0.0
          </Text>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Data Provider
          </Text>
          <View style={styles.tmdbContainer}>
            <Image
              width="150"
              height="50"
              source={require("../../../assets/tmdb-logo.png")}
            />
          </View>
          <Text
            style={[
              styles.sectionText,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </Text>
          <Pressable
            onPress={() => Linking.openURL("https://www.themoviedb.org/")}
          >
            <Text
              style={[
                styles.sectionText,
                styles.link,
                { color: colors.secondary },
              ]}
            >
              Visit TMDB Website
            </Text>
          </Pressable>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            About This Project
          </Text>
          <Text
            style={[
              styles.sectionText,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            This app was created as a university project for educational
            purposes.
          </Text>
          <Pressable
            onPress={() =>
              Linking.openURL(
                "https://git.cs.dal.ca/courses/2025-winter/csci-4176_5708/project-milestone-3/jdomingo"
              )
            }
          >
            <Text
              style={[
                styles.sectionText,
                styles.link,
                { color: colors.secondary },
              ]}
            >
              View Project on GitLab
            </Text>
          </Pressable>

          {/* <Text style={styles.sectionTitle}>Legal</Text>
          <Pressable onPress={() => Linking.openURL("YOUR_TERMS_URL")}>
            <Text style={[styles.sectionText, styles.link]}>Terms of Use</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL("YOUR_PRIVACY_URL")}>
            <Text style={[styles.sectionText, styles.link]}>
              Privacy Policy
            </Text>
          </Pressable> */}

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Contact Us
          </Text>
          <Pressable onPress={() => Linking.openURL("mailto:your@email.com")}>
            <Text
              style={[
                styles.sectionText,
                styles.link,
                { color: colors.secondary },
              ]}
            >
              jacob.domingo@dal.ca
            </Text>
          </Pressable>
        </View>
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
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  link: {
    textDecorationLine: "underline",
  },
  tmdbContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
});

export default AboutScreen;
