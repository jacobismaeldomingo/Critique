import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { fetchSeason } from "../../services/tmdb";
import { Ionicons } from "react-native-vector-icons";
import LoadingItem from "../../components/LoadingItem";
import { firebase_auth } from "../../../firebaseConfig";
import {
  getWatchedEpisodes,
  saveWatchedEpisodes,
} from "../../services/firestore";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const SeasonScreen = ({ route, navigation }) => {
  const { seriesId, seasonNumber, watchedEpisodes } = route.params;
  const [season, setSeason] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [watched, setWatched] = useState(new Set(watchedEpisodes || []));
  const [expandedSeason, setExpandedSeason] = useState(false);
  const [expandedEpisodes, setExpandedEpisodes] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  useEffect(() => {
    const loadSeason = async () => {
      const seasonDetails = await fetchSeason(seriesId, seasonNumber);
      setSeason(seasonDetails);
      setEpisodes(seasonDetails.episodes);
    };

    const loadWatchedEpisodes = async () => {
      try {
        const userId = firebase_auth.currentUser.uid;
        const savedWatchedEpisodes = await getWatchedEpisodes(userId, seriesId);
        if (savedWatchedEpisodes[`Season ${seasonNumber}`]) {
          setWatched(new Set(savedWatchedEpisodes[`Season ${seasonNumber}`]));
        }
      } catch (error) {
        console.error("Failed to load watched episodes from Firestore", error);
      }
    };

    loadSeason();
    loadWatchedEpisodes();
  }, [seriesId, seasonNumber]);

  // Save watched episodes to Firestore when the watched state changes
  useEffect(() => {
    const saveEpisodesToFirestore = async () => {
      try {
        const userId = firebase_auth.currentUser.uid;
        const watchedArray = Array.from(watched);
        await saveWatchedEpisodes(userId, seriesId, seasonNumber, watchedArray);
      } catch (error) {
        console.error("Failed to save watched episodes to Firestore", error);
      }
    };

    saveEpisodesToFirestore();
  }, [watched, seriesId, seasonNumber]);

  // Function to toggle the watched state for a single episode
  const toggleWatched = (episodeNumber) => {
    const updatedWatched = new Set(watched);
    if (updatedWatched.has(episodeNumber)) {
      updatedWatched.delete(episodeNumber);
    } else {
      updatedWatched.add(episodeNumber);
    }
    setWatched(updatedWatched); // Only triggers the save when `watched` changes
  };

  // Toggle watched status for all episodes in the season
  const toggleSeasonWatched = () => {
    const updatedWatched =
      watched.size === episodes.length
        ? new Set()
        : new Set(episodes.map((ep) => ep.episode_number));
    setWatched(updatedWatched);
  };

  // Toggle expanded state for a specific episode
  const toggleEpisodeExpanded = (episodeId) => {
    setExpandedEpisodes((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId], // Toggle expanded state for the episode
    }));
  };

  if (!season) {
    return <LoadingItem />;
  }

  return (
    <>
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
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text
              style={[
                styles.header,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              Season Episode Details
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />
        <View style={{ marginBottom: 10 }}>
          <View style={styles.seasonCheckboxContainer}>
            <Text
              style={[
                styles.title,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              Season {seasonNumber}
            </Text>
            <BouncyCheckbox
              isChecked={watched.size === episodes.length}
              onPress={toggleSeasonWatched}
              fillColor={colors.primary}
              unfillColor={colors.input}
              innerIconStyle={{ borderRadius: 50 }}
              iconStyle={{ borderRadius: 50 }}
              style={{ marginRight: -5, marginBottom: 10 }}
            />
          </View>
          <View style={styles.episodeDetails}>
            <Text
              style={[
                styles.detailText,
                { color: colors.grey, opacity: colors.opacity },
              ]}
            >
              Average Rating: {season.vote_average} / 10
            </Text>
          </View>
          <View
            style={[
              styles.synopsisContainer,
              { borderColor: colors.text, color: colors.text },
            ]}
          >
            <Text
              style={[
                styles.synopsis,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              {expandedSeason
                ? season.overview
                : `${season.overview?.substring(0, 100)}...`}
            </Text>
            <Pressable onPress={() => setExpandedSeason(!expandedSeason)}>
              <Text style={[styles.readMore, { color: colors.secondary }]}>
                {expandedSeason ? "Read Less" : "Read More..."}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text
          style={[
            styles.title,
            { color: colors.text, opacity: colors.opacity },
          ]}
        >
          Episodes:
        </Text>
        <FlatList
          data={episodes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.episodeContainer,
                {
                  backgroundColor: watched.has(item.episode_number)
                    ? colors.episode
                    : colors.details,
                },
              ]}
            >
              <View
                style={[
                  styles.titleContainer,
                  { backgroundColor: colors.detailText },
                ]}
              >
                <Text
                  style={[
                    styles.episodeTitle,
                    { borderColor: colors.text, color: colors.text },
                  ]}
                >
                  {item.name}
                </Text>
                <BouncyCheckbox
                  isChecked={watched.has(item.episode_number)}
                  onPress={() => toggleWatched(item.episode_number)}
                  fillColor={colors.primary}
                  unfillColor={colors.input}
                  innerIconStyle={{ borderRadius: 50 }}
                  iconStyle={{
                    borderRadius: 50,
                  }}
                  style={{ marginRight: -15 }}
                />
              </View>
              <View style={styles.episodeDetails}>
                <Text
                  style={[
                    styles.detailText,
                    { color: colors.gray, opacity: colors.opacity },
                  ]}
                >
                  S{seasonNumber} E{item.episode_number}
                </Text>
                <Text
                  style={[
                    styles.detailText,
                    { color: colors.gray, opacity: colors.opacity },
                  ]}
                >
                  {" "}
                  • {item.runtime} mins
                </Text>
              </View>
              {item.overview?.length > 100 ? (
                <>
                  <Text
                    style={[
                      styles.overview,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    {expandedEpisodes[item.id]
                      ? item.overview
                      : `${item.overview?.substring(0, 100)}...`}
                  </Text>
                  <Pressable onPress={() => toggleEpisodeExpanded(item.id)}>
                    <Text
                      style={[
                        styles.readMore,
                        {
                          color: colors.secondary,
                        },
                      ]}
                    >
                      {expandedEpisodes[item.id] ? "Read Less" : "Read More..."}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Text
                  style={[
                    styles.overview,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  {item.overview}
                </Text>
              )}
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
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
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  seasonCheckboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
  },
  episodeContainer: {
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  episodeDetails: {
    flexDirection: "row",
    marginBottom: 10,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap",
    marginRight: 10,
  },
  overview: {
    fontSize: 18,
    flexWrap: "wrap",
  },
  detailText: {
    fontSize: 16,
  },
  poster: {
    width: 380,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  synopsisContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  synopsis: {
    fontSize: 15,
  },
  readMore: {
    marginTop: 5,
  },
});

export default SeasonScreen;
