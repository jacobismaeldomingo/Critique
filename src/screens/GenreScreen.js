import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
} from "react-native";
import { fetchMoviesByGenres, fetchTVSeriesByGenres } from "../services/tmdb";
import { Ionicons } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";

const GenreScreen = ({ route }) => {
  const { genreId, genreName } = route.params;
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("movies");
  const navigation = useNavigation();

  useEffect(() => {
    const getMovies = async () => {
      const genreMovies = await fetchMoviesByGenres(genreId);
      setMovies(genreMovies);
    };
    const getTVSeries = async () => {
      const genreTVSeries = await fetchTVSeriesByGenres(genreId);
      setTVSeries(genreTVSeries);
    };
    getMovies();
    getTVSeries();
  }, [genreId]);

  const handleShowDetails = async (item) => {
    if (item.media_type === "movies") {
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

  const renderShowItem = ({ item }) => (
    <Pressable style={styles.showItem} onPress={() => handleShowDetails(item)}>
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        }}
        style={styles.showPoster}
      />
      {/* <Text style={styles.movieTitle}>{item.title}</Text> */}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back-outline"
            size={28}
            color="black"
            style={{ marginRight: 45 }}
          />
        </Pressable>
        <Text style={styles.header}>{genreName} Genre</Text>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 15,
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
      <FlatList
        numColumns={3}
        data={activeTab === "movies" ? movies : tvSeries}
        renderItem={renderShowItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.text}>No shows are in this genre.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 50,
  },
  headerContainer: {
    padding: 5,
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginRight: 150,
    marginLeft: 45,
    fontWeight: "bold",
  },
  genreButton: {
    padding: 10,
    margin: 5,
    borderRadius: 20,
    alignItems: "center",
  },
  genreText: {
    color: "#fff",
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 10,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  showItem: {
    marginTop: 10,
  },
  showPoster: {
    width: 120,
    height: 180,
    marginRight: 5,
    marginVertical: 5,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    padding: 10,
    fontWeight: "500",
  },
});

export default GenreScreen;
