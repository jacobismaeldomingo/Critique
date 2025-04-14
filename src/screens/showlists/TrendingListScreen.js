import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import {
  fetchTrendingMovies,
  fetchTrendingTVSeries,
} from "../../services/tmdb";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const TrendingListScreen = ({ route }) => {
  const { type } = route.params;
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1); // Tracks current page
  const [loading, setLoading] = useState(false); // Controls loader state
  const navigation = useNavigation();

  const { width } = Dimensions.get("window"); // Get screen width

  const backdropWidth = width * 0.9; // 90% of screen width
  const backdropHeight = backdropWidth * (10 / 19); // Maintain aspect ratio (similar to 380x200)
  const posterWidth = backdropWidth * 0.26; // 26% of backdrop width
  const posterHeight = posterWidth * (3 / 2); // Maintain 2:3 aspect ratio (similar to 100x150)

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Fetch movies or TV shows based on type (supports pagination)
  const loadShows = async () => {
    if (loading) return; // Prevent duplicate requests
    setLoading(true);

    // Select the appropriate fetch function
    const fetchFunction =
      type === "movies" ? fetchTrendingMovies : fetchTrendingTVSeries;
    const newShows = await fetchFunction(page);

    // Remove duplicates using a Set
    setShows((prevShows) => {
      const showMap = new Map(prevShows.map((show) => [show.id, show])); // Store existing movies/tv series
      newShows.forEach((show) => showMap.set(show.id, show)); // Add new shows (overwrite duplicates)
      return Array.from(showMap.values()); // Convert back to array
    });

    setPage((prevPage) => prevPage + 1); // Move to next page
    setLoading(false);
  };

  useEffect(() => {
    loadShows(); // Fetch first page initially
  }, []);

  const handleShowDetails = (item) => {
    navigation.navigate(
      type === "movies" ? "MovieDetails" : "TVSeriesDetails",
      {
        showId: item.id,
        type,
      }
    );
  };

  const renderShowItem = ({ item }) => (
    <Pressable style={styles.showItem} onPress={() => handleShowDetails(item)}>
      <ImageBackground
        source={{
          uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path}`,
        }}
        style={{
          width: backdropWidth,
          height: backdropHeight,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <View style={styles.overlay} />

        <View style={styles.content}>
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
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {type === "movies" ? item.title : item.name}
            </Text>
            <Text style={styles.releaseDate}>
              {type === "movies" ? item.release_date : item.first_air_date}
            </Text>
            <Text style={styles.overview}>
              {item.overview.substring(0, 75)}...
            </Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );

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
              Trending {type === "movies" ? "Movies" : "TV Series"}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />
        <FlatList
          data={shows}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadShows} // Load next page when scrolling down
          onEndReachedThreshold={0.5} // Load when 50% from the bottom
          ListFooterComponent={
            loading ? (
              <ActivityIndicator size="large" color={colors.secondary} />
            ) : null
          }
        />
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
    marginBottom: 15,
  },
  showItem: {
    marginBottom: 20,
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    top: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  releaseDate: {
    fontSize: 14,
    color: "#ddd",
    marginBottom: 10,
  },
  overview: {
    fontSize: 14,
    color: "#fff",
  },
});

export default TrendingListScreen;
