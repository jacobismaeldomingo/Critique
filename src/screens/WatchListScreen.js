// WatchListScreen - Contains screens for movies and tv series
import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getSavedShows } from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import { Ionicons } from "react-native-vector-icons";
import SearchModal from "../components/SearchModal";
import { ThemeContext } from "../components/ThemeContext";
import { getTheme } from "../components/theme";

const { width } = Dimensions.get("window"); // Get device width

const posterWidth = width * 0.28; // 30% of screen width
const posterHeight = posterWidth * (16 / 11); // Maintain aspect ratio

// Memoized list item component to prevent unnecessary re-renders
const ShowItem = React.memo(({ item, onPress }) => {
  return (
    <Pressable style={styles.movieItem} onPress={onPress}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={{
          width: posterWidth,
          height: posterHeight,
          borderRadius: 10,
          marginRight: 12,
        }}
      />
    </Pressable>
  );
});

const WatchListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

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

  const handleShowDetails = useCallback(
    (item) => {
      navigation.navigate(
        activeTab === "movies" ? "MovieDetails" : "TVSeriesDetails",
        {
          showId: item.id,
          type: item.media_type,
        }
      );
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
    <>
      <View
        style={[
          styles.upperContainer,
          { backgroundColor: colors.headerBackground },
        ]}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.header,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Watchlist
          </Text>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />
        <View style={{ flexDirection: "row", marginTop: 10, marginBottom: 15 }}>
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
                color: activeTab === "movies" ? colors.secondary : colors.gray,
                fontWeight: activeTab === "movies" ? "bold" : "normal",
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
                color:
                  activeTab === "tvSeries" ? colors.secondary : colors.gray,
                fontWeight: activeTab === "tvSeries" ? "bold" : "normal",
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
            <Ionicons name="search" size={26} color={colors.secondary} />
          </Pressable>
        </View>
        {["Watched", "In Progress", "Plan to Watch"].map((category) => {
          const categoryFilteredShows = (
            activeTab === "movies" ? movies : tvSeries
          )
            .filter((show) => show.category === category)
            .slice(0, 10);

          return (
            <View key={category} style={styles.categoryContainer}>
              <View style={styles.sectionContainer}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  {category}
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.5 : colors.opacity,
                      marginRight: 10,
                    },
                  ]}
                  onPress={() => {
                    let screenName = "";
                    switch (category) {
                      case "Watched":
                        screenName = "WatchedList";
                        break;
                      case "In Progress":
                        screenName = "InProgressList";
                        break;
                      case "Plan to Watch":
                        screenName = "PlanToWatchList";
                        break;
                      default:
                        return;
                    }
                    navigation.navigate(screenName);
                  }}
                >
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={colors.icon}
                  />
                </Pressable>
              </View>
              <FlatList
                horizontal
                data={categoryFilteredShows}
                renderItem={renderShowItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={
                  <Text
                    style={[
                      styles.text,
                      { color: colors.text, opacity: colors.opacity },
                    ]}
                  >
                    You haven't added any shows yet in this category.
                  </Text>
                }
                showsHorizontalScrollIndicator={false}
                initialNumToRender={5} // Render only 5 items initially
                windowSize={5} // Reduce the rendering window size
                maxToRenderPerBatch={5} // Render 5 items at a time
                updateCellsBatchingPeriod={50} // Batch updates every 50ms
              />
            </View>
          );
        })}

        <SearchModal
          isVisible={isSearchVisible}
          onClose={() => setIsSearchVisible(false)}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    padding: 16,
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
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 5,
  },
  movieItem: {
    flex: 1,
    marginTop: 10,
    alignItems: "center",
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
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WatchListScreen;
