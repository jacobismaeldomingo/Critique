import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
} from "react-native";
import {
  fetchTrendingMovies,
  fetchTrendingTVSeries,
  fetchGenres,
  fetchPopularMovies,
  fetchPopularTVSeries,
  fetchNowPlaying,
} from "../services/tmdb";
import { firebase_auth } from "../../firebaseConfig";
import { Ionicons, MaterialIcons } from "react-native-vector-icons";
import SearchModal from "../components/SearchModal";
import placeholderPoster from "../../assets/no-poster-available.png";
import { ThemeContext } from "../components/ThemeContext";
import { getTheme } from "../components/theme";

const { width } = Dimensions.get("window");
const posterWidth = width * 0.3;
const posterHeight = posterWidth * 1.5;
const featuredWidth = width * 0.85;
const featuredHeight = featuredWidth * 0.56;

const HomeScreen = ({ navigation }) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVSeries, setPopularTVSeries] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Entry animations
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
    ]).start();

    const user = firebase_auth.currentUser;
    if (user) {
      setIsEmailVerified(user.emailVerified);
    }

    // const fetchUserPreferences = async () => {
    //   const user = firebase_auth.currentUser;
    //   if (!user) return;

    //   const userDoc = await getDoc(doc(db, "users", user.uid));
    //   if (userDoc.exists()) {
    //     const movies = await fetchMoviesByGenres(userDoc.data().preferredGenres);
    //     setPreferredMovies(movies);
    //   }
    // };

    // Load data
    const loadData = async () => {
      const [
        trendingMovies,
        trendingTVSeries,
        popularMovies,
        popularSeries,
        nowPlaying,
        genreList,
      ] = await Promise.all([
        fetchTrendingMovies(),
        fetchTrendingTVSeries(),
        fetchPopularMovies(),
        fetchPopularTVSeries(),
        fetchNowPlaying(),
        fetchGenres(),
      ]);

      setMovies(trendingMovies);
      setTVSeries(trendingTVSeries);
      setPopularMovies(popularMovies);
      setPopularTVSeries(popularSeries);
      setNowPlaying(nowPlaying);
      setGenres(genreList);
    };

    loadData();
  }, []);

  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      Alert.alert("Verification email sent!");
    }
  };

  const handleShowDetails = async (item) => {
    navigation.navigate(
      item.media_type === "movies" ? "MovieDetails" : "TVSeriesDetails",
      {
        showId: item.id,
        type: item.media_type,
      }
    );
  };

  const renderShowItem = ({ item }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          style={styles.movieItem}
          onPress={() => handleShowDetails(item)}
          onPressIn={() => {
            Animated.spring(animation, {
              toValue: 0.95,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(animation, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Image
            source={
              item.poster_path
                ? { uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }
                : placeholderPoster
            }
            style={styles.posterImage}
          />
        </Pressable>
      </Animated.View>
    );
  };

  const renderFeaturedItem = ({ item }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          style={styles.featuredItem}
          onPress={() => handleShowDetails(item)}
          onPressIn={() => {
            Animated.spring(animation, {
              toValue: 0.97,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(animation, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Image
            source={
              item.backdrop_path
                ? {
                    uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path}`,
                  }
                : placeholderPoster
            }
            style={styles.featuredImage}
          />
          <Text style={[styles.featuredTitle, { color: colors.text }]}>
            {item.title || item.name}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const renderGenreButton = ({ item }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          style={[styles.genreButton, { backgroundColor: item.color }]}
          onPress={() =>
            navigation.navigate("Genres", {
              genreId: item.id,
              genreName: item.name,
            })
          }
          onPressIn={() => {
            Animated.spring(animation, {
              toValue: 0.95,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(animation, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text style={styles.genreText}>{item.name}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const renderSection = (title, data, iconName, listType, type, renderItem) => (
    <Animated.View
      style={[
        styles.section,
        { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <MaterialIcons
            name={iconName}
            size={24}
            color={colors.primary}
            style={styles.sectionIcon}
          />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {title}
          </Text>
        </View>
        <Pressable
          onPress={() =>
            navigation.navigate(`${listType}List`, {
              type: type,
            })
          }
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <MaterialIcons
            name="chevron-right"
            size={28}
            color={colors.primary}
          />
        </Pressable>
      </View>
      {data.length > 0 ? (
        <FlatList
          horizontal
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons
            name="theaters"
            size={40}
            color={colors.gray}
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyText, { color: colors.gray }]}>
            No {title.toLowerCase()} available
          </Text>
        </View>
      )}
    </Animated.View>
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
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: "#fff" }]}>Home</Text>
        <Pressable
          onPress={() => setIsSearchVisible(true)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.welcomeContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Welcome to
          </Text>
          <Text style={[styles.appName, { color: colors.primary }]}>
            Critique
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Browse Genres
          </Text>
          <FlatList
            horizontal
            data={genres}
            renderItem={renderGenreButton}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreList}
          />
        </Animated.View>

        {renderSection(
          "Now Playing",
          nowPlaying,
          "play-circle-filled",
          "NowPlaying",
          "movies",
          renderFeaturedItem
        )}

        {renderSection(
          "Trending Movies",
          movies,
          "trending-up",
          "Trending",
          "movies",
          renderShowItem
        )}

        {renderSection(
          "Trending TV Series",
          tvSeries,
          "trending-up",
          "Trending",
          "tvSeries",
          renderShowItem
        )}

        {renderSection(
          "Popular Movies",
          popularMovies,
          "local-fire-department",
          "Popular",
          "movies",
          renderShowItem
        )}

        {renderSection(
          "Popular TV Series",
          popularTVSeries,
          "local-fire-department",
          "Popular",
          "tvSeries",
          renderShowItem
        )}
      </ScrollView>

      <SearchModal
        isVisible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
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
  scrollContent: {
    paddingBottom: Platform.select({
      ios: 30,
      android: 100,
    }),
    paddingHorizontal: 16,
  },
  welcomeContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  genreList: {
    paddingVertical: 10,
  },
  genreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  genreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingLeft: 5,
  },
  movieItem: {
    marginRight: 15,
  },
  posterImage: {
    width: posterWidth,
    height: posterHeight,
    borderRadius: 10,
  },
  featuredItem: {
    width: featuredWidth,
    marginRight: 15,
  },
  featuredImage: {
    width: featuredWidth,
    height: featuredHeight,
    borderRadius: 10,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 8,
  },
  emptyState: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
});

export default HomeScreen;
