// screens/watchlists/PlanToWatchListScreen.js
import React, { useState, useCallback, useContext } from "react";
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
  Platform,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getSavedShows } from "../../services/firestore";
import { firebase_auth } from "../../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const PlanToWatchListScreen = ({ navigation }) => {
  const [planToWatchMovies, setPlanToWatchMovies] = useState([]);
  const [planToWatchTVSeries, setPlanToWatchTVSeries] = useState([]);
  const [activeTab, setActiveTab] = useState("movies");
  const [searchQuery, setSearchQuery] = useState("");

  // Measurements
  const { width } = Dimensions.get("window");
  const backdropWidth = width * 0.9;
  const backdropHeight = backdropWidth * (10 / 19);
  const posterWidth = backdropWidth * 0.26;
  const posterHeight = posterWidth * (3 / 2);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Fetch movies or TV shows based on type (supports pagination)
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

  /**
   * Navigates to the details page of a show (either Movie or TV Series) based on the media type.
   * @param {object} item - Show object containing media type and show ID.
   */
  const handleShowDetails = (item) => {
    navigation.navigate(
      activeTab === "movies" ? "MovieDetails" : "TVSeriesDetails",
      {
        showId: item.id,
        type: activeTab,
      }
    );
  };

  /**
   * Renders an individual show item as a pressable component with a poster image.
   * @param {object} item - Show object containing information of a movie/series.
   */
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

  /**
   * Filters the in-progress shows (either movies or TV series) based on the search query
   * @param {string} activeTab - current active tab which determines if movies or TV series are shown
   * @param {string} searchQuery - the search term input by the user
   * @returns {array} filteredShows - an array of shows filtered based on the search query
   */
  const filteredShows = (
    activeTab === "movies" ? planToWatchMovies : planToWatchTVSeries
  ).filter(
    (show) =>
      show.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      show.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Clears the search query input by resetting the searchQuery state
  const clearSearchQuery = () => {
    setSearchQuery("");
  };

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
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text
              style={[
                styles.header,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              Plan to Watch List
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />
        <View style={styles.tabContainer}>
          <Pressable onPress={() => setActiveTab("movies")}>
            <Text
              style={[
                styles.tab,
                { color: colors.gray },
                activeTab === "movies" && {
                  fontWeight: "bold",
                  color: colors.secondary,
                },
              ]}
            >
              Movies
            </Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab("tvSeries")}>
            <Text
              style={[
                styles.tab,
                { color: colors.gray },
                activeTab === "tvSeries" && {
                  fontWeight: "bold",
                  color: colors.secondary,
                },
              ]}
            >
              TV Series
            </Text>
          </Pressable>
        </View>
        <View style={[styles.searchContainer, { borderColor: colors.gray }]}>
          <TextInput
            style={[
              styles.searchInput,
              { borderColor: colors.gray, color: colors.text },
            ]}
            placeholder="Search your plan to watch list..."
            placeholderTextColor={colors.grey}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearchQuery}>
              <Ionicons name="close-circle" size={20} color={colors.close} />
            </Pressable>
          )}
        </View>
        <FlatList
          data={filteredShows}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text
              style={[
                styles.emptyText,
                { color: colors.grey, opacity: colors.opacity },
              ]}
            >
              No shows added yet.
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: 20,
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
    marginBottom: 5,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  tab: {
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
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
