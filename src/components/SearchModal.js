// components/SearchModal.js
import React, { useState, useEffect, useContext } from "react";
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
import { ThemeContext } from "../components/ThemeContext";
import { getTheme } from "../components/theme";

const SearchModal = ({ isVisible, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const navigation = useNavigation();

  // Measurements
  const { width } = Dimensions.get("window");
  const posterWidth = width * 0.2;
  const posterHeight = posterWidth * (3 / 2);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Clears the search input and results
  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  /**
   * Handles searching for movies and TV series based on input text
   * @param {string} text - The search query entered by the user
   */
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

  /**
   * Navigates to the details screen for the selected item (movie or TV series)
   * @param {object} item - The selected search result item
   */
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

  // Loads genre list when the component mounts
  useEffect(() => {
    const getGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };

    getGenres();
  }, []);

  // Closes the search modal and resets query and results
  const handleClose = async () => {
    setQuery("");
    setResults([]);
    onClose();
  };

  /**
   * Renders each individual result item in the search list
   * @param {object} item - The search result item to display
   */
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
        <Text
          style={[
            styles.title,
            { color: colors.text, opacity: colors.opacity },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.title || item.name}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.subtitle, opacity: colors.opacity },
          ]}
        >
          {item.type === "movies" ? "Movie" : "TV Series"} | Rating:{" "}
          {(item.vote_average / 2).toFixed(1)}/5
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.subtitle, opacity: colors.opacity },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
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
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={[styles.inputContainer, { borderColor: colors.gray }]}>
            <TextInput
              style={[
                styles.searchInput,
                { color: colors.text, opacity: colors.opacity },
              ]}
              placeholder="Search for movies or TV series..."
              value={query}
              onChangeText={handleSearch}
              placeholderTextColor={colors.gray}
            />
            {query.length > 0 && (
              <Pressable onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={colors.close} />
              </Pressable>
            )}
          </View>
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text
                style={[
                  styles.emptyText,
                  { color: colors.subtitle, opacity: colors.opacity },
                ]}
              >
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
                backgroundColor: colors.button,
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
    flexWrap: "wrap",
    marginBottom: 2,
    flexShrink: 1,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
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
