import React, { useEffect, useState } from "react";
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
import { Ionicons } from "react-native-vector-icons";
import SearchModal from "../components/SearchModal";
import placeholderPoster from "../../assets/no-poster-available.png";

const HomeScreen = ({ navigation }) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularTVSeries, setPopularTVSeries] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [preferredMovies, setPreferredMovies] = useState([]);
  const [preferredTVSeries, setpreferredTVSeries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { width } = Dimensions.get("window"); // Get device width

  const posterWidth = width * 0.3; // 30% of screen width
  const posterHeight = posterWidth * 1.5; // Maintain aspect ratio
  const movieItemWitdh = width * 0.8; // 80% of screen width
  const movieItemHeight = movieItemWitdh * (9 / 16); // Maintain aspect ratio (16:9)

  useEffect(() => {
    const user = firebase_auth.currentUser;
    if (user) {
      setIsEmailVerified(user.emailVerified);
    }

    const getMoviesAndTV = async () => {
      const trendingMovies = await fetchTrendingMovies();
      setMovies(trendingMovies);
      const trendingTVSeries = await fetchTrendingTVSeries();
      setTVSeries(trendingTVSeries);

      const popularMovies = await fetchPopularMovies();
      setPopularMovies(popularMovies);
      const popularSeries = await fetchPopularTVSeries();
      setPopularTVSeries(popularSeries);

      const nowPlaying = await fetchNowPlaying();
      setNowPlaying(nowPlaying);
    };

    const getGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };

    getGenres();

    // const fetchUserPreferences = async () => {
    //   const user = firebase_auth.currentUser;
    //   if (!user) return;

    //   const userDoc = await getDoc(doc(db, "users", user.uid));
    //   if (userDoc.exists()) {
    //     const movies = await fetchMoviesByGenres(userDoc.data().preferredGenres);
    //     setPreferredMovies(movies);
    //   }
    // };

    getMoviesAndTV();
    // fetchUserPreferences();
  }, []);

  const handleResendVerification = async () => {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
      Alert.alert("Verification email sent!");
    }
  };

  const handleShowDetails = async (item) => {
    if (item.media_type === "movies") {
      navigation.navigate("MovieDetails", {
        showId: item.id,
        type: "movies",
      });
    } else {
      navigation.navigate("TVSeriesDetails", {
        showId: item.id,
        type: "tvSeries",
      });
    }
  };

  const renderShowItem = ({ item }) => (
    <Pressable style={styles.movieItem} onPress={() => handleShowDetails(item)}>
      <Image
        source={
          item.poster_path
            ? { uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }
            : placeholderPoster
        }
        style={{
          width: posterWidth,
          height: posterHeight,
          marginRight: 10,
          borderRadius: 10,
        }}
      />
    </Pressable>
  );

  const renderMovieItem = ({ item }) => (
    <Pressable style={styles.movieItem} onPress={() => handleShowDetails(item)}>
      <Image
        source={
          item.poster_path
            ? { uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path}` }
            : placeholderPoster
        }
        style={{
          width: movieItemWitdh,
          height: movieItemHeight,
          marginRight: 10,
          borderRadius: 10,
        }}
      />
      <Text style={styles.movieTitle}>{item.title}</Text>
    </Pressable>
  );

  const renderGenreButton = ({ item }) => {
    return (
      <Pressable
        style={[styles.genreButton, { backgroundColor: item.color }]}
        onPress={() =>
          navigation.navigate("Genres", {
            genreId: item.id,
            genreName: item.name,
          })
        }
      >
        <Text style={styles.genreText}>{item.name}</Text>
      </Pressable>
    );
  };

  return (
    <>
      <View style={styles.upperContainer} />
      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <View style={styles.headerContainer}>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="menu" size={28} color="#3F51B5" />
          </Pressable>
          <Text style={styles.header}>Home</Text>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
            onPress={() => setIsSearchVisible(true)}
          >
            <Ionicons name="search" size={26} color="#3F51B5" />
          </Pressable>
        </View>
        <View style={styles.divider} />
        <Text style={styles.title}>Welcome to Critique!</Text>

        {/* {!isEmailVerified && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Please verify your email to unlock all features.
            </Text>
            <Pressable style={styles.button} onPress={handleResendVerification}>
              <Text style={styles.buttonText}>Resend Verification Email</Text>
            </Pressable>
          </View>
        )} */}
        <View style={styles.genreContainer}>
          <FlatList
            horizontal
            data={genres}
            renderItem={renderGenreButton}
            keyExtractor={(item) => item.id.toString()}
            style={{ marginVertical: 10 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={{ paddingBottom: 100 }}>
          <View style={styles.sectionContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Now Playing</Text>
              <Ionicons name="play-circle-outline" size={24} color="black" />
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginRight: 5,
                },
              ]}
              onPress={() =>
                navigation.navigate("NowPlayingList", { type: "movies" })
              }
            >
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={nowPlaying}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
          />

          <View style={[styles.sectionContainer, { marginTop: 5 }]}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Trending Movies</Text>
              <Ionicons name="trending-up-outline" size={24} color="black" />
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginRight: 5,
                },
              ]}
              onPress={() =>
                navigation.navigate("TrendingList", { type: "movies" })
              }
            >
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={movies}
            renderItem={renderShowItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
          />

          <View style={[styles.sectionContainer, { marginTop: 15 }]}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Trending TV Series</Text>
              <Ionicons name="trending-up-outline" size={24} color="black" />
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginRight: 5,
                },
              ]}
              onPress={() =>
                navigation.navigate("TrendingList", { type: "tvSeries" })
              }
            >
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={tvSeries}
            renderItem={renderShowItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
          />

          <View style={[styles.sectionContainer, { marginTop: 15 }]}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Popular Movies</Text>
              <Ionicons name="heart" size={22} color="black" />
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginRight: 5,
                },
              ]}
              onPress={() =>
                navigation.navigate("PopularList", { type: "movies" })
              }
            >
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={popularTVSeries}
            renderItem={renderShowItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
          />

          <View style={[styles.sectionContainer, { marginTop: 15 }]}>
            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>Popular TV Series</Text>
              <Ionicons name="heart" size={22} color="black" />
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  marginRight: 5,
                },
              ]}
              onPress={() =>
                navigation.navigate("PopularList", { type: "tvSeries" })
              }
            >
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="black"
              />
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={popularMovies}
            renderItem={renderShowItem}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <SearchModal
          isVisible={isSearchVisible}
          onClose={() => setIsSearchVisible(false)}
        />
      </ScrollView>
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
    marginBottom: 5,
    justifyContent: "space-around",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginHorizontal: 120,
    fontWeight: "bold",
  },
  divider: {
    borderBottomColor: "#9E9E9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    marginVertical: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  banner: {
    backgroundColor: "#ffeb3b",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: {
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  containerMovie: {
    flex: 1,
    padding: 16,
  },
  movieItem: {
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  movieTitle: {
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  genreButton: {
    padding: 10,
    margin: 5,
    marginRight: 2,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  genreText: {
    color: "#fff",
    fontSize: 16,
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    marginHorizontal: 8,
  },
});

export default HomeScreen;
