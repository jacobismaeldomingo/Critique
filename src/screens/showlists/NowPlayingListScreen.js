// screens/showlists/NowPlayingListScreen.js
import React, { useState, useEffect, useContext, useRef } from "react";
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
  Animated,
  SafeAreaView,
  Easing,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { fetchNowPlaying } from "../../services/tmdb";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const NowPlayingListScreen = ({ route }) => {
  const { type } = route.params;
  const [shows, setShows] = useState([]);
  const [page, setPage] = useState(1); // Tracks current page
  const [loading, setLoading] = useState(false); // Controls loader state
  const navigation = useNavigation();

  // Measurements
  const { width } = Dimensions.get("window");
  const backdropWidth = width * 0.9;
  const backdropHeight = backdropWidth * (10 / 19);
  const posterWidth = backdropWidth * 0.26;
  const posterHeight = posterWidth * (3 / 2);

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

  // Fetch movies or TV shows based on type (supports pagination)
  const loadShows = async () => {
    if (loading) return; // Prevent duplicate requests
    setLoading(true);

    // Select the appropriate fetch function
    const newShows = await fetchNowPlaying(page);

    // Remove duplicates using a Set
    setShows((prevShows) => {
      const showMap = new Map(prevShows.map((show) => [show.id, show])); // Store existing movies/tv series
      newShows.forEach((show) => showMap.set(show.id, show)); // Add new shows (overwrite duplicates)
      return Array.from(showMap.values()); // Convert back to array
    });

    setPage((prevPage) => prevPage + 1); // Move to next page
    setLoading(false);
  };

  // Fetch first page initially
  useEffect(() => {
    loadShows();
  }, []);

  /**
   * Navigates to the details page of a show (either Movie or TV Series) based on the media type.
   * @param {object} item - Show object containing media type and show ID.
   */
  const handleShowDetails = (item) => {
    navigation.navigate("MovieDetails", {
      showId: item.id,
      type,
    });
  };

  /**
   * Renders an individual show item as a pressable component with a poster image.
   * @param {object} item - Show object containing information of a movie/series.
   */
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
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.releaseDate}>{item.release_date}</Text>
            <Text style={styles.overview}>
              {item.overview.substring(0, 75)}...
            </Text>
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );

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

        <Text style={[styles.headerTitle, { color: "#fff" }]}>Now Playing</Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <View
        style={[styles.mainContent, { backgroundColor: colors.background }]}
      >
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
  mainContent: {
    flex: 1,
    padding: 16,
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

export default NowPlayingListScreen;
