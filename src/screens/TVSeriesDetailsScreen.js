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
  Checkbox,
} from "react-native";
import { Rating } from "@kolking/react-native-rating";
import {
  fetchTVSeriesDetails,
  fetchTVSeriesProviders,
  fetchTVSeriesCast,
} from "../services/tmdb";
import {
  saveToWatchList,
  getTVSeriesData,
  updateShowProgress,
} from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import CategoryModal from "../components/CategoryModal";
import RateModal from "../components/RateModal";
import { Ionicons } from "react-native-vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TVSeriesDetailsScreen = ({ route, navigation }) => {
  const { showId } = route.params;
  const [tvSeries, setTVSeries] = useState(null);
  const [userReview, setUserReview] = useState("");
  const [category, setCategory] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [apiRating, setApiRating] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [providers, setProviders] = useState([]);
  const [cast, setCast] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [expandedSeasons, setExpandedSeasons] = useState({});
  const [watchedEpisodes, setWatchedEpisodes] = useState({});
  const [genres, setGenres] = useState([]);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [rateVisible, setRateVisible] = useState(false);

  useEffect(() => {
    const loadTVSeriesDetails = async () => {
      const seriesDetails = await fetchTVSeriesDetails(showId);
      setTVSeries(seriesDetails);
      setApiRating(Number(seriesDetails.vote_average) / 2);
      setSeasons(seriesDetails.seasons);
      setGenres(seriesDetails.genres);

      const loadProviders = async () => {
        const providersDetails = await fetchTVSeriesProviders(showId);
        setProviders(providersDetails);
      };

      const loadCast = async () => {
        const castDetails = await fetchTVSeriesCast(showId);
        setCast(castDetails);
      };

      if (firebase_auth.currentUser) {
        const savedData = await getTVSeriesData(
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

      // Load watched episodes from AsyncStorage
      const loadWatchedEpisodes = async () => {
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          // Filter keys that are related to watched episodes (keys with `watchedEpisodes_{showId}_{seasonNumber}`)
          const watchedKeys = allKeys.filter((key) =>
            key.startsWith(`watchedEpisodes_${showId}_`)
          );
          let allWatchedEpisodes = [];

          // Fetch all watched episodes from the filtered keys
          for (const key of watchedKeys) {
            const savedWatchedEpisodes = await AsyncStorage.getItem(key);
            if (savedWatchedEpisodes) {
              const seasonNumber = key.split("_")[2]; // Extract season number from the key
              allWatchedEpisodes[seasonNumber] =
                JSON.parse(savedWatchedEpisodes);
            }
          }

          setWatchedEpisodes(allWatchedEpisodes);
        } catch (error) {
          console.error(
            "Failed to load watched episodes from AsyncStorage",
            error
          );
        }
      };

      loadWatchedEpisodes();
      loadProviders();
      loadCast();
    };

    loadTVSeriesDetails();
  }, [showId]);

  const handleSaveTVSeries = async () => {
    if (!category) {
      alert("Please select a category first before adding to list.");
      return;
    }

    if (firebase_auth.currentUser) {
      const userId = firebase_auth.currentUser.uid;
      const data = {
        category,
        rating: userRating,
        review: userReview,
      };

      if (isAdded) {
        await updateShowProgress(userId, showId, "tvSeries", data);
        alert(`${tvSeries.name} movie details updated successfully!`);
      } else {
        await saveToWatchList(
          userId,
          tvSeries,
          "tvSeries",
          category,
          userRating,
          userReview
        );
        setIsAdded(true);
        alert(`${tvSeries.name} added to watchlist!`);
      }
    } else {
      alert("Please log in to save TV series.");
    }
  };

  const renderProviderItem = ({ item }) => (
    <Pressable style={styles.providerItem}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.logo_path}` }}
        style={styles.seriesProvider}
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

  const renderSeasonItem = ({ item }) => {
    return (
      <Pressable
        style={styles.seasonItem}
        onPress={() =>
          navigation.navigate("SeriesEpisode", {
            seriesId: showId,
            seasonNumber: item.season_number,
            watchedEpisodes: watchedEpisodes[item.season_number] || [],
            updateWatchedEpisodes,
          })
        }
      >
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
          style={styles.seasonPoster}
        />
        <Text style={styles.seasonTitle}>{item.name}</Text>
      </Pressable>
    );
  };

  // Function to update watched episodes
  const updateWatchedEpisodes = async (seasonNumber, watchedEps) => {
    // Update the state
    setWatchedEpisodes((prev) => ({
      ...prev,
      [seasonNumber]: watchedEps,
    }));

    // Save updated watched episodes in AsyncStorage
    try {
      await AsyncStorage.setItem(
        `watchedEpisodes_${showId}_${seasonNumber}`,
        JSON.stringify(watchedEps)
      );
    } catch (error) {
      console.error("Failed to save watched episodes to AsyncStorage", error);
    }
  };

  const watchedSeasons = seasons.filter((season) => {
    const watchedEpsForSeason = watchedEpisodes[season.season_number] || [];
    return watchedEpsForSeason.length === season.episode_count;
  }).length;

  const watchedEpisodesCount = Object.values(watchedEpisodes)
    .flat()
    .filter(Boolean).length;

  if (!tvSeries) {
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
            style={{ marginRight: 25 }}
          />
        </Pressable>
        <Text style={styles.header}>TV Series Details</Text>
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
              uri: `https://image.tmdb.org/t/p/w500${tvSeries.poster_path}`,
            }}
            style={styles.poster}
          />
          <View style={styles.textContainer}>
            <Text style={styles.showTitle}>{tvSeries.name}</Text>
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
                  ? tvSeries.overview
                  : `${tvSeries.overview.substring(0, 100)}...`}
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

            <Text style={styles.label}>Seasons</Text>
            <FlatList
              horizontal
              data={seasons}
              renderItem={renderSeasonItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={
                <Text style={styles.text}>No seasons yet in this series.</Text>
              }
              showsHorizontalScrollIndicator={false}
            />
            <Text style={styles.label}>Details</Text>
            <View style={{ marginBottom: 20 }}>
              <View style={styles.details}>
                <Text style={styles.detailsTitle}>Directed By</Text>
                <Text style={styles.detailsText}>
                  {tvSeries.created_by[0]?.name}
                </Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.detailsTitle}>First Air Date</Text>
                <Text style={styles.detailsText}>
                  {tvSeries.first_air_date}
                </Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.detailsTitle}>Last Air Date</Text>
                <Text style={styles.detailsText}>{tvSeries.last_air_date}</Text>
              </View>
              {tvSeries.next_episode_to_air ? (
                <View style={styles.details}>
                  <Text style={styles.detailsTitle}>Next Episode to Air</Text>
                  <Text style={styles.detailsText}>
                    {tvSeries.next_episode_to_air.air_date}
                  </Text>
                </View>
              ) : null}
              <View style={styles.details}>
                <Text style={styles.detailsTitle}>Status</Text>
                <Text style={styles.detailsText}>{tvSeries.status}</Text>
              </View>
            </View>
          </>
        )}

        {activeTab === "review" && isAdded && (
          <>
            <Text style={styles.label}>Your Progress</Text>
            <Text style={styles.textProgress}>
              Watched Seasons: {watchedSeasons} / {seasons.length}
            </Text>
            <Text style={styles.textProgress}>
              Watched Episodes: {watchedEpisodesCount}
            </Text>
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
          <Pressable style={styles.button} onPress={handleSaveTVSeries}>
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
        show={tvSeries}
        type="tvSeries"
        setIsAdded={setIsAdded}
      />
      <RateModal
        isVisible={rateVisible}
        onClose={() => setRateVisible(false)}
        showId={showId}
        type="tvSeries"
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
    marginLeft: 50,
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
    marginBottom: 10,
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
  progressContainer: {
    flexDirection: "row",
    marginVertical: 10,
    zIndex: 1000,
    marginTop: 10,
  },
  seasonText: {
    fontSize: 16,
    marginTop: 15,
    marginRight: 5,
  },
  episodeText: {
    fontSize: 16,
    marginTop: 15,
    marginLeft: 15,
    marginRight: 5,
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
  seriesProvider: {
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
  seasonContainer: {
    flexDirection: "row",
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
  seasonItem: {
    width: 100,
    alignItems: "center",
    marginRight: 10,
  },
  seasonPoster: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },
  seasonTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 5,
  },
  genreText: {
    marginTop: 5,
    fontSize: 15,
  },
  text: {
    margin: 5,
    fontSize: 15,
  },
  textProgress: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: "400",
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
});

export default TVSeriesDetailsScreen;
