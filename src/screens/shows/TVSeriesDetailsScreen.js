import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { Rating } from "@kolking/react-native-rating";
import {
  fetchTVSeriesDetails,
  fetchTVSeriesProviders,
  fetchTVSeriesCast,
  fetchTVSeriesVideos,
} from "../../services/tmdb";
import {
  saveToWatchList,
  getTVSeriesData,
  updateShowProgress,
  savePhotoToFirestore,
  getShowPhotos,
  deletePhoto,
  getWatchedEpisodes,
} from "../../services/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { firebase_auth } from "../../../firebaseConfig";
import CategoryModal from "../../components/CategoryModal";
import RateModal from "../../components/RateModal";
import { Ionicons } from "react-native-vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "../../services/cloudinary";
import LoadingItem from "../../components/LoadingItem";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

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
  const [watchedEpisodes, setWatchedEpisodes] = useState({});
  const [genres, setGenres] = useState([]);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [rateVisible, setRateVisible] = useState(false);
  const [videos, setVideos] = useState([]);
  const [location, setLocation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);

  const { width } = Dimensions.get("window"); // Get device width

  const posterWidth = width * 0.3; // 30% of screen width
  const posterHeight = posterWidth * (3 / 2); // Maintain aspect ratio
  const castImageWidth = width * 0.22; // 22% of screen width
  const castImageHeight = castImageWidth * (130 / 90); // Maintain aspect ratio
  const videoWidth = width * 0.8; // 90% of screen width
  const videoHeight = videoWidth * (190 / 350); // Maintain 16:9 aspect ratio
  const singleVideoHeight = width * (9 / 18); // Maintain 18:9 aspect ratio
  const seasonPosterWidth = width * 0.25; // 25% of screen width
  const seasonPosterHeight = seasonPosterWidth * (150 / 100);
  const providerSize = width * 0.11;
  const imageHeight = width * (160 / 440);
  const ratingSize = width * 0.05;

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  useFocusEffect(
    useCallback(() => {
      const loadTVSeriesDetails = async () => {
        const seriesDetails = await fetchTVSeriesDetails(showId);
        setTVSeries(seriesDetails);
        setApiRating((Number(seriesDetails.vote_average) / 2).toFixed(2));
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

        const loadVideos = async () => {
          const videoDetails = await fetchTVSeriesVideos(showId);
          setVideos(videoDetails);
        };

        const loadPhotos = async () => {
          try {
            const userId = firebase_auth.currentUser.uid;
            const photos = await getShowPhotos(userId, showId, "tvSeries");
            setPhotos(photos);
          } catch (error) {
            console.error("Error loading photos:", error);
            Alert.alert("Error", "Failed to load photos");
          }
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
            setLocation(savedData.location);
            setPhotos(savedData.photos || []);
            setIsAdded(true);
          }
        }

        // Load watched episodes from AsyncStorage
        const loadWatchedEpisodes = async () => {
          try {
            const watched = await getWatchedEpisodes(
              firebase_auth.currentUser.uid,
              showId
            );
            setWatchedEpisodes(watched);
          } catch (error) {
            console.error(
              "Failed to load watched episodes from Firebase",
              error
            );
          }
        };

        loadWatchedEpisodes();
        loadProviders();
        loadCast();
        loadVideos();
        loadPhotos();
      };

      loadTVSeriesDetails();
    }, [showId])
  );

  const handleSaveTVSeries = async () => {
    if (!category) {
      Alert.alert("Please select a category first before adding to list.");
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
        Alert.alert(`${tvSeries.name} series details updated successfully!`);
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
      }
    } else {
      Alert.alert("Please log in to save TV series.");
    }
  };

  const renderProviderItem = ({ item }) => (
    <Pressable style={styles.providerItem}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.logo_path}` }}
        style={{
          width: providerSize,
          height: providerSize,
          borderRadius: 12,
          marginRight: 5,
        }}
      />
    </Pressable>
  );

  const renderCastItem = ({ item }) => (
    <Pressable style={styles.castItem}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.profile_path}` }}
        style={{
          width: castImageWidth,
          height: castImageHeight,
          borderRadius: 8,
          marginBottom: 5,
        }}
      />
      <Text
        style={[
          styles.castName,
          { color: colors.text, opacity: colors.opacity },
        ]}
      >
        {item.name}
      </Text>
      <Text style={[styles.castRole, { color: colors.gray }]}>
        {item.roles?.[0]?.character || "Unknown Role"}
      </Text>
    </Pressable>
  );

  const renderSeasonItem = ({ item }) => {
    const seasonKey = `Season ${item.season_number}`;
    const watched = watchedEpisodes[seasonKey]?.length || 0;
    const total = item.episode_count || 0; // make sure your season data has this
    const isComplete = watched === total && total > 0;

    return (
      <Pressable
        style={styles.seasonItem}
        onPress={() =>
          navigation.navigate("Season", {
            seriesId: showId,
            seasonNumber: item.season_number,
            watchedEpisodes:
              watchedEpisodes[`Season ${item.season_number}`] || [],
          })
        }
      >
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w200${item.poster_path}`,
            }}
            style={{
              width: seasonPosterWidth,
              height: seasonPosterHeight,
              borderRadius: 10,
              marginRight: 10,
            }}
          />
          {/* Badge */}
          <View
            style={{
              position: "absolute",
              top: 5,
              right: 5,
              backgroundColor: isComplete ? "#4CAF50" : "#FF9800",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontSize: 12 }}>
              {isComplete ? "✓ Done" : `${watched} / ${total}`}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.seasonTitle,
            { color: colors.text, opacity: colors.opacity },
          ]}
        >
          {item.name}
        </Text>
      </Pressable>
    );
  };

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoContainer}>
      <YoutubePlayer
        width={videoWidth}
        height={videoHeight}
        videoId={item.key} // YouTube video ID
        play={false} // Autoplay disabled
        webViewStyle={styles.videoPlayer}
      />
      <Text
        style={[
          styles.videoTitle,
          { color: colors.text, opacity: colors.opacity },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>
    </View>
  );

  const watchedSeasons = seasons.filter((season) => {
    const key = `Season ${season.season_number}`;
    const watchedEpsForSeason = watchedEpisodes[key] || [];
    return watchedEpsForSeason.length === season.episode_count;
  }).length;

  const watchedEpisodesCount = Object.values(watchedEpisodes)
    .flat()
    .filter(Boolean).length;

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const handleTakePhoto = () => {
    navigation.navigate("Camera");
  };

  // Function to view a photo in full screen
  const handleViewPhoto = (photo, index, photos, showId) => {
    navigation.navigate("PhotoViewer", {
      photo,
      index,
      photos,
      showId,
    });
  };

  // Function to edit caption
  const handleEditCaption = async (photoId, caption) => {
    try {
      const updatedPhotos = photos.map((photo) =>
        photo.id === photoId ? { ...photo, caption } : photo
      );

      setPhotos(updatedPhotos);

      if (firebase_auth.currentUser) {
        const userId = firebase_auth.currentUser.uid;
        await updateShowProgress(userId, showId, "movies", {
          photos: updatedPhotos,
        });
      }
    } catch (error) {
      console.error("Error updating caption:", error);
      Alert.alert("Error", "Failed to update caption");
    }
  };

  const handleAddFromGallery = async () => {
    try {
      // Request permission to access the media library
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photo library."
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const photoUri = result.assets[0].uri;

        // Show loading state (if you have one)
        setPhotoLoading(true);

        // Upload to Cloudinary
        const { secure_url, public_id } = await uploadImageToCloudinary(
          photoUri
        );

        if (!secure_url) {
          Alert.alert("Error", "Failed to upload image to Cloudinary.");
          setPhotoLoading(false);
          return;
        }

        // Generate a unique ID for the photo
        const photoId = generateId();

        // Save the photo metadata in Firestore (using Cloudinary URL)
        const userId = firebase_auth.currentUser.uid;
        await savePhotoToFirestore(userId, showId, "movies", {
          id: photoId,
          imageUrl: secure_url,
          public_id: public_id,
          caption: "",
          timestamp: new Date().toISOString(),
        });

        // Update local state
        setPhotos((prevPhotos) => [
          ...prevPhotos,
          { id: photoId, imageUrl: secure_url, public_id, caption: "" },
        ]);

        Alert.alert("Success", "Photo added successfully!");
      }
    } catch (error) {
      console.error("Error adding photo from gallery:", error);
      Alert.alert("Error", "Failed to add photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleDeletePhoto = async (photoToDelete) => {
    try {
      // Delete the photo from Firestore and the device
      await deletePhoto(
        firebase_auth.currentUser.uid,
        showId,
        "movies",
        photoToDelete
      );

      // Update local state
      const updatedPhotos = photos.filter(
        (photo) => photo.imageUrl !== photoToDelete.imageUrl
      );
      setPhotos(updatedPhotos);

      Alert.alert("Success", "Photo deleted successfully");
    } catch (error) {
      console.error("Error deleting photo:", error);
      Alert.alert("Error", "Failed to delete photo");
    }
  };

  const renderPhotoItem = ({ item, index }) => (
    <Pressable
      style={styles.photoItem}
      onPress={() => handleViewPhoto(item, index, photos, showId)}
      onLongPress={() =>
        Alert.alert("Photo Options", "What would you like to do?", [
          {
            text: "Edit Caption",
            onPress: () => {
              Alert.prompt(
                "Edit Caption",
                "Enter a caption for this photo:",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Save",
                    onPress: (caption) => handleEditCaption(item.id, caption),
                  },
                ],
                "plain-text",
                item.caption
              );
            },
          },
          {
            text: "Delete",
            onPress: () => {
              Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete this photo?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    onPress: () => handleDeletePhoto(item),
                    style: "destructive",
                  },
                ]
              );
            },
            style: "destructive",
          },
          { text: "Cancel", style: "cancel" },
        ])
      }
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: "100%", height: imageHeight, borderRadius: 8 }}
      />
      {item.caption ? (
        <Text style={styles.photoCaption} numberOfLines={1}>
          {item.caption}
        </Text>
      ) : null}
    </Pressable>
  );

  if (!tvSeries) {
    return <LoadingItem />;
  }

  return (
    <>
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
              style={{ marginRight: 25 }}
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text
              style={[
                styles.header,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              TV Series Details
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />
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
              style={{
                width: posterWidth,
                height: posterHeight,
                borderRadius: 8,
                marginRight: 16,
              }}
            />
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.showTitle,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                {tvSeries.name}
              </Text>
              <View style={styles.ratingContainer}>
                <Rating
                  maxRating={5}
                  rating={apiRating}
                  disabled={true} // Viewers rating is read-only
                  size={ratingSize}
                  fillColor="#9575CD"
                  touchColor="#FFFFFF"
                  baseColor={colors.gray}
                />
                <Text
                  style={[
                    styles.ratingText,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  {apiRating} / 5
                </Text>
              </View>
              <Text
                style={[
                  styles.genreText,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                {genres.map((genre) => genre.name).join(", ") ||
                  "No genres available"}
              </Text>
              <Text
                style={[
                  styles.providers,
                  {
                    color: colors.text,
                    opacity: colors.opacity,
                  },
                ]}
              >
                Providers
              </Text>
              <FlatList
                horizontal
                data={providers}
                renderItem={renderProviderItem}
                keyExtractor={(item) => item.provider_id.toString()}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.text,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    No providers found for this series.
                  </Text>
                }
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </View>

          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => setActiveTab("details")}
              style={[
                styles.tabButton,
                activeTab === "details" && {
                  backgroundColor: colors.secondary,
                },
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
            </Pressable>

            {isAdded && (
              <Pressable
                onPress={() => setActiveTab("review")}
                style={[
                  styles.tabButton,
                  activeTab === "review" && {
                    backgroundColor: colors.secondary,
                  },
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
              </Pressable>
            )}
          </View>

          {activeTab === "details" && (
            <>
              <Text
                style={[
                  styles.label,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Synopsis
              </Text>
              <View
                style={[
                  styles.synopsisContainer,
                  { borderColor: colors.text, color: colors.text },
                ]}
              >
                <Text style={[styles.synopsis, { color: colors.text }]}>
                  {expanded
                    ? tvSeries.overview
                    : `${tvSeries.overview.substring(0, 100)}...`}
                </Text>
                <Pressable onPress={() => setExpanded(!expanded)}>
                  <Text style={[styles.readMore, { color: colors.secondary }]}>
                    {expanded ? "Read Less" : "Read More..."}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.castContainer}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  Cast
                </Text>
                <Pressable
                  onPress={() =>
                    navigation.navigate("FullCastCrew", { cast, showId })
                  }
                >
                  <Text
                    style={[styles.nextScreenText, { color: colors.secondary }]}
                  >
                    Show All
                  </Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={cast.slice(0, 10)} // Show only the first 10-15
                renderItem={renderCastItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.text,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    No cast found.
                  </Text>
                }
                showsHorizontalScrollIndicator={false}
              />

              <Text
                style={[
                  styles.label,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Seasons
              </Text>
              <FlatList
                horizontal
                data={seasons}
                renderItem={renderSeasonItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.text,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    No seasons yet in this series.
                  </Text>
                }
                showsHorizontalScrollIndicator={false}
              />
              <Text
                style={[
                  styles.label,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Details
              </Text>
              <View>
                <View
                  style={[styles.details, { backgroundColor: colors.details }]}
                >
                  <Text style={[styles.detailsTitle, { color: colors.gray }]}>
                    Directed By:
                  </Text>
                  <Text
                    style={[
                      styles.detailsText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    {tvSeries.created_by[0]?.name}
                  </Text>
                </View>
                <View
                  style={[styles.details, { backgroundColor: colors.details }]}
                >
                  <Text style={[styles.detailsTitle, { color: colors.gray }]}>
                    First Air Date:
                  </Text>
                  <Text
                    style={[
                      styles.detailsText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    {tvSeries.first_air_date}
                  </Text>
                </View>
                <View
                  style={[styles.details, { backgroundColor: colors.details }]}
                >
                  <Text style={[styles.detailsTitle, { color: colors.gray }]}>
                    Last Air Date:
                  </Text>
                  <Text
                    style={[
                      styles.detailsText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    {tvSeries.last_air_date}
                  </Text>
                </View>
                {tvSeries.next_episode_to_air ? (
                  <View
                    style={[
                      styles.details,
                      { backgroundColor: colors.details },
                    ]}
                  >
                    <Text style={[styles.detailsTitle, { color: colors.gray }]}>
                      Next Episode to Air:
                    </Text>
                    <Text
                      style={[
                        styles.detailsText,
                        { color: colors.text, opacity: colors.opacity },
                      ]}
                    >
                      {tvSeries.next_episode_to_air.air_date}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={[styles.details, { backgroundColor: colors.details }]}
                >
                  <Text style={[styles.detailsTitle, { color: colors.gray }]}>
                    Status:
                  </Text>
                  <Text
                    style={[
                      styles.detailsText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    {tvSeries.status}
                  </Text>
                </View>
              </View>

              {videos && videos.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  {videos.length === 1 ? (
                    <>
                      <Text
                        style={[
                          styles.label,
                          { color: colors.text, opacity: colors.opacity },
                        ]}
                      >
                        Trailer
                      </Text>
                      <View style={{ alignItems: "center" }}>
                        <YoutubePlayer
                          width={"100%"}
                          height={singleVideoHeight}
                          videoId={videos[0].key}
                          play={false}
                          webViewStyle={{ borderRadius: 10 }}
                        />
                        <Text
                          style={[
                            styles.videoTitle,
                            { color: colors.text, opacity: colors.opacity },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {videos[0].name}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.label,
                          { color: colors.text, opacity: colors.opacity },
                        ]}
                      >
                        Videos
                      </Text>
                      <FlatList
                        horizontal
                        data={videos}
                        renderItem={renderVideoItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                          <Text
                            style={[
                              styles.text,
                              { color: colors.text, opacity: colors.opacity },
                            ]}
                          >
                            No videos available.
                          </Text>
                        }
                        showsHorizontalScrollIndicator={false}
                      />
                    </>
                  )}
                </View>
              )}
            </>
          )}

          {activeTab === "review" && isAdded && (
            <>
              <Text
                style={[
                  styles.label,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Your Progress
              </Text>
              <Text
                style={[
                  styles.textProgress,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Watched Seasons: {watchedSeasons} / {seasons.length}
              </Text>
              <Text
                style={[
                  styles.textProgress,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Watched Episodes: {watchedEpisodesCount}
              </Text>
              <View
                style={[
                  styles.progressBarContainer,
                  { backgroundColor: colors.itemBorder },
                ]}
              >
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${
                        (watchedEpisodesCount / tvSeries.number_of_episodes) *
                        100
                      }%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Your Review
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.details,
                    color: colors.text,
                    borderColor: colors.gray,
                  },
                ]}
                placeholder="Write your review..."
                value={userReview}
                onChangeText={setUserReview}
                placeholderTextColor={"#000"}
              />
              <Text
                style={[
                  styles.label,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                Images
              </Text>
              <View style={styles.photosHeader}>
                <Text
                  style={[
                    styles.photosCount,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  {photos.length} Photos
                </Text>
                <View style={styles.photoButtonsContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.photoButton,
                      {
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: colors.secondary,
                      },
                    ]}
                    onPress={handleTakePhoto}
                  >
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.photoButton,
                      {
                        opacity: pressed ? 0.7 : 1,
                        marginLeft: 10,
                        backgroundColor: colors.secondary,
                      },
                    ]}
                    onPress={handleAddFromGallery}
                  >
                    <Ionicons name="image" size={20} color="white" />
                    <Text style={styles.photoButtonText}>Add from Gallery</Text>
                  </Pressable>
                </View>
              </View>

              {photoLoading ? (
                <View
                  style={[
                    styles.loadingContainer,
                    { backgroundColor: colors.details },
                  ]}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text>Saving photo...</Text>
                </View>
              ) : photos.length > 0 ? (
                <FlatList
                  horizontal
                  data={photos.slice(0, 10)} // Show only the first 10
                  renderItem={renderPhotoItem}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photosList}
                  ListFooterComponent={
                    <Pressable
                      style={[
                        styles.photoItem,
                        styles.viewAllPhotos,
                        {
                          backgroundColor: colors.viewAll,
                          borderColor: colors.gray,
                        },
                      ]}
                      onPress={() =>
                        navigation.navigate("PhotoGallery", {
                          photos,
                          showId,
                          type: "movies",
                          onAddPhoto: handleTakePhoto,
                          onAddFromGallery: handleAddFromGallery,
                          onViewPhoto: (item, index) =>
                            handleViewPhoto(
                              item,
                              index,
                              photos,
                              showId,
                              handleDeletePhoto
                            ),
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.viewAllText,
                          { color: colors.secondary },
                        ]}
                      >
                        View All
                      </Text>
                    </Pressable>
                  }
                />
              ) : (
                <View
                  style={[
                    styles.emptyContainer,
                    { backgroundColor: colors.details },
                  ]}
                >
                  <Ionicons
                    name="images-outline"
                    size={50}
                    color={colors.gray}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    No photos yet
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.gray }]}>
                    Capture your movie experience by taking photos
                  </Text>
                </View>
              )}
              <View style={styles.nextScreenContainer}>
                <Text
                  style={[
                    styles.label,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  Maps
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.mapButton,
                    {
                      opacity: pressed ? 0.5 : 1,
                      backgroundColor: colors.secondary,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate("Map", { showId, type: "movies" })
                  }
                >
                  <Ionicons name="map-sharp" size={20} color="white" />
                  <Text style={styles.mapButtonText}>Open Maps</Text>
                </Pressable>
              </View>

              {location ? (
                <View
                  style={[
                    styles.locationContainer,
                    {
                      backgroundColor: colors.details,
                      shadowColor: colors.text,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.locationTitle,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    📍 Saved Location:
                  </Text>
                  <Text
                    style={[
                      styles.locationText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    Name: {location.name}
                  </Text>
                  <Text
                    style={[
                      styles.locationText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    Address: {location.address}
                  </Text>
                  <Text
                    style={[
                      styles.locationText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    Date Added:{" "}
                    {location.dateAdded?.toDate().toLocaleDateString()}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyContainer,
                    { backgroundColor: colors.details },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={50}
                    color={colors.gray}
                  />
                  <Text
                    style={[
                      styles.emptyText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    No saved location
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.gray }]}>
                    Open Maps to add your location where you watched your show.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View
          style={{
            borderBottomColor: colors.text,
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginBottom: -10,
          }}
        />

        {!isAdded ? (
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
                backgroundColor: colors.button,
              },
              styles.button,
            ]}
            onPress={() => setCategoryVisible(true)}
          >
            <Text style={styles.buttonText}>Add to List</Text>
          </Pressable>
        ) : (
          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  backgroundColor: colors.button,
                },
                styles.button,
              ]}
              onPress={handleSaveTVSeries}
            >
              <Text style={styles.buttonText}>Update Details</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.5 : 1,
                  backgroundColor: colors.button,
                },
                styles.starButton,
              ]}
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
    </>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: 60,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
    padding: 5,
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
  detailsContainer: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "flex-start",
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
    marginTop: 5,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    justifyContent: "center",
  },
  starButton: {
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
    justifyContent: "space-around",
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
    padding: 10,
  },
  providerItem: {
    flex: 1,
    alignItems: "center",
  },
  castItem: {
    width: 100,
    alignItems: "center",
    marginRight: 10,
  },
  castName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
    width: "100%",
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
  castRole: {
    fontSize: 12,
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    backgroundColor: "#9E9E9E",
    borderRadius: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  showAdded: {
    paddingHorizontal: 150,
    width: "100%",
  },
  seasonItem: {
    flex: 1,
    alignItems: "center",
    marginBottom: 5,
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
  providers: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
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
    padding: 10,
    marginBottom: 5,
  },
  detailsTitle: {
    fontSize: 18,
  },
  detailsText: {
    fontSize: 18,
  },
  videoContainer: {
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    alignSelf: "center",
    textAlign: "center",
    flexWrap: "wrap",
    width: 340,
  },
  videoPlayer: {
    borderRadius: 10,
    marginRight: 10,
  },
  nextScreenContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextScreenText: {
    color: "#3F51B5",
    fontWeight: "500",
    marginTop: 5,
    fontSize: 14,
  },
  locationContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  noLocationText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  mapButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  mapButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "500",
  },
  photosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  photosCount: {
    fontSize: 16,
  },
  photoButtonsContainer: {
    flexDirection: "row",
  },
  photoButton: {
    flexDirection: "row",
    backgroundColor: "#3F51B5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#FFFFFF",
    marginLeft: 5,
    fontWeight: "500",
  },
  photosList: {
    padding: 4,
  },
  photoItem: {
    width: 120,
    height: 160,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  photoCaption: {
    fontSize: 12,
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    textAlign: "center",
  },
  viewAllPhotos: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 10,
  },
  progressBar: {
    height: "100%",
  },
});

export default TVSeriesDetailsScreen;
