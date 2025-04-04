import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Image,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";

const AboutScreen = ({ navigation }) => {
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
            <Text style={styles.header}>About</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Film Diary</Text>
          <Text style={styles.sectionText}>
            A Film Diary app that allows users to record, track and review
            movies, TV shows, and films they watch across different platforms.
            It provides personalized recommendations based on your viewing
            history and preferences.
          </Text>

          <Text style={styles.sectionTitle}>Version</Text>
          <Text style={styles.sectionText}>1.0.0</Text>

          <Text style={styles.sectionTitle}>Data Provider</Text>
          <View style={styles.tmdbContainer}>
            <Image
              width="150"
              height="50"
              source={require("../../../assets/tmdb-logo.png")}
            />
          </View>
          <Text style={styles.sectionText}>
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </Text>
          <Pressable
            onPress={() => Linking.openURL("https://www.themoviedb.org/")}
          >
            <Text style={[styles.sectionText, styles.link]}>
              Visit TMDB Website
            </Text>
          </Pressable>

          <Text style={styles.sectionTitle}>About This Project</Text>
          <Text style={styles.sectionText}>
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
            <Text style={[styles.sectionText, styles.link]}>
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

          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Pressable onPress={() => Linking.openURL("mailto:your@email.com")}>
            <Text style={[styles.sectionText, styles.link]}>
              jacob.domingo@dal.ca
            </Text>
          </Pressable>
        </View>
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
    color: "#3F51B5",
    textDecorationLine: "underline",
  },
  tmdbContainer: {
    alignItems: "center",
    marginVertical: 15,
  },
});

export default AboutScreen;
