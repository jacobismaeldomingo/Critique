// components/SearchModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Modal,
  Dimensions,
} from "react-native";
import { searchMovies, searchTVSeries } from "../services/tmdb";
import { useNavigation } from "@react-navigation/native";
import { fetchGenres } from "../services/tmdb";
import { Ionicons } from "react-native-vector-icons";

const SearchModal = ({ isVisible, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const navigation = useNavigation();

  const { width } = Dimensions.get("window"); // Get screen width

  const posterWidth = width * 0.2; // 20% of screen width
  const posterHeight = posterWidth * (3 / 2); // Maintain 2:3 aspect ratio (similar to 80x120)

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

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
    navigation.navigate(
      item.type === "movies" ? "MovieDetails" : "TVSeriesDetails",
      {
        showId: item.id,
        type: item.type,
      }
    );
  };

  useEffect(() => {
    const getGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };

    getGenres();
  }, []);

  const handleClose = async () => {
    setQuery("");
    setResults([]);
    onClose();
  };

  const renderResultItem = ({ item }) => (
    <Pressable
      style={styles.resultItem}
      onPress={() => handleNavigateToDetails(item)}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }}
        style={{
          width: posterWidth,
          height: posterHeight,
          borderRadius: 8,
          marginRight: 16,
        }}
      />
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {item.title || item.name}
        </Text>
        <Text style={styles.subtitle}>
          {item.type === "movies" ? "Movie" : "TV Series"} | Rating:{" "}
          {(item.vote_average / 2).toFixed(1)}/5
        </Text>
        <Text style={styles.subtitle} numberOfLines={2} ellipsizeMode="tail">
          Genre:{" "}
          {genres
            .filter((genre) => item.genre_ids.includes(genre.id))
            .map((genre) => genre.name)
            .join(", ")}
        </Text>
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
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for movies or TV series..."
              value={query}
              onChangeText={handleSearch}
            />
            {query.length > 0 && (
              <Pressable onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#888" />
              </Pressable>
            )}
          </View>
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
            contentContainerStyle={styles.flatListContentContainer}
          />
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.closeButton,
            ]}
            onPress={handleClose}
          >
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#9E9E9E",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  details: {
    flexShrink: 1, // Allow the details to shrink if needed
    width: "70%",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    flexWrap: "wrap",
    marginBottom: 5,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    flexWrap: "wrap",
    marginBottom: 2,
    flexShrink: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#7850bf",
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
