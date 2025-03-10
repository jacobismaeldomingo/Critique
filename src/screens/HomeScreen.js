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
} from "react-native";
import {
  fetchTrendingMovies,
  fetchTrendingTVSeries,
  fetchGenres,
} from "../services/tmdb";
import { firebase_auth } from "../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";
import SearchModal from "../components/SearchModal";

const HomeScreen = ({ navigation }) => {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [preferredMovies, setPreferredMovies] = useState([]);
  const [preferredTVSeries, setpreferredTVSeries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    const user = firebase_auth.currentUser;
    if (user) {
      setIsEmailVerified(user.emailVerified);
    }

    const getMoviesAndTV = async () => {
      const popularMovies = await fetchTrendingMovies();
      setMovies(popularMovies);
      const popularTVSeries = await fetchTrendingTVSeries();
      setTVSeries(popularTVSeries);
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
        source={{
          uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        }}
        style={{ width: 120, height: 180, marginRight: 10, borderRadius: 10 }}
      />
    </Pressable>
  );

  const renderGenreButton = ({ item }) => {
    return (
      <Pressable
        style={[styles.genreButton, { backgroundColor: item.color }]}
        onPress={() =>
          navigation.navigate("GenreScreen", {
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
          <Ionicons name="menu" size={28} color="black" />
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
          <Ionicons name="search" size={26} color="black" />
        </Pressable>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 5,
        }}
      />
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
      <View>
        <Text style={styles.sectionTitle}>Popular Movies</Text>
        <FlatList
          horizontal
          data={movies}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
        />

        <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
          Popular TV Series
        </Text>
        <FlatList
          horizontal
          data={tvSeries}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* <View>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <FlatList
          horizontal
          data={preferredMovies}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </View> */}

      <SearchModal
        isVisible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
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
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 12,
    marginLeft: 8,
  },
});

export default HomeScreen;
