import React, { useContext } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Image,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const AboutScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={[
          styles.upperContainer,
          { backgroundColor: colors.headerBackground },
        ]}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
              color={colors.icon}
              opacity={colors.opacity}
              style={{ marginRight: 50 }}
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text
              style={[
                styles.header,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              About
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Film Diary
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
  upperContainer: {
    paddingBottom: Platform.select({
      ios: 60,
      android: 20,
    }),
  },
  container: {
    flex: 1,
    padding: 16,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
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
