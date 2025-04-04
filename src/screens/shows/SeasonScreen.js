import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { fetchSeason } from "../../services/tmdb";
import { Ionicons } from "react-native-vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingItem from "../../components/LoadingItem";

const SeasonScreen = ({ route, navigation }) => {
  const { seriesId, seasonNumber, watchedEpisodes, updateWatchedEpisodes } =
    route.params;
  const [season, setSeason] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [watched, setWatched] = useState(new Set(watchedEpisodes || []));
  const [expandedSeason, setExpandedSeason] = useState(false);
  const [expandedEpisodes, setExpandedEpisodes] = useState(false);

  // Load episodes from AsyncStorage when the component mounts
  useEffect(() => {
    const loadSeason = async () => {
      const seasonDetails = await fetchSeason(seriesId, seasonNumber);
      setSeason(seasonDetails);
      setEpisodes(seasonDetails.episodes);
    };

    const loadWatchedEpisodes = async () => {
      try {
        const savedWatchedEpisodes = await AsyncStorage.getItem(
          `watchedEpisodes_${seriesId}_${seasonNumber}`
        );
        if (savedWatchedEpisodes) {
          setWatched(new Set(JSON.parse(savedWatchedEpisodes)));
        }
      } catch (error) {
        console.error(
          "Failed to load watched episodes from AsyncStorage",
          error
        );
      }
    };

    loadSeason();
    loadWatchedEpisodes();
  }, [seriesId, seasonNumber]);

  // Update watched episodes in AsyncStorage when they change
  useEffect(() => {
    const saveWatchedEpisodes = async () => {
      try {
        await AsyncStorage.setItem(
          `watchedEpisodes_${seriesId}_${seasonNumber}`,
          JSON.stringify(Array.from(watched))
        );
      } catch (error) {
        console.error("Failed to save watched episodes to AsyncStorage", error);
      }
    };

    saveWatchedEpisodes();
  }, [watched, seriesId, seasonNumber]);

  // Toggle watched status for a single episode
  const toggleWatched = (episodeNumber) => {
    const updatedWatched = new Set(watched);
    if (updatedWatched.has(episodeNumber)) {
      updatedWatched.delete(episodeNumber);
    } else {
      updatedWatched.add(episodeNumber);
    }
    setWatched(updatedWatched);
    updateWatchedEpisodes(seasonNumber, Array.from(updatedWatched));
  };

  // Toggle watched status for all episodes in the season
  const toggleSeasonWatched = () => {
    if (watched.size === episodes.length) {
      // If all episodes are already watched, mark all as unwatched
      setWatched(new Set());
      updateWatchedEpisodes(seasonNumber, []);
    } else {
      // Mark all episodes as watched
      const allEpisodes = episodes.map((ep) => ep.episode_number);
      setWatched(new Set(allEpisodes));
      updateWatchedEpisodes(seasonNumber, allEpisodes);
    }
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
            <Ionicons name="chevron-back-outline" size={28} color="black" />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Season Episode Details</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={{ marginBottom: 10 }}>
          <View style={styles.seasonCheckboxContainer}>
            <Text style={styles.title}>Season {seasonNumber}</Text>
            <BouncyCheckbox
              isChecked={watched.size === episodes.length}
              onPress={toggleSeasonWatched}
              fillColor="#7850bf"
              unfillColor="white"
              innerIconStyle={{ borderRadius: 50 }}
              iconStyle={{ borderRadius: 50 }}
              style={{ marginRight: -5, marginBottom: 10 }}
            />
          </View>
          <View style={styles.episodeDetails}>
            <Text style={styles.detailText}>
              Average Rating: {season.vote_average} / 10
            </Text>
          </View>
          <View style={styles.synopsisContainer}>
            <Text style={styles.synopsis}>
              {expandedSeason
                ? season.overview
                : `${season.overview?.substring(0, 100)}...`}
            </Text>
            <Pressable onPress={() => setExpandedSeason(!expandedSeason)}>
              <Text style={styles.readMore}>
                {expandedSeason ? "Read Less" : "Read More..."}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.title}>Episodes:</Text>
        <FlatList
          data={episodes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.episodeContainer}>
              <View style={styles.titleContainer}>
                <Text style={styles.episodeTitle}>{item.name}</Text>
                <BouncyCheckbox
                  isChecked={watched.has(item.episode_number)}
                  onPress={() => toggleWatched(item.episode_number)}
                  fillColor="#7850bf"
                  unfillColor="white"
                  innerIconStyle={{ borderRadius: 50 }}
                  iconStyle={{
                    borderRadius: 50,
                  }}
                  style={{ marginRight: -15 }}
                />
              </View>
              <View style={styles.episodeDetails}>
                <Text style={styles.detailText}>
                  S{seasonNumber} E{item.episode_number}
                </Text>
                <Text style={styles.detailText}> • {item.runtime} mins</Text>
              </View>
              {item.overview?.length > 100 ? (
                <>
                  <Text style={styles.overview}>
                    {expandedEpisodes[item.id]
                      ? item.overview
                      : `${item.overview?.substring(0, 100)}...`}
                  </Text>
                  <Pressable onPress={() => toggleEpisodeExpanded(item.id)}>
                    <Text style={styles.readMore}>
                      {expandedEpisodes[item.id] ? "Read Less" : "Read More..."}
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Text style={styles.overview}>{item.overview}</Text>
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
    backgroundColor: "#f7f7f7",
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
    color: "gray",
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
    backgroundColor: "#fff",
    padding: 10,
  },
  synopsis: {
    fontSize: 15,
  },
  readMore: {
    color: "#3F51B5",
    marginTop: 5,
  },
});

export default SeasonScreen;
