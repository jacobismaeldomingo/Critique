// screens/WatchListScreen.js
import React, {
  useState,
  useCallback,
  useContext,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getSavedShows } from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import { Ionicons, MaterialIcons } from "react-native-vector-icons";
import SearchModal from "../components/SearchModal";
import { ThemeContext } from "../components/ThemeContext";
import { getTheme } from "../components/theme";

// Measurements
const { width } = Dimensions.get("window");
const posterWidth = width * 0.28;
const posterHeight = posterWidth * (16 / 11);
const tabButtonWidth = width * 0.4;

// Memoized list item component to prevent unnecessary re-renders
const ShowItem = React.memo(({ item, onPress, animation }) => {
  return (
    <Animated.View style={{ transform: [{ scale: animation }] }}>
      <Pressable
        style={styles.movieItem}
        onPress={onPress}
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
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
          style={styles.posterImage}
        />
      </Pressable>
    </Animated.View>
  );
});

const WatchListScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [tvSeries, setTVSeries] = useState([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;

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
    ]).start();
  }, []);

  // Loads saved movies and TV series when the component comes into focus.
  useFocusEffect(
    useCallback(() => {
      const loadSavedShows = async () => {
        const user = firebase_auth.currentUser;
        if (!user) return;

        try {
          const [savedMovies, savedSeries] = await Promise.all([
            getSavedShows(user.uid, "movies"),
            getSavedShows(user.uid, "tvSeries"),
          ]);

          setMovies(savedMovies);
          setTVSeries(savedSeries);
        } catch (error) {
          console.error("Failed to load saved shows:", error);
        }
      };

      loadSavedShows();
    }, [])
  );

  /**
   * Navigates to the details page of a show (either Movie or TV Series) based on the media type.
   * @param {object} item - Show object containing media type and show ID.
   */
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

  /**
   * Renders an individual show item as a pressable component with a poster image.
   * @param {object} item - Show object containing information of a movie/series.
   */
  const renderShowItem = useCallback(
    ({ item }) => {
      const animation = new Animated.Value(1);
      return (
        <ShowItem
          item={item}
          onPress={() => handleShowDetails(item)}
          animation={animation}
        />
      );
    },
    [handleShowDetails]
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
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          My Watchlist
        </Text>
        <Pressable
          onPress={() => setIsSearchVisible(true)}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </Pressable>
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <View style={styles.tabContainer}>
          <Pressable
            onPress={() => setActiveTab("movies")}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.tabButton,
            ]}
          >
            <Text
              style={[
                {
                  color:
                    activeTab === "movies" ? colors.secondary : colors.gray,
                  fontWeight: activeTab === "movies" ? "bold" : "600",
                },
                styles.tabText,
              ]}
            >
              Movies
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("tvSeries")}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
              styles.tabButton,
            ]}
          >
            <Text
              style={[
                {
                  color:
                    activeTab === "tvSeries" ? colors.secondary : colors.gray,
                  fontWeight: activeTab === "tvSeries" ? "bold" : "600",
                },
                styles.tabText,
              ]}
            >
              TV Series
            </Text>
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
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  {category}
                </Text>
                <Pressable
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
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
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color={colors.primary}
                  />
                </Pressable>
              </View>

              {categoryFilteredShows.length > 0 ? (
                <FlatList
                  horizontal
                  data={categoryFilteredShows}
                  renderItem={renderShowItem}
                  keyExtractor={(item) => item.id.toString()}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                  initialNumToRender={5} // Render only 5 items initially
                  windowSize={5} // Reduce the rendering window size
                  maxToRenderPerBatch={5} // Render 5 items at a time
                  updateCellsBatchingPeriod={50} // Batch updates every 50ms
                />
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons
                    name="theaters"
                    size={40}
                    color={colors.gray}
                    style={styles.emptyIcon}
                  />
                  <Text style={[styles.emptyText, { color: colors.gray }]}>
                    No {category.toLowerCase()} shows yet
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </Animated.View>

      <SearchModal
        isVisible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />
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
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    position: "relative",
  },
  tabButton: {
    padding: 10,
    width: tabButtonWidth,
    alignItems: "center",
  },
  tabText: {
    fontSize: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  listContent: {
    paddingLeft: 10,
  },
  movieItem: {
    marginRight: 15,
  },
  posterImage: {
    width: posterWidth,
    height: posterHeight,
    borderRadius: 10,
  },
  emptyState: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
});

export default WatchListScreen;
