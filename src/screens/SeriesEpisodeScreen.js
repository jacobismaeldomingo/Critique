import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { fetchEpisodes } from "../services/tmdb";
import { Ionicons } from "react-native-vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SeriesEpisodeScreen = ({ route, navigation }) => {
  const { seriesId, seasonNumber, watchedEpisodes, updateWatchedEpisodes } =
    route.params;
  const [episodes, setEpisodes] = useState([]);
  const [watched, setWatched] = useState(new Set(watchedEpisodes || []));

  // Load episodes from AsyncStorage when the component mounts
  useEffect(() => {
    const loadEpisodes = async () => {
      const episodeDetails = await fetchEpisodes(seriesId, seasonNumber);
      setEpisodes(episodeDetails);
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

    loadEpisodes();
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

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-circle-outline"
            size={28}
            color="black"
          />
        </Pressable>
        <Text style={styles.header}>Season Episode Details</Text>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 15,
        }}
      />
      <View style={styles.seasonCheckboxContainer}>
        <Text style={styles.title}>Season {seasonNumber}</Text>
        <BouncyCheckbox
          isChecked={watched.size === episodes.length}
          onPress={toggleSeasonWatched}
          fillColor="blue"
          unfillColor="white"
          innerIconStyle={{ borderRadius: 50 }}
          iconStyle={{ borderRadius: 50 }}
          style={{ marginRight: -5 }}
        />
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
                fillColor="blue"
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
            <Text style={styles.overview}>{item.overview}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  headerContainer: {
    padding: 5,
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginRight: 75,
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  seasonCheckboxContainer: {
    flexDirection: "row",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
  },
  episodeContainer: {
    borderRadius: 10,
    backgroundColor: "lightgray",
    marginBottom: 10,
    padding: 10,
  },
  episodeDetails: {
    flexDirection: "row",
    marginBottom: 10,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: "500",
    flex: 1, // Allow the title to take up available space
    flexWrap: "wrap", // Allow text to wrap to multiple lines
    marginRight: 10, // Add some spacing between the title and the checkbox
  },
  overview: {
    fontSize: 18,
    flexWrap: "wrap",
  },
  detailText: {
    fontSize: 16,
    color: "gray",
  },
});

export default SeriesEpisodeScreen;
