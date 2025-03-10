// WatchListScreen - Contains screens for movies and tv series
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getSavedShows } from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";
import SearchModal from "../components/SearchModal";

// Memoized list item component to prevent unnecessary re-renders
const ShowItem = React.memo(({ item, onPress }) => {
  return (
    <Pressable style={styles.movieItem} onPress={onPress}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={styles.moviePoster}
      />
    </Pressable>
  );
});

const WatchListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadSavedShows = async () => {
        if (firebase_auth.currentUser) {
          const savedMovies = await getSavedShows(
            firebase_auth.currentUser.uid,
            "movies"
          );
          setMovies(savedMovies);
          const savedSeries = await getSavedShows(
            firebase_auth.currentUser.uid,
            "tvSeries"
          );
          setTVSeries(savedSeries);
        }
      };
      loadSavedShows();
    }, [])
  );

  const categorizedShows = useMemo(
    () => (shows, category) =>
      shows.filter((show) => show.category === category),
    []
  );

  const handleShowDetails = useCallback(
    (item) => {
      if (activeTab === "movies") {
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
    },
    [activeTab, navigation]
  );

  const renderShowItem = useCallback(
    ({ item }) => (
      <ShowItem item={item} onPress={() => handleShowDetails(item)} />
    ),
    [handleShowDetails]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Watchlist</Text>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 5,
        }}
      />
      <View style={{ flexDirection: "row", marginVertical: 10 }}>
        <Pressable
          onPress={() => setActiveTab("movies")}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
              marginHorizontal: 10,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 20,
              color: activeTab === "movies" ? "blue" : "gray",
            }}
          >
            Movies
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("tvSeries")}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
              marginHorizontal: 10,
            },
          ]}
        >
          <Text
            style={{
              fontSize: 20,
              color: activeTab === "tvSeries" ? "blue" : "gray",
            }}
          >
            TV Series
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setIsSearchVisible(true)}
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
              marginLeft: "auto",
              marginRight: 10,
            },
          ]}
        >
          <Ionicons name="search" size={26} color="black" />
        </Pressable>
      </View>
      {["Watched", "In Progress", "Plan to Watch"].map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>{category}</Text>
          <FlatList
            horizontal
            data={categorizedShows(
              activeTab === "movies" ? movies : tvSeries,
              category
            )}
            renderItem={renderShowItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <Text style={styles.text}>No shows yet in this category.</Text>
            }
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5} // Render only 5 items initially
            windowSize={5} // Reduce the rendering window size
            maxToRenderPerBatch={5} // Render 5 items at a time
            updateCellsBatchingPeriod={50} // Batch updates every 50ms
          />
        </View>
      ))}

      <SearchModal
        isVisible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 5,
    marginBottom: 5,
    justifyContent: "center",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  movieItem: {
    flex: 1,
    marginTop: 10,
    alignItems: "center",
  },
  moviePoster: {
    width: 110,
    height: 160,
    borderRadius: 10,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    padding: 10,
    fontWeight: "500",
  },
  categoryContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WatchListScreen;
