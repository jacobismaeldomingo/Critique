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
import { uploadImageToCloudinary } from "../../services/cloudinary";
import LoadingItem from "../../components/LoadingItem";

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
  const imageHeight = width * (160 / 440);
  const ratingSize = width * 0.05;

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
      <Text style={styles.castName}>{item.name}</Text>
      <Text style={styles.castRole}>{item.character || "Unknown Role"}</Text>
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
      <Text style={styles.videoTitle} numberOfLines={1} ellipsizeMode="tail">
        {item.name}
      </Text>
    </View>
  );

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

  if (!movie) {
    return <LoadingItem />;
  }

  return (
    <>
      <View style={styles.upperContainer} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back-outline" size={28} color="black" />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Movie Details</Text>
          </View>
        </View>
        <View style={styles.divider} />
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
              <Text style={styles.showTitle}>{movie.title}</Text>
              <View style={styles.ratingContainer}>
                <Rating
                  maxRating={5}
                  rating={apiRating}
                  disabled={true} // Viewers rating is read-only
                  size={ratingSize}
                  fillColor="#9575CD"
                  touchColor="#FFFFFF"
                  baseColor="#9E9E9E"
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
            <Pressable
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
            </Pressable>

            {isAdded && (
              <Pressable
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
              </Pressable>
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

              <View style={styles.nextScreenContainer}>
                <Text style={styles.label}>Cast</Text>
                <Pressable
                  onPress={() =>
                    navigation.navigate("FullCastCrew", { cast, showId })
                  }
                >
                  <Text style={styles.nextScreenText}>Show All</Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={cast.slice(0, 10)} // Show only the first 10
                renderItem={renderCastItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text style={styles.text}>No cast found.</Text>
                }
                showsHorizontalScrollIndicator={false}
              />

              <Text style={styles.label}>Details</Text>
              <View>
                <View style={styles.details}>
                  <Text style={styles.detailsTitle}>Release Date:</Text>
                  <Text style={styles.detailsText}>{movie.release_date}</Text>
                </View>
                <View style={styles.details}>
                  <Text style={styles.detailsTitle}>Run Time:</Text>
                  <Text style={styles.detailsText}>
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </Text>
                </View>
                <View style={styles.details}>
                  <Text style={styles.detailsTitle}>Status:</Text>
                  <Text style={styles.detailsText}>{movie.status}</Text>
                </View>
              </View>

              {videos && videos.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  {videos.length === 1 ? (
                    <>
                      <Text style={styles.label}>Trailer</Text>
                      <View style={{ alignItems: "center" }}>
                        <YoutubePlayer
                          width={"100%"}
                          height={singleVideoHeight}
                          videoId={videos[0].key}
                          play={false}
                          webViewStyle={{ borderRadius: 10 }}
                        />
                        <Text
                          style={styles.videoTitle}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {videos[0].name}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.label}>Videos</Text>
                      <FlatList
                        horizontal
                        data={videos}
                        renderItem={renderVideoItem}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={
                          <Text style={styles.text}>No videos available.</Text>
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
              <Text style={styles.label}>Your Review</Text>
              <TextInput
                style={styles.input}
                placeholder="Write your review..."
                value={userReview}
                onChangeText={setUserReview}
                placeholderTextColor={"#000"}
              />
              <Text style={styles.label}>Images</Text>
              <View style={styles.photosHeader}>
                <Text style={styles.photosCount}>{photos.length} Photos</Text>
                <View style={styles.photoButtonsContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.photoButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={handleTakePhoto}
                  >
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.photoButton,
                      { opacity: pressed ? 0.7 : 1, marginLeft: 10 },
                    ]}
                    onPress={handleAddFromGallery}
                  >
                    <Ionicons name="image" size={20} color="white" />
                    <Text style={styles.photoButtonText}>Add from Gallery</Text>
                  </Pressable>
                </View>
              </View>

              {photoLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#7850bf" />
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
                      style={[styles.photoItem, styles.viewAllPhotos]}
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
                      <Text style={styles.viewAllText}>View All</Text>
                    </Pressable>
                  }
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={50} color="#9E9E9E" />
                  <Text style={styles.emptyText}>No photos yet</Text>
                  <Text style={styles.emptySubtext}>
                    Capture your movie experience by taking photos
                  </Text>
                </View>
              )}
              <View style={styles.nextScreenContainer}>
                <Text style={styles.label}>Maps</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.mapButton,
                    {
                      opacity: pressed ? 0.5 : 1,
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
                <View style={styles.locationContainer}>
                  <Text style={styles.locationTitle}>📍 Saved Location:</Text>
                  <Text style={styles.locationText}>Name: {location.name}</Text>
                  <Text style={styles.locationText}>
                    Address: {location.address}
                  </Text>
                  <Text style={styles.locationText}>
                    Date Added:{" "}
                    {location.dateAdded?.toDate().toLocaleDateString()}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={50} color="#9E9E9E" />
                  <Text style={styles.emptyText}>No saved location</Text>
                  <Text style={styles.emptySubtext}>
                    Open Maps to add your location where you watched your show.
                  </Text>
                </View>
              )}
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
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
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
    backgroundColor: "#7850bf",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#000",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
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
    borderBottomColor: "#9E9E9E",
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
    color: "#000",
  },
  synopsis: {
    fontSize: 15,
    color: "#000",
  },
  readMore: {
    color: "#3F51B5",
    marginTop: 5,
  },
  input: {
    backgroundColor: "#F7F7F7",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    borderColor: "#9E9E9E",
    borderWidth: 1,
  },
  button: {
    backgroundColor: "#7850bf",
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    justifyContent: "center",
  },
  starButton: {
    backgroundColor: "#7850bf",
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
    color: "#000",
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
    color: "#9E9E9E",
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
    color: "#000000",
    marginBottom: 2,
    width: "100%",
    numberOfLines: 1,
    ellipsizeMode: "tail",
  },
  castRole: {
    fontSize: 12,
    color: "#9E9E9E",
    textAlign: "center",
    width: "100%",
    numberOfLines: 1,
    ellipsizeMode: "tail",
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
  activeTabButton: {
    backgroundColor: "#3F51B5",
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
    color: "#000000",
  },
  text: {
    margin: 5,
    fontSize: 15,
    color: "#000000",
  },
  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#f7f7f7",
  },
  detailsTitle: {
    color: "#9E9E9E",
    fontSize: 18,
  },
  detailsText: {
    color: "#000000",
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
    color: "#000000",
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
    backgroundColor: "#f7f7f7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
  },
  locationText: {
    fontSize: 16,
    color: "#000000",
    marginBottom: 5,
  },
  noLocationText: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    marginBottom: 20,
  },
  mapButton: {
    flexDirection: "row",
    backgroundColor: "#3F51B5",
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
    color: "#000000",
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
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#9E9E9E",
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#3F51B5",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    marginBottom: 20,
  },
});

export default MovieDetailsScreen;
