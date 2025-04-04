import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
  Text,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";

const PhotoGalleryScreen = ({ navigation, route }) => {
  const { photos, onAddPhoto, onViewPhoto, showId, type, onAddFromGallery } =
    route.params;

  const renderPhoto = ({ item, index }) => (
    <Pressable
      style={styles.photoContainer}
      onPress={() => onViewPhoto(item, index)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
    </Pressable>
  );

  return (
    <>
      <View style={styles.upperContainer} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={28} color="black" />
          </Pressable>
          <Text style={styles.galleryTitle}>Photos</Text>
          <View style={styles.headerButtons}>
            <Pressable style={styles.addButton} onPress={onAddPhoto}>
              <Ionicons name="camera-outline" size={24} color="white" />
            </Pressable>
            <Pressable style={styles.addButton} onPress={onAddFromGallery}>
              <Ionicons name="image-outline" size={24} color="white" />
            </Pressable>
          </View>
        </View>
        <View style={styles.divider} />

        {photos && photos.length > 0 ? (
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color="#9E9E9E" />
            <Text style={styles.emptyText}>No photos yet</Text>
            <Text style={styles.emptySubtext}>
              Capture memories from your movie experience
            </Text>
          </View>
        )}
      </View>
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
    paddingHorizontal: 5,
    paddingBottom: 5,
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    borderBottomColor: "#9E9E9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 55,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10, // Add spacing between buttons
  },
  addButton: {
    backgroundColor: "#007BFF",
    borderRadius: 30,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  photoContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 8,
    color: "#888",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#aaa",
    textAlign: "center",
  },
});

export default PhotoGalleryScreen;
