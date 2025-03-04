// components/SearchModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Modal,
} from "react-native";
import { searchMovies, searchTVSeries } from "../services/tmdb";
import { useNavigation } from "@react-navigation/native";

const SearchModal = ({ isVisible, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigation = useNavigation();

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 1) {
      // Fetch movies and TV series based on the query
      const movies = await searchMovies(text);
      const tvSeries = await searchTVSeries(text);
      const combinedResults = [
        ...movies.map((item) => ({ ...item, type: "movies" })),
        ...tvSeries.map((item) => ({ ...item, type: "tvSeries" })),
      ];
      setResults(combinedResults);
    } else {
      setResults([]);
    }
  };

  const handleNavigateToDetails = (item) => {
    onClose();
    if (item.type === "movies") {
      navigation.navigate("MovieDetails", {
        showId: item.id,
        type: "movies",
      });
    } else {
      navigation.navigate("TVSeriesDetails", {
        showId: item.id,
        type: "tvSeries",
      });
    }
  };

  const renderResultItem = ({ item }) => (
    <Pressable
      style={styles.resultItem}
      onPress={() => handleNavigateToDetails(item)}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
        style={styles.poster}
      />
      <View style={styles.details}>
        <Text style={styles.title}>{item.title || item.name}</Text>
        <Text style={styles.subtitle}>
          {item.type === "movies" ? "Movie" : "TV Series"} | Rating:{" "}
          {(item.vote_average / 2).toFixed(1)}/5
        </Text>
        <Text style={styles.subtitle}>Genre: {item.genre_ids.join(", ")}</Text>
      </View>
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
          <TextInput
            style={styles.searchInput}
            placeholder="Search for movies or TV series..."
            value={query}
            onChangeText={handleSearch}
          />
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {query.length > 2
                  ? "No results found."
                  : "Start typing to search."}
              </Text>
            }
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          />
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
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
  searchInput: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
    paddingRight: 10,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "wrap",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default SearchModal;
