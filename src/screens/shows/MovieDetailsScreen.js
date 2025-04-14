// screens/shows/MovieDetailsScreen.js
import React, { useState, useContext, useRef, useCallback } from "react";
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
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
} from "react-native";
import { Rating } from "@kolking/react-native-rating";
import {
  fetchMovieCast,
  fetchMovieDetails,
  fetchMoviesProviders,
  fetchMovieVideos,
} from "../../services/tmdb";
import {
  saveToWatchList,
  getMovieData,
  updateShowProgress,
  savePhotoToFirestore,
  getShowPhotos,
  deletePhoto,
} from "../../services/firestore";
import { firebase_auth } from "../../../firebaseConfig";
import CategoryModal from "../../components/CategoryModal";
import RateModal from "../../components/RateModal";
import { Ionicons } from "react-native-vector-icons";
import YoutubePlayer from "react-native-youtube-iframe";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { uploadImageToCloudinary } from "../../services/cloudinary";
import LoadingItem from "../../components/LoadingItem";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const MovieDetailsScreen = ({ route, navigation }) => {
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
  const [videos, setVideos] = useState([]);
  const [location, setLocation] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Measurements
  const posterWidth = width * 0.3;
  const posterHeight = posterWidth * (3 / 2);
  const castImageWidth = width * 0.22;
  const castImageHeight = castImageWidth * (130 / 90);
  const videoWidth = width * 0.8;
  const videoHeight = videoWidth * (190 / 350);
  const singleVideoHeight = width * (9 / 18);
  const providerSize = width * 0.11;
  const imageHeight = width * (160 / 430);
  const ratingSize = width * 0.05;

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);
  const derivedColors = {
    cardBackground: theme === "dark" ? colors.details : colors.viewAll,
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  const tabUnderlineAnim = useRef(new Animated.Value(0)).current;

  // Executes animations on entry and loads movie details
  useFocusEffect(
    useCallback(() => {
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

      // Tab animation
      Animated.spring(tabUnderlineAnim, {
        toValue: activeTab === "details" ? 0 : width * 0.5,
        friction: 6,
        useNativeDriver: true,
      }).start();

      // Load data
      const loadMovieDetails = async () => {
        const movieDetails = await fetchMovieDetails(showId);
        setMovie(movieDetails);
        setApiRating((Number(movieDetails.vote_average) / 2).toFixed(2)); // Convert /10 to /5
        setGenres(movieDetails.genres);

        const loadProviders = async () => {
          const providersDetails = await fetchMoviesProviders(showId);
          setProviders(providersDetails);
        };

        const loadCast = async () => {
          const castDetails = await fetchMovieCast(showId);
          setCast(castDetails);
        };

        const loadVideos = async () => {
          const videoDetails = await fetchMovieVideos(showId);
          setVideos(videoDetails);
        };

        const loadPhotos = async () => {
          try {
            const userId = firebase_auth.currentUser.uid;
            const photos = await getShowPhotos(userId, showId, "movies");
            setPhotos(photos);
          } catch (error) {
            console.error("Error loading photos:", error);
            Alert.alert("Error", "Failed to load photos");
          }
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
            setLocation(savedData.location);
            setPhotos(savedData.photos || []);
            setIsAdded(true);
          }
        }

        loadProviders();
        loadCast();
        loadVideos();
        loadPhotos();
      };

      loadMovieDetails();
    }, [showId, activeTab])
  );

  // Animation for button presses
  const animatePress = (animation) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Generates a unique ID using the current timestamp and a random string.
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Saves or updates the movie details to the watchlist. If the movie is already added,
  // it updates the progress; otherwise, it adds the movie to the list.
  const handleSaveMovie = async () => {
    if (!category) {
      Alert.alert("Please select a category first before adding to list.");
      return;
    }

    if (firebase_auth.currentUser) {
      const userId = firebase_auth.currentUser.uid;
      const data = { category, rating: userRating, review: userReview };

      if (isAdded) {
        await updateShowProgress(userId, showId, "movies", data);
        Alert.alert(`${movie.title} series details updated successfully!`);
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
        Alert.alert(`${movie.title} added to watchlist!`);
      }
    } else {
      Alert.alert("Please log in to save movies.");
    }
  };

  /**
   * Renders a single provider item with an animated press effect, showing the provider's logo.
   * @param {object} item - Show object containing information of provider's data
   */
  const renderProviderItem = ({ item }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          onPressIn={() => animatePress(animation)}
          style={styles.providerItem}
        >
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
      </Animated.View>
    );
  };

  /**
   * Renders a single cast member’s profile with an animated press effect, showing their profile image, name, and role.
   * @param {object} item - Show object containing information of cast
   */
  const renderCastItem = ({ item }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          onPressIn={() => animatePress(animation)}
          style={[styles.castItem, { width: castImageWidth }]}
        >
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w200${item.profile_path}`,
            }}
            style={{
              width: castImageWidth,
              height: castImageHeight,
              borderRadius: 8,
              marginBottom: 5,
            }}
          />
          <Text style={[styles.castName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.castRole, { color: colors.gray }]}>
            {item.character || "Unknown Role"}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  /**
   * Renders a video item with an animated press effect, displaying a YouTube player for the video.
   * @param {object} item - Show object containing information of video data
   */
  const renderVideoItem = ({ item }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          onPressIn={() => animatePress(animation)}
          style={styles.videoContainer}
        >
          <View style={styles.videoWrapper}>
            <YoutubePlayer
              width={videoWidth}
              height={videoHeight}
              videoId={item.key}
              play={false}
            />
          </View>
          <Text
            style={[styles.videoTitle, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  /**
   * Uploads the taken photo to Cloudinary, saves metadata to Firestore, and adds the photo to the local state and device gallery.
   * @param {string} photoUri - URI of the taken photo
   * @returns
   */
  const onPhotoTaken = async (photoUri) => {
    try {
      setPhotoLoading(true);

      // Upload to Cloudinary
      const { secure_url, public_id } = await uploadImageToCloudinary(photoUri);

      if (!secure_url) {
        Alert.alert("Error", "Failed to upload image to Cloudinary.");
        setPhotoLoading(false);
        return;
      }

      // Generate a unique ID for the photo
      const photoId = generateId();

      // Save the photo metadata in Firestore
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

      // Save to device gallery if user granted permission
      await MediaLibrary.saveToLibraryAsync(photoUri);

      Alert.alert("Success", "Photo saved successfully!");
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to save photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  // Requests camera permissions, takes a photo, and then processes the photo by uploading it and saving it to Firestore.
  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take photos."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const photoUri = result.assets[0].uri;

        // Continue with your logic like uploading the image
        await onPhotoTaken(photoUri);
      }
    } catch (error) {
      console.error("Error using camera:", error);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  /**
   * Navigates to a photo viewer screen with the selected photo and its metadata.
   * @param {object} photo - photo data
   * @param {number} index - index of the photo
   * @param {array} photos - array of all photos
   * @param {string} showId - ID of the show
   */
  const handleViewPhoto = (photo, index, photos, showId) => {
    navigation.navigate("PhotoViewer", {
      photo,
      index,
      photos,
      showId,
      type: "movies",
    });
  };

  /**
   * Updates the caption of the given photo and updates the saved data in Firestore.
   * @param {string} photoId - ID of the photo
   * @param {string} caption - new caption string
   */
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

  // Requests permission to access the photo library, selects a photo, uploads it to Cloudinary, and saves its metadata to Firestore.
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

  /**
   * Deletes the specified photo from Firestore and updates the local state by removing the photo.
   * @param {object} photoToDelete - photo data to be deleted
   */
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

  /**
   * Renders a single photo item with an animated press effect, allowing the user to view the photo, edit its caption, or delete it.
   * @param {object} item - photo data
   * @param {number} index - index of the photo
   */
  const renderPhotoItem = ({ item, index }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          onPressIn={() => animatePress(animation)}
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
                        onPress: (caption) =>
                          handleEditCaption(item.id, caption),
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
      </Animated.View>
    );
  };

  // If there is no movie, render the loading component
  if (!movie) {
    return <LoadingItem />;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header - Consistent with other screens */}
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
          Movie Details
        </Text>
        <View style={{ width: 28 }} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.movieHeader}>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              }}
              style={{
                width: posterWidth,
                height: posterHeight,
                borderRadius: 12,
                marginRight: 16,
              }}
            />
            <View style={styles.movieInfo}>
              <Text style={[styles.movieTitle, { color: colors.text }]}>
                {movie.title}
              </Text>
              <View style={styles.ratingContainer}>
                <Rating
                  maxRating={5}
                  rating={apiRating}
                  disabled={true}
                  size={ratingSize}
                  fillColor={colors.primary}
                  baseColor={colors.gray}
                />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {apiRating} / 5
                </Text>
              </View>
              <Text style={[styles.genreText, { color: colors.text }]}>
                {genres.map((g) => g.name).join(", ")}
              </Text>
              <Text style={[styles.providers, { color: colors.text }]}>
                Where to Watch
              </Text>
              <FlatList
                horizontal
                data={providers}
                renderItem={renderProviderItem}
                keyExtractor={(item) => item.provider_id.toString()}
                contentContainerStyle={styles.providersList}
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.text,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    No providers found for this movie.
                  </Text>
                }
              />
            </View>
          </View>

          <View style={styles.tabContainer}>
            <Pressable
              onPress={() => setActiveTab("details")}
              style={[
                styles.tabButton,
                activeTab === "details" && {
                  borderBottomColor: colors.secondary,
                  borderBottomWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.text },
                  activeTab === "details" &&
                    styles.activeTabText && {
                      color: colors.secondary,
                    },
                  ,
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
                    borderBottomColor: colors.secondary,
                    borderBottomWidth: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: colors.text },
                    activeTab === "review" &&
                      styles.activeTabText && {
                        color: colors.secondary,
                      },
                  ]}
                >
                  Review
                </Text>
              </Pressable>
            )}
          </View>

          {activeTab === "details" ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Synopsis
              </Text>
              <Pressable onPress={() => setExpanded(!expanded)}>
                <Text style={[styles.synopsis, { color: colors.text }]}>
                  {expanded
                    ? movie.overview
                    : `${movie.overview.substring(0, 150)}...`}
                </Text>
                <Text style={[styles.readMore, { color: colors.primary }]}>
                  {expanded ? "Read Less" : "Read More"}
                </Text>
              </Pressable>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Cast
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("FullCastCrew", { cast })}
                >
                  <Text style={[styles.viewAll, { color: colors.primary }]}>
                    View All
                  </Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={cast.slice(0, 10)}
                renderItem={renderCastItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.castList}
                showsHorizontalScrollIndicator={false}
              />

              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Details
              </Text>
              <View
                style={[
                  styles.detailsCard,
                  { backgroundColor: derivedColors.cardBackground },
                ]}
              >
                <View
                  style={[styles.detailRow, { borderBottomColor: colors.gray }]}
                >
                  <Text style={[styles.detailLabel, { color: colors.gray }]}>
                    Release Date:
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {movie.release_date}
                  </Text>
                </View>
                <View
                  style={[styles.detailRow, { borderBottomColor: colors.gray }]}
                >
                  <Text style={[styles.detailLabel, { color: colors.gray }]}>
                    Runtime:
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </Text>
                </View>
                <View
                  style={[styles.detailRow, { borderBottomColor: colors.gray }]}
                >
                  <Text style={[styles.detailLabel, { color: colors.gray }]}>
                    Status:
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {movie.status}
                  </Text>
                </View>
              </View>

              {videos.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {videos.length === 1 ? "Trailer" : "Videos"}
                  </Text>
                  {videos.length === 1 ? (
                    <View style={styles.videoContainer}>
                      <View style={styles.singleVideoWrapper}>
                        <YoutubePlayer
                          width={"100%"}
                          height={singleVideoHeight}
                          videoId={videos[0].key}
                          play={false}
                        />
                      </View>
                      <Text
                        style={[styles.videoTitle, { color: colors.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {videos[0].name}
                      </Text>
                    </View>
                  ) : (
                    <FlatList
                      horizontal
                      data={videos}
                      renderItem={renderVideoItem}
                      keyExtractor={(item) => item.id.toString()}
                      showsHorizontalScrollIndicator={false}
                    />
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Your Review
              </Text>
              <TextInput
                style={[
                  styles.reviewInput,
                  {
                    backgroundColor: derivedColors.cardBackground,
                    color: colors.text,
                    borderColor: colors.gray,
                  },
                ]}
                placeholder="Write your review..."
                placeholderTextColor={colors.gray}
                value={userReview}
                onChangeText={setUserReview}
                multiline
              />

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Photos ({photos.length})
                </Text>
                <View style={styles.photoActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.photoButton,
                      {
                        backgroundColor: colors.secondary,
                        opacity: pressed ? 0.6 : 1,
                      },
                    ]}
                    onPress={handleTakePhoto}
                  >
                    <Ionicons name="camera" size={18} color="#fff" />
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.photoButton,
                      {
                        backgroundColor: colors.secondary,
                        opacity: pressed ? 0.6 : 1,
                        marginLeft: 10,
                      },
                    ]}
                    onPress={handleAddFromGallery}
                  >
                    <Ionicons name="image" size={18} color="#fff" />
                    <Text style={styles.photoButtonText}>Add from Gallery</Text>
                  </Pressable>
                </View>
              </View>

              {photoLoading ? (
                <View
                  style={[
                    styles.loadingPhotos,
                    { backgroundColor: colors.details },
                  ]}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Saving photo...
                  </Text>
                </View>
              ) : photos.length > 0 ? (
                <FlatList
                  horizontal
                  data={photos.slice(0, 10)}
                  renderItem={renderPhotoItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.photosList}
                  showsHorizontalScrollIndicator={false}
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
                          photos: photos,
                          showId: showId,
                          type: "movies",
                          onAddPhoto: handleTakePhoto,
                          onAddFromGallery: handleAddFromGallery,
                          onViewPhoto: (item, index) =>
                            handleViewPhoto(item, index, photos, showId),
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

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Location
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
        </Animated.View>
      </ScrollView>

      <Animated.View
        style={[
          styles.actionButtons,
          {
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        {!isAdded ? (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
            onPress={() => setCategoryVisible(true)}
          >
            <Text style={styles.primaryButtonText}>Add to Watchlist</Text>
          </Pressable>
        ) : (
          <View style={styles.buttonGroup}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              onPress={handleSaveMovie}
            >
              <Text style={[styles.secondaryButtonText]}>Save Changes</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.ratingButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              onPress={() => setRateVisible(true)}
            >
              <Ionicons name="star" size={20} color="#fff" />
            </Pressable>
          </View>
        )}
      </Animated.View>

      {/* Modals */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  movieHeader: {
    flexDirection: "row",
    marginTop: 20,
  },
  movieInfo: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 8,
  },
  genreText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  providers: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: "500",
  },
  providersList: {
    paddingBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 18,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  synopsis: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  readMore: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 20,
  },
  castList: {
    paddingBottom: 16,
  },
  castItem: {
    alignItems: "center",
    marginRight: 10,
  },
  castName: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 4,
  },
  castRole: {
    fontSize: 12,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 18,
    paddingBottom: 8,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "500",
  },
  videoContainer: {
    marginBottom: 16,
  },
  videoWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 10,
  },
  singleVideoWrapper: {
    borderRadius: 12,
    overflow: "hidden",
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
  videosList: {
    paddingBottom: 16,
  },
  text: {
    margin: 5,
    fontSize: 15,
  },
  reviewInput: {
    minHeight: 75,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  photoActions: {
    flexDirection: "row",
  },
  photoButton: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
  },
  loadingPhotos: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  photoItem: {
    width: 130,
    height: 160,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  photosList: {
    paddingBottom: 16,
  },
  photoCaption: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: 12,
    padding: 4,
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
  emptyPhotos: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginBottom: 20,
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
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ccc",
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MovieDetailsScreen;
