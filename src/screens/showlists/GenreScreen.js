// screens/showlists/GenreScreen.js
import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Animated,
  SafeAreaView,
  Easing,
} from "react-native";
import {
  fetchMoviesByGenres,
  fetchTVSeriesByGenres,
} from "../../services/tmdb";
import { Ionicons } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import placeholderPoster from "../../../assets/no-poster-available.png";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const GenreScreen = ({ route }) => {
  const { genreId, genreName } = route.params;
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("movies");
  const [loading, setLoading] = useState(false);
  const [moviesPage, setMoviesPage] = useState(1);
  const [tvSeriesPage, setTVSeriesPage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreTVSeries, setHasMoreTVSeries] = useState(true);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [filteredTVSeries, setFilteredTVSeries] = useState([]);
  const navigation = useNavigation();

  // Measurements
  const { width } = Dimensions.get("window");
  const posterWidth = width * 0.28;
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

  // Initial data loading - load all movies and series with pagination handling
  useEffect(() => {
    // Reset states when genre changes
    setMovies([]);
    setTVSeries([]);
    setMoviesPage(1);
    setTVSeriesPage(1);
    setHasMoreMovies(true);
    setHasMoreTVSeries(true);

    // Load initial data
    loadMovies(1, true);
    loadTVSeries(1, true);
  }, [genreId]);

  // Load movies with pagination
  const loadMovies = async (pageToLoad = moviesPage, isInitialLoad = false) => {
    if (loading || !hasMoreMovies) return;

    setLoading(true);
    try {
      const genreMovies = await fetchMoviesByGenres(genreId, pageToLoad);

      if (Array.isArray(genreMovies) && genreMovies.length > 0) {
        setMovies((prevMovies) => {
          const movieMap = new Map(
            prevMovies.map((movie) => [movie.id, movie])
          );
          genreMovies.forEach((movie) => movieMap.set(movie.id, movie));
          return Array.from(movieMap.values());
        });
        setMoviesPage(pageToLoad + 1);
      } else {
        // If no movies were returned, mark that there are no more to load
        setHasMoreMovies(false);
        if (isInitialLoad && movies.length === 0) {
          // If this was the initial load and we got nothing, ensure empty state is shown
          setMovies([]);
        }
      }
    } catch (error) {
      console.error("Error loading movies:", error);
      setHasMoreMovies(false);
    } finally {
      setLoading(false);
    }
  };

  // Load TV series with pagination
  const loadTVSeries = async (
    pageToLoad = tvSeriesPage,
    isInitialLoad = false
  ) => {
    if (loading || !hasMoreTVSeries) return;

    setLoading(true);
    try {
      const genreTVSeries = await fetchTVSeriesByGenres(genreId, pageToLoad);

      if (Array.isArray(genreTVSeries) && genreTVSeries.length > 0) {
        setTVSeries((prevSeries) => {
          const seriesMap = new Map(
            prevSeries.map((series) => [series.id, series])
          );
          genreTVSeries.forEach((series) => seriesMap.set(series.id, series));
          return Array.from(seriesMap.values());
        });
        setTVSeriesPage(pageToLoad + 1);
      } else {
        // If no TV series were returned, mark that there are no more to load
        setHasMoreTVSeries(false);
        if (isInitialLoad && tvSeries.length === 0) {
          // If this was the initial load and we got nothing, ensure empty state is shown
          setTVSeries([]);
        }
      }
    } catch (error) {
      console.error("Error loading TV series:", error);
      setHasMoreTVSeries(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle loading more content when reaching end of list
  const handleLoadMore = () => {
    if (activeTab === "movies" && hasMoreMovies) {
      loadMovies();
    } else if (activeTab === "tvSeries" && hasMoreTVSeries) {
      loadTVSeries();
    }
  };

  // Filter content based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredMovies(movies);
      setFilteredTVSeries(tvSeries);
    } else {
      const query = searchQuery.toLowerCase();

      // Filter movies
      const matchedMovies = movies.filter((movie) =>
        movie.title?.toLowerCase().includes(query)
      );
      setFilteredMovies(matchedMovies);

      // Filter TV series
      const matchedTVSeries = tvSeries.filter((series) =>
        series.name?.toLowerCase().includes(query)
      );
      setFilteredTVSeries(matchedTVSeries);
    }
  }, [searchQuery, movies, tvSeries]);

  /**
   * Navigates to the details page of a show (either Movie or TV Series) based on the media type.
   * @param {object} item - Show object containing media type and show ID.
   */
  const handleShowDetails = (item) => {
    navigation.navigate(
      item.media_type === "movies" ? "MovieDetails" : "TVSeriesDetails",
      {
        showId: item.id,
        type: item.media_type,
      }
    );
  };

  /**
   * Renders an individual show item as a pressable component with a poster image.
   * @param {object} item - Show object containing information of a movie/series.
   */
  const renderShowItem = ({ item }) => (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Pressable
        style={styles.showItem}
        onPress={() => handleShowDetails(item)}
      >
        <Image
          source={
            item.poster_path
              ? { uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }
              : placeholderPoster
          }
          style={{
            width: posterWidth,
            height: posterHeight,
            marginRight: 5,
            marginVertical: 5,
            borderRadius: 10,
          }}
        />
      </Pressable>
    </View>
  );

  // Renders a search bar for searching shows, with a text input and clear button functionality.
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
        <TextInput
          style={[
            styles.searchInput,
            { borderColor: colors.gray, color: colors.text },
          ]}
          placeholder="Search shows..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          placeholderTextColor={colors.gray}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => {
              setSearchQuery("");
              setFilteredMovies(movies);
              setFilteredTVSeries(tvSeries);
            }}
            style={({ pressed }) => [
              styles.clearButton,
              { opacity: pressed ? 0.5 : 1 },
            ]}
          >
            <Ionicons name="close-circle" size={20} color={colors.gray} />
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={() => {
          setSearchQuery("");
          setIsSearchVisible(false);
        }}
        style={({ pressed }) => [
          styles.searchButton,
          { opacity: pressed ? 0.5 : 1 },
        ]}
      >
        <Ionicons name="close" size={24} color={colors.secondary} />
      </Pressable>
    </View>
  );

  // Should only show loading indicator if we're loading AND there's more content to load
  const shouldShowLoading = () => {
    if (activeTab === "movies") {
      return loading && hasMoreMovies;
    } else {
      return loading && hasMoreTVSeries;
    }
  };

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
          {genreName} Shows
        </Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {isSearchVisible ? (
          renderSearchBar()
        ) : (
          <View style={{ flexDirection: "row", marginVertical: 10 }}>
            <Pressable
              onPress={() => setActiveTab("movies")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginHorizontal: 10,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 20,
                  color:
                    activeTab === "movies" ? colors.secondary : colors.gray,
                  fontWeight: activeTab === "movies" ? "bold" : "normal",
                }}
              >
                Movies
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("tvSeries")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginHorizontal: 10,
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 20,
                  color:
                    activeTab === "tvSeries" ? colors.secondary : colors.gray,
                  fontWeight: activeTab === "tvSeries" ? "bold" : "normal",
                }}
              >
                TV Series
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setIsSearchVisible(true)}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginLeft: "auto",
                  marginRight: 10,
                },
              ]}
            >
              <Ionicons name="search" size={26} color={colors.secondary} />
            </Pressable>
          </View>
        )}

        <FlatList
          numColumns={3}
          data={activeTab === "movies" ? filteredMovies : filteredTVSeries}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text
              style={[
                styles.text,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              {searchQuery.trim() !== ""
                ? "No matches found."
                : `No ${
                    activeTab === "movies" ? "movies" : "TV series"
                  } are in this genre.`}
            </Text>
          }
          ListFooterComponent={
            shouldShowLoading() ? (
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
  content: {
    flex: 1,
    padding: 16,
  },
  showItem: {
    marginTop: 10,
    marginHorizontal: 5,
  },
  text: {
    fontSize: 16,
    padding: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    padding: 5,
  },
  clearButton: {
    position: "absolute",
    left: "88%",
  },
});

export default GenreScreen;
