import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { firebase_auth, db } from "../../firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../components/ThemeContext";
import { getTheme } from "../components/theme";
import { MaterialIcons } from "react-native-vector-icons";

const { width } = Dimensions.get("window");

const GenreModal = ({ isVisible, onClose, onSave }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  const derivedColors = {
    cardBackground: theme === "dark" ? colors.details : colors.viewAll,
  };

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
    }
  }, [isVisible]);

  useEffect(() => {
    const loadGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };
    loadGenres();
  }, []);

  // Select Genres
  const toggleGenreSelection = (id) => {
    setSelectedGenres((prevGenres) =>
      prevGenres.includes(id)
        ? prevGenres.filter((g) => g !== id)
        : [...prevGenres, id]
    );
  };

  // Handle save preferences
  const handleSavePreferences = async () => {
    console.log("Saving Preferences...");
    const user = firebase_auth.currentUser;
    if (!user) return;

    try {
      await setDoc(
        doc(db, "users", user.uid),
        { preferredGenres: selectedGenres },
        { merge: true }
      );

      await AsyncStorage.setItem(
        "preferredGenres",
        JSON.stringify(selectedGenres)
      );

      if (onSave) {
        onSave(selectedGenres); // Notify parent of the update
      }

      Alert.alert("Your preferences are saved!");
      onClose();
    } catch (error) {
      console.error("Error saving genres:", error);
      Alert.alert("Error", "Failed to save preferences");
    }
  };

  const renderGenreOption = ({ item }) => {
    const isSelected = selectedGenres.includes(item.id);
    const animation = new Animated.Value(1);

    return (
      <Animated.View style={{ transform: [{ scale: animation }] }}>
        <Pressable
          style={[
            styles.genreButton,
            {
              backgroundColor: isSelected ? item.color : colors.cardBackground,
              borderColor: isSelected ? item.color : colors.gray,
            },
          ]}
          onPress={() => toggleGenreSelection(item.id)}
          onPressIn={() => {
            Animated.spring(animation, {
              toValue: 0.95,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(animation, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }}
        >
          <Text
            style={[
              styles.genreText,
              { color: isSelected ? "#fff" : colors.text },
            ]}
          >
            {item.name}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const handleClose = () => {
    setSelectedGenres([]);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Select Favorite Genres
            </Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <Text style={[styles.subtitle, { color: colors.subtitle }]}>
            Choose at least 3 genres
          </Text>

          <FlatList
            data={genres}
            renderItem={renderGenreOption}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={styles.genreRow}
            contentContainerStyle={styles.genreList}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: derivedColors.cardBackground,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              onPress={onClose}
            >
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
              onPress={handleSavePreferences}
              disabled={selectedGenres.length < 3}
            >
              <Text style={styles.primaryButtonText}>
                Save ({selectedGenres.length})
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: "80%",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  genreList: {
    paddingBottom: 20,
  },
  genreRow: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  genreButton: {
    width: width * 0.26,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  genreText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  secondaryButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default GenreModal;
