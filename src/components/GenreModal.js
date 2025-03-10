import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { firebase_auth, db } from "../../firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GenreModal = ({ isVisible, onClose }) => {
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    const loadGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };
    loadGenres();
  }, []);

  // Select Genres
  const toggleGenreSelection = (id) => {
    console.log(id);
    setSelectedGenres((prevGenres) =>
      prevGenres.includes(id)
        ? prevGenres.filter((g) => g !== id)
        : [...prevGenres, id]
    );
  };

  // Handle save preferences
  const handleSavePreferences = async () => {
    console.log("Saving Preferences");
    const user = firebase_auth.currentUser;
    if (!user) return;

    await setDoc(
      doc(db, "users", user.uid),
      { preferredGenres: selectedGenres },
      { merge: true }
    );

    await AsyncStorage.setItem(
      "preferredGenres",
      JSON.stringify(selectedGenres)
    );
    Alert.alert("Your preferences are saved!");
    onClose();
  };

  const renderGenreOption = ({ item }) => (
    <Pressable
      style={[
        styles.genreButton,
        {
          backgroundColor: selectedGenres.includes(item.id)
            ? item.color
            : "#ccc",
        },
      ]}
      onPress={() => toggleGenreSelection(item.id)}
    >
      <Text style={styles.genreText}>{item.name}</Text>
    </Pressable>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.sectionTitle}>Select Your Favorite Genres:</Text>
          <FlatList
            numColumns={3}
            data={genres}
            renderItem={renderGenreOption}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.button,
            ]}
            onPress={handleSavePreferences}
          >
            <Text style={styles.buttonText}>Save Preferences</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.button,
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  genreButton: {
    margin: 5,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    maxWidth: "30%",
    height: 50,
  },
  genreText: {
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default GenreModal;
