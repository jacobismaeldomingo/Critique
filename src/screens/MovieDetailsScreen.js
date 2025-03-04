// screens/MovieDetailsScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Rating } from "@kolking/react-native-rating";
import {
  fetchMovieCast,
  fetchMovieDetails,
  fetchMoviesProviders,
} from "../services/tmdb";
import {
  saveToWatchList,
  getMovieData,
  updateShowProgress,
} from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import CategoryModal from "../components/CategoryModal";
import RateModal from "../components/RateModal";
import { Ionicons } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";

const MovieDetailsScreen = ({ route }) => {
  const { showId } = route.params;
  const [movie, setMovie] = useState(null);
  const [userReview, setUserReview] = useState("");
  const [category, setCategory] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [apiRating, setApiRating] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [providers, setProviders] = useState([]);
  const [cast, setCast] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [genres, setGenres] = useState([]);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [rateVisible, setRateVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const loadMovieDetails = async () => {
      const movieDetails = await fetchMovieDetails(showId);
      setMovie(movieDetails);
      setApiRating(Number(movieDetails.vote_average) / 2); // Convert /10 to /5
      setGenres(movieDetails.genres);

      const loadProviders = async () => {
        const providersDetails = await fetchMoviesProviders(showId);
        setProviders(providersDetails);
      };

      const loadCast = async () => {
        const castDetails = await fetchMovieCast(showId);
        setCast(castDetails);
      };

      if (firebase_auth.currentUser) {
        const savedData = await getMovieData(
          firebase_auth.currentUser.uid,
          showId
        );
        if (savedData) {
          setUserReview(savedData.review || "");
          setCategory(savedData.category || "");
          setUserRating(savedData.rating || 0);
          setIsAdded(true);
        }
      }

      loadProviders();
      loadCast();
    };

    loadMovieDetails();
  }, [showId]);

  const handleSaveMovie = async () => {
    if (!category) {
      alert("Please select a category first before adding to list.");
      return;
    }

    if (firebase_auth.currentUser) {
      const userId = firebase_auth.currentUser.uid;
      const data = { category, rating: userRating, review: userReview };

      if (isAdded) {
        await updateShowProgress(userId, showId, "movies", data);
        alert(`${movie.title} series details updated successfully!`);
      } else {
        await saveToWatchList(
          userId,
          movie,
          "movies",
          category,
          userRating,
          userReview
        );
        setIsAdded(true);
        alert(`${movie.title} added to watchlist!`);
      }
    } else {
      alert("Please log in to save movies.");
    }
  };

  const renderProviderItem = ({ item }) => (
    <Pressable style={styles.providerItem}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.logo_path}` }}
        style={styles.movieProvider}
      />
    </Pressable>
  );

  const renderCastItem = ({ item }) => (
    <Pressable style={styles.castItem}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.profile_path}` }}
        style={styles.seriesCast}
      />
      <Text style={styles.castName}>{item.name}</Text>
      <Text style={styles.castRole}>
        {item.roles?.[0]?.character || "Unknown Role"}
      </Text>
    </Pressable>
  );

  if (!movie) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons
            name="chevron-back-circle-outline"
            size={28}
            color="black"
            style={{ marginRight: 50 }}
          />
        </Pressable>
        <Text style={styles.header}>Movie Details</Text>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 15,
        }}
      />
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.detailsContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            }}
            style={styles.poster}
          />
          <View style={styles.textContainer}>
            <Text style={styles.showTitle}>{movie.title}</Text>
            <View style={styles.ratingContainer}>
              <Rating
                maxRating={5}
                rating={apiRating}
                disabled={true} // Viewers rating is read-only
                size={20}
              />
              <Text style={styles.ratingText}>{apiRating} / 5</Text>
            </View>
            <Text style={styles.genreText}>
              {genres.map((genre) => genre.name).join(", ") ||
                "No genres available"}
            </Text>
            <Text
              style={{ fontSize: 18, fontWeight: "600", marginVertical: 10 }}
            >
              Providers
            </Text>
            <FlatList
              horizontal
              data={providers}
              renderItem={renderProviderItem}
              keyExtractor={(item) => item.provider_id.toString()}
              ListEmptyComponent={
                <Text style={styles.text}>
                  No providers found for this series.
                </Text>
              }
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("details")}
            style={[
              styles.tabButton,
              activeTab === "details" && styles.activeTabButton,
              !isAdded && styles.showAdded,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "details" && styles.activeTabText,
              ]}
            >
              Details
            </Text>
          </TouchableOpacity>

          {isAdded && (
            <TouchableOpacity
              onPress={() => setActiveTab("review")}
              style={[
                styles.tabButton,
                activeTab === "review" && styles.activeTabButton,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "review" && styles.activeTabText,
                ]}
              >
                Review
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {activeTab === "details" && (
          <>
            <Text style={styles.label}>Synopsis</Text>
            <View style={styles.synopsisContainer}>
              <Text style={styles.synopsis}>
                {expanded
                  ? movie.overview
                  : `${movie.overview.substring(0, 100)}...`}
              </Text>
              <Pressable onPress={() => setExpanded(!expanded)}>
                <Text style={styles.readMore}>
                  {expanded ? "Read Less" : "Read More..."}
                </Text>
              </Pressable>
            </View>

            <View style={styles.castContainer}>
              <Text style={styles.label}>Cast</Text>
              <Pressable
                onPress={() =>
                  navigation.navigate("FullCastCrew", { cast, showId })
                }
              >
                <Text style={styles.showAllText}>Show All</Text>
              </Pressable>
            </View>
            <FlatList
              horizontal
              data={cast.slice(0, 10)} // Show only the first 10-15
              renderItem={renderCastItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.text}>No cast found.</Text>
              }
              showsHorizontalScrollIndicator={false}
            />

            <Text style={styles.label}>Details</Text>
            <View style={{ marginBottom: 20 }}>
              <View style={styles.details}>
                <Text style={styles.detailsTitle}>Release Date</Text>
                <Text style={styles.detailsText}>{movie.release_date}</Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.detailsTitle}>Status</Text>
                <Text style={styles.detailsText}>{movie.status}</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === "review" && isAdded && (
          <>
            <Text style={styles.label}>Your Review</Text>
            <TextInput
              style={styles.input}
              placeholder="Write your review..."
              value={userReview}
              onChangeText={setUserReview}
              placeholderTextColor={"#888"}
            />
            <Text style={styles.label}>Images</Text>
            <Text style={styles.label}>Maps</Text>
          </>
        )}
      </ScrollView>

      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: -10,
        }}
      />

      {!isAdded ? (
        <Pressable
          style={styles.button}
          onPress={() => setCategoryVisible(true)}
        >
          <Text style={styles.buttonText}>Add to List</Text>
        </Pressable>
      ) : (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={handleSaveMovie}>
            <Text style={styles.buttonText}>Update Details</Text>
          </Pressable>
          <Pressable
            style={styles.starButton}
            onPress={() => setRateVisible(true)}
          >
            <Ionicons name="star-outline" size={28} color="white" />
          </Pressable>
        </View>
      )}

      <CategoryModal
        isVisible={categoryVisible}
        onClose={() => setCategoryVisible(false)}
        show={movie}
        type="movies"
        setIsAdded={setIsAdded}
      />
      <RateModal
        isVisible={rateVisible}
        onClose={() => setRateVisible(false)}
        showId={showId}
        type="movies"
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
  scrollView: {
    flex: 1,
    padding: 5,
  },
  headerContainer: {
    padding: 5,
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginRight: 150,
    marginLeft: 42,
    fontWeight: "500",
  },
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "flex-start",
  },
  poster: {
    width: 130,
    height: 200,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  showTitle: {
    fontSize: 24,
    marginBottom: 5,
    fontWeight: "bold",
  },
  synopsis: {
    fontSize: 15,
  },
  readMore: {
    color: "blue",
    marginTop: 5,
  },
  input: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    borderColor: "black",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    justifyContent: "center",
  },
  starButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 10,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  synopsisContainer: {
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 10,
  },
  providerItem: {
    flex: 1,
    alignItems: "center",
  },
  movieProvider: {
    width: 45,
    height: 45,
    borderRadius: 12,
    marginRight: 5,
  },
  castItem: {
    width: 100,
    alignItems: "center",
    marginRight: 10,
  },
  seriesCast: {
    width: 90,
    height: 130,
    borderRadius: 8,
    marginBottom: 5,
  },
  castName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "black",
    marginBottom: 2,
    width: "100%",
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
  castRole: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
    width: "100%",
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
  castContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  showAllText: {
    color: "blue",
    fontWeight: "500",
    marginTop: 5,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    backgroundColor: "gray", // Default background
    borderRadius: 5,
  },
  tabButton: {
    paddingVertical: 5,
    paddingHorizontal: 60,
    borderRadius: 5,
  },
  activeTabButton: {
    backgroundColor: "darkgray", // Active tab background
  },
  tabText: {
    fontSize: 18,
    color: "white",
  },
  activeTabText: {
    color: "white", // Active tab text color
    fontWeight: "bold",
  },
  showAdded: {
    paddingHorizontal: 150,
    width: "100%",
  },
  genreText: {
    marginTop: 5,
    fontSize: 15,
  },
  text: {
    margin: 5,
    fontSize: 15,
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginBottom: 5,
  },
  detailsTitle: {
    color: "#48494B",
    fontSize: 18,
  },
  detailsText: {
    color: "black",
    fontSize: 18,
  },
  backButtonPressed: {
    color: "#ddd", // Light grey effect when pressed
  },
});

export default MovieDetailsScreen;
