// screens/camera/PhotoGalleryScreen.js
import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  FlatList,
  Text,
  Animated,
  SafeAreaView,
  Easing,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const PhotoGalleryScreen = ({ navigation, route }) => {
  const { photos, showId, type, onAddPhoto, onAddFromGallery, onViewPhoto } =
    route.params;

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const statsScale = useRef(new Animated.Value(0.8)).current;

  // Start animations when component mounts
  useEffect(() => {
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
      Animated.spring(statsScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Renders a single photo thumbnail and handles photo view navigation on press
  const renderPhoto = ({ item, index }) => (
    <Pressable
      style={styles.photoContainer}
      onPress={() => onViewPhoto(item, index)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
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

        <Text style={[styles.headerTitle, { color: "#fff" }]}>Photos</Text>
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
      </Animated.View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
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
    marginLeft: 50,
  },
  content: {
    flex: 1,
    padding: 16,
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
