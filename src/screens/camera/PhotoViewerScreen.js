import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { firebase_auth } from "../../../firebaseConfig";
import { deletePhoto } from "../../services/firestore";

const { width, height } = Dimensions.get("window");

const PhotoViewerScreen = ({ navigation, route }) => {
  const { photo, index, photos, showId, type } = route.params;
  const [currentIndex, setCurrentIndex] = useState(index);
  const [currentPhotos, setCurrentPhotos] = useState(photos);
  const [onDeletePhoto, setOnDeletePhoto] = useState(null);

  // Set the onDeletePhoto callback when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const handleDeletePhoto = async (photoToDelete) => {
        try {
          await deletePhoto(
            firebase_auth.currentUser.uid,
            showId,
            type,
            photoToDelete
          );

          setCurrentPhotos((prevPhotos) => {
            const updatedPhotos = prevPhotos.filter(
              (p) => p.imageUrl !== photoToDelete.imageUrl
            );

            if (updatedPhotos.length === 0) {
              navigation.goBack();
              return [];
            }

            setCurrentIndex((prevIndex) =>
              prevIndex >= updatedPhotos.length
                ? updatedPhotos.length - 1
                : prevIndex
            );

            return updatedPhotos;
          });

          Alert.alert("Success", "Photo deleted successfully");
        } catch (error) {
          console.error("Error deleting photo:", error);
          Alert.alert("Error", "Failed to delete photo");
        }
      };

      setOnDeletePhoto(() => handleDeletePhoto);
    }, [navigation, showId])
  );

  const handleDelete = () => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (onDeletePhoto) {
            await onDeletePhoto(currentPhotos[currentIndex]);
          }
        },
      },
    ]);
  };

  const navigateToNext = () => {
    if (currentIndex < currentPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentPhoto = currentPhotos[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentPhoto?.imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
        {currentPhoto?.caption && !currentPhoto?.hideCaption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>{currentPhoto.caption}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex <= 0 && styles.disabledButton]}
          onPress={currentIndex > 0 ? navigateToPrevious : null}
          disabled={currentIndex <= 0}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={currentIndex <= 0 ? "gray" : "white"}
          />
        </TouchableOpacity>

        <View style={styles.footerDetails}>
          <Text style={styles.counter}>
            {currentIndex + 1} / {currentPhotos.length}
          </Text>
          {currentPhoto?.timestamp && (
            <Text style={styles.timestamp}>
              {new Date(currentPhoto.timestamp).toLocaleDateString()}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex >= currentPhotos.length - 1 && styles.disabledButton,
          ]}
          onPress={
            currentIndex < currentPhotos.length - 1 ? navigateToNext : null
          }
          disabled={currentIndex >= currentPhotos.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={28}
            color={currentIndex >= currentPhotos.length - 1 ? "gray" : "white"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width,
    height: height * 0.7,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  navButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerDetails: {
    alignItems: "center",
  },
  counter: {
    color: "white",
    fontSize: 16,
  },
  timestamp: {
    color: "#9E9E9E",
    fontSize: 14,
    marginTop: 5,
  },
  captionContainer: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  captionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

export default PhotoViewerScreen;
