import React, { useContext } from "react";
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
  Text,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const PhotoGalleryScreen = ({ navigation, route }) => {
  const { photos, showId, type, onAddPhoto, onAddFromGallery, onViewPhoto } =
    route.params;

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  const renderPhoto = ({ item, index }) => (
    <Pressable
      style={styles.photoContainer}
      onPress={() => onViewPhoto(item, index)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={[
          styles.upperContainer,
          { backgroundColor: colors.headerBackground },
        ]}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons
              name="chevron-back-outline"
              size={28}
              color={colors.icon}
              opacity={colors.opacity}
            />
          </Pressable>
          <Text
            style={[
              styles.galleryTitle,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Photos
          </Text>
          <View style={styles.headerButtons}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.camera,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              onPress={onAddPhoto}
            >
              <Ionicons name="camera-outline" size={24} color="white" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.camera,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              onPress={onAddFromGallery}
            >
              <Ionicons name="image-outline" size={24} color="white" />
            </Pressable>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />

        {photos && photos.length > 0 ? (
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View
            style={[styles.emptyState, { backgroundColor: colors.viewAll }]}
          >
            <Ionicons name="images-outline" size={48} color="#9E9E9E" />
            <Text
              style={[
                styles.emptyText,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              No photos yet
            </Text>
            <Text
              style={[
                styles.emptySubtext,
                { color: colors.subtitle, opacity: colors.opacity },
              ]}
            >
              Capture memories from your movie experience
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: Platform.select({
      ios: 60,
      android: 20,
    }),
  },
  container: {
    flex: 1,
    padding: 16,
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
  button: {
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
    borderRadius: 8,
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default PhotoGalleryScreen;
