// screens/MovieDetailsScreen.js - Display detailed information about a movie
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Rating } from "@kolking/react-native-rating";
import {
  fetchMovieDetails,
  fetchTVSeriesDetails,
  fetchTVSeriesSeason,
} from "../services/tmdb";
import {
  saveToWatchList,
  getMovieData,
  getTVSeriesData,
  updateShowProgress,
} from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import CategoryModal from "../components/CategoryModal";

const ShowDetailsScreen = ({ route }) => {
  const { showId, type } = route.params;
  const [show, setShow] = useState(null);
  const [userReview, setUserReview] = useState("");
  const [category, setCategory] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [episodesCount, setEpisodesCount] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [episodeOpen, setEpisodeOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [apiRating, setApiRating] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadShowDetails = async () => {
      const showDetails = await (type == "movies"
        ? fetchMovieDetails(showId)
        : fetchTVSeriesDetails(showId));
      setShow(showDetails);

      setApiRating(Number(showDetails.vote_average) / 2); // Convert /10 to /5

      if (type === "tvSeries") {
        const totalSeasons = showDetails.number_of_seasons || 0;
        setSeasons(
          Array.from({ length: totalSeasons }, (_, i) => ({
            label: `S${i + 1}`,
            value: i + 1,
          }))
        );
      }

      if (firebase_auth.currentUser) {
        const savedData = await (type == "movies"
          ? getMovieData(firebase_auth.currentUser.uid, showId)
          : getTVSeriesData(firebase_auth.currentUser.uid, showId));
        if (savedData) {
          setUserReview(savedData.review || "");
          setCategory(savedData.category || "");
          setUserRating(savedData.rating || 0);
          if (type == "tvSeries") {
            setSelectedSeason(savedData.season || "-");
            setSelectedEpisode(savedData.episode || "-");
          }

          // Set is Added if savedData contains a movie/series, meaning user already has added this show before.
          setIsAdded(true);
        }
      }
    };
    loadShowDetails();
  }, [showId]);

  useEffect(() => {
    if (selectedSeason && selectedSeason !== "-") {
      const fetchEpisodes = async () => {
        const seasonDetails = await fetchTVSeriesSeason(showId, selectedSeason);
        const totalEpisodes = seasonDetails.episodes.length;
        setEpisodesCount(totalEpisodes);
        setEpisodes(
          Array.from({ length: totalEpisodes }, (_, i) => ({
            label: `Ep${i + 1}`,
            value: i + 1,
          }))
        );
      };
      fetchEpisodes();
    } else {
      setEpisodes([{ label: "-", value: "-" }]);
      setSelectedEpisode("-");
    }
  }, [selectedSeason]);

  const handleSaveShow = async () => {
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
      if (type === "tvSeries") {
        data.currentSeason = selectedSeason;
        data.currentEpisode = selectedEpisode;
      }

      if (isAdded) {
        console.log("Updating...");
        await updateShowProgress(userId, showId, type, data);
        alert(`${type} details updated successfully!`);
      } else {
        await saveToWatchList(
          userId,
          show,
          type,
          category,
          userRating,
          userReview
        );
        setIsAdded(true);
        alert(`${type} added to watchlist!`);
      }
    } else {
      alert("Please log in to save movies/tv series.");
    }
  };

  // Function to handle star clicks
  const handleStarPress = (rating) => {
    setUserRating(rating); // Update rating
  };

  // Function to handle text input change
  const handleInputChange = (text) => {
    // Allow empty input
    if (text === "") {
      setUserRating("");
      return;
    }

    // Allow numbers and at most one decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      const parsedRating = parseFloat(text);
      if (parsedRating >= 0 && parsedRating <= 5) {
        setUserRating(text); // Keep as string to allow "3."
      }
    }
  };

  if (!show) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.detailsContainer}>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
            }}
            style={styles.poster}
          />
          <View style={styles.textContainer}>
            <Text style={styles.showTitle}>
              {type == "movies" ? show.title : show.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Rating
                maxRating={5}
                rating={apiRating}
                disabled={true} // Viewers rating is read-only
                onChange={() => {}}
                size={20}
              />
              <Text style={styles.ratingText}>{apiRating} / 5</Text>
            </View>
            <Text style={styles.synopsis}>
              {expanded
                ? show.overview
                : `${show.overview.substring(0, 100)}...`}
            </Text>
            <Pressable onPress={() => setExpanded(!expanded)}>
              <Text style={styles.readMore}>
                {expanded ? "Read Less" : "Read More..."}
              </Text>
            </Pressable>
          </View>
        </View>

        <View>
          {/* User Rating */}
          {isAdded && (
            <>
              <Text style={styles.label}>Your Rating</Text>
              <View style={styles.ratingContainer}>
                <Rating
                  maxRating={5}
                  rating={userRating}
                  onChange={(rating) => handleStarPress(rating)}
                  size={24}
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.ratingInput}
                    keyboardType="numeric"
                    value={userRating}
                    onChangeText={handleInputChange}
                  />
                  <Text style={styles.slashFive}>/ 5</Text>
                </View>
              </View>
            </>
          )}
        </View>

        <View>
          {isAdded && (
            <>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <TextInput
                style={styles.input}
                placeholder="Write your review..."
                value={userReview}
                onChangeText={setUserReview}
                placeholderTextColor={"#888"}
              />
            </>
          )}
        </View>

        {type === "tvSeries" && isAdded && (
          <>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.seasonText}>Season:</Text>
              <DropDownPicker
                open={seasonOpen}
                value={selectedSeason}
                items={seasons}
                setOpen={setSeasonOpen}
                setValue={setSelectedSeason}
                setItems={setSeasons}
                containerStyle={{ width: "25%" }}
                listMode="SCROLLVIEW"
                placeholder="-"
              />

              <Text style={styles.episodeText}>Episode:</Text>
              <DropDownPicker
                open={episodeOpen}
                value={selectedEpisode}
                items={episodes}
                setOpen={setEpisodeOpen}
                setValue={setSelectedEpisode}
                setItems={setEpisodes}
                disabled={selectedSeason === "-"}
                listMode="SCROLLVIEW"
                placeholder="-"
                containerStyle={{ width: "25%" }}
              />
            </View>
          </>
        )}

        {type === "tvSeries" && !isAdded && (
          <View style={styles.progressContainer}>
            <Text style={styles.seasonText}>Seasons:</Text>
            <DropDownPicker
              open={seasonOpen}
              value={selectedSeason}
              items={seasons}
              setOpen={setSeasonOpen}
              setValue={setSelectedSeason}
              setItems={setSeasons}
              containerStyle={{ width: "25%" }}
              listMode="SCROLLVIEW"
              placeholder="-"
            />
            <Text style={styles.episodeText}>Episodes: {episodesCount}</Text>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 50,
        }}
      />

      {!isAdded && (
        <View style={styles.saveButtonContainer}>
          <Pressable
            style={styles.button}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>Add to List</Text>
          </Pressable>
        </View>
      )}

      {isAdded && (
        <View style={styles.saveButtonContainer}>
          <Pressable style={styles.button} onPress={handleSaveShow}>
            <Text style={styles.buttonText}>Update Details</Text>
          </Pressable>
        </View>
      )}

      <CategoryModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        show={show}
        type={type}
        setIsAdded={setIsAdded}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 16,
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
    marginBottom: 15,
  },
  synopsis: {
    fontSize: 15,
    marginTop: 5,
  },
  readMore: {
    color: "blue",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 24,
    marginVertical: 10,
    textAlign: "center",
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
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  ratingInput: {
    textAlign: "center",
    fontSize: 16,
    color: "#000",
  },
  slashFive: {
    fontSize: 16,
    marginLeft: 5,
    color: "#000",
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
  saveButtonContainer: {
    position: "absolute",
    bottom: 16,
    left: 25,
    right: 25,
  },
});

export default ShowDetailsScreen;
