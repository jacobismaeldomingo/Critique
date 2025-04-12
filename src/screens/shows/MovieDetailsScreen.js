// screens/MovieDetailsScreen.js
import React, { useEffect, useState, useContext } from "react";
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

  const { width } = Dimensions.get("window"); // Get device width

  const posterWidth = width * 0.3; // 30% of screen width
  const posterHeight = posterWidth * (3 / 2); // Maintain aspect ratio
  const castImageWidth = width * 0.22; // 22% of screen width
  const castImageHeight = castImageWidth * (130 / 90); // Maintain aspect ratio
  const videoWidth = width * 0.8; // 90% of screen width
  const videoHeight = videoWidth * (190 / 350); // Maintain 16:9 aspect ratio
  const singleVideoHeight = width * (9 / 18); // Maintain 18:9 aspect ratio
  const providerSize = width * 0.11;
  const imageHeight = width * (160 / 430);
  const ratingSize = width * 0.05;

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  useEffect(() => {
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
  }, [showId]);

  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

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
        {item.character || "Unknown Role"}
      </Text>
    </Pressable>
  );

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

  if (!movie) {
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
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text
              style={[
                styles.header,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              Movie Details
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
                uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
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
                {movie.title}
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
                    ? movie.overview
                    : `${movie.overview.substring(0, 100)}...`}
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
                data={cast.slice(0, 10)} // Show only the first 10
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
                Details
              </Text>
              <View>
                <View
                  style={[styles.details, { backgroundColor: colors.details }]}
                >
                  <Text style={[styles.detailsTitle, { color: colors.gray }]}>
                    Release Date:
                  </Text>
                  <Text
                    style={[
                      styles.detailsText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    {movie.release_date}
                  </Text>
                </View>
                <View
                  style={[styles.details, { backgroundColor: colors.details }]}
                >
                  <Text style={[styles.detailsTitle, { color: colors.gray }]}>
                    Run Time:
                  </Text>
                  <Text
                    style={[
                      styles.detailsText,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </Text>
                </View>
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
                    {movie.status}
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
                placeholderTextColor={colors.gray}
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
                  <Text style={{ color: colors.text }}>Saving photo...</Text>
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
              onPress={handleSaveMovie}
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
  castContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextScreenContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nextScreenText: {
    fontWeight: "500",
    marginTop: 5,
    fontSize: 14,
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
  photo: {
    width: "100%",
    height: 160,
    borderRadius: 8,
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
});

export default MovieDetailsScreen;
