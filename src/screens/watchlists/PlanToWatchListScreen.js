import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  Image,
  StyleSheet,
  Pressable,
  TextInput,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getSavedShows } from "../../services/firestore";
import { firebase_auth } from "../../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";

const PlanToWatchListScreen = ({ navigation }) => {
  const [planToWatchMovies, setPlanToWatchMovies] = useState([]);
  const [planToWatchTVSeries, setPlanToWatchTVSeries] = useState([]);
  const [activeTab, setActiveTab] = useState("movies");
  const [searchQuery, setSearchQuery] = useState("");

  const { width } = Dimensions.get("window"); // Get screen width

  const backdropWidth = width * 0.9; // 90% of screen width
  const backdropHeight = backdropWidth * (10 / 19); // Maintain aspect ratio (similar to 380x200)

  const posterWidth = backdropWidth * 0.26; // 26% of backdrop width
  const posterHeight = posterWidth * (3 / 2); // Maintain 2:3 aspect ratio (similar to 100x150)

  useFocusEffect(
    useCallback(() => {
      const loadPlanToWatchShows = async () => {
        if (firebase_auth.currentUser) {
          const movies = await getSavedShows(
            firebase_auth.currentUser.uid,
            "movies"
          );
          setPlanToWatchMovies(
            movies.filter((show) => show.category === "Plan to Watch")
          );

          const tvSeries = await getSavedShows(
            firebase_auth.currentUser.uid,
            "tvSeries"
          );
          setPlanToWatchTVSeries(
            tvSeries.filter((show) => show.category === "Plan to Watch")
          );
        }
      };
      loadPlanToWatchShows();
    }, [])
  );

  const handleShowDetails = (item) => {
    navigation.navigate(
      activeTab === "movies" ? "MovieDetails" : "TVSeriesDetails",
      {
        showId: item.id,
        type: activeTab,
      }
    );
  };

  const renderShowItem = ({ item }) => (
    <Pressable style={styles.showItem} onPress={() => handleShowDetails(item)}>
      <ImageBackground
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path}` }}
        style={{
          width: backdropWidth,
          height: backdropHeight,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <View style={styles.overlay} />

        <View style={styles.itemContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            }}
            style={{
              width: posterWidth,
              height: posterHeight,
              borderRadius: 10,
              marginRight: 10,
            }}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{item.title || item.name}</Text>
            <Text style={styles.releaseDate}>
              {item.release_date || item.first_air_date}
            </Text>
            <Text style={styles.tagline}>{item.tagline}</Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );

  const filteredShows = (
    activeTab === "movies" ? planToWatchMovies : planToWatchTVSeries
  ).filter(
    (show) =>
      show.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      show.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearSearchQuery = () => {
    setSearchQuery("");
  };

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
            <Text style={styles.header}>Plan to Watch List</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.tabContainer}>
          <Pressable onPress={() => setActiveTab("movies")}>
            <Text
              style={[styles.tab, activeTab === "movies" && styles.activeTab]}
            >
              Movies
            </Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("tvSeries")}>
            <Text
              style={[styles.tab, activeTab === "tvSeries" && styles.activeTab]}
            >
              TV Series
            </Text>
          </Pressable>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your plan to watch list..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearchQuery}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </Pressable>
          )}
        </View>
        <FlatList
          data={filteredShows}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No shows added yet.</Text>
          }
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
    borderBottomColor: "black",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 5,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tab: {
    fontSize: 18,
    color: "gray",
  },
  activeTab: {
    color: "#3F51B5",
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#9E9E9E",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    marginHorizontal: 7,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  showItem: {
    marginBottom: 10,
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.6,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    top: 10,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  releaseDate: {
    fontSize: 14,
    color: "lightgray",
    marginBottom: 30,
  },
  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    color: "lightgray",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    padding: 20,
    color: "gray",
  },
});

export default PlanToWatchListScreen;
