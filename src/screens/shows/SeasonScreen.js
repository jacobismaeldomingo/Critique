import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { fetchSeason } from "../../services/tmdb";
import { Ionicons } from "react-native-vector-icons";
import LoadingItem from "../../components/LoadingItem";
import { firebase_auth } from "../../../firebaseConfig";
import {
  getWatchedEpisodes,
  saveWatchedEpisodes,
} from "../../services/firestore";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const { width } = Dimensions.get("window");

const SeasonScreen = ({ route, navigation }) => {
  const { seriesId, seasonNumber, name, watchedEpisodes } = route.params;
  const [season, setSeason] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [watched, setWatched] = useState(new Set(watchedEpisodes || []));
  const [expandedSeason, setExpandedSeason] = useState(false);
  const [expandedEpisodes, setExpandedEpisodes] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loadData = async () => {
      // Start animations
      fadeAnim.setValue(0);
      slideUpAnim.setValue(20);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]).start();

      const seasonDetails = await fetchSeason(seriesId, seasonNumber);
      setSeason(seasonDetails);
      setEpisodes(seasonDetails.episodes);

      try {
        const userId = firebase_auth.currentUser.uid;
        const savedWatchedEpisodes = await getWatchedEpisodes(userId, seriesId);
        if (savedWatchedEpisodes[`Season ${seasonNumber}`]) {
          setWatched(new Set(savedWatchedEpisodes[`Season ${seasonNumber}`]));
        }
      } catch (error) {
        console.error("Failed to load watched episodes from Firestore", error);
      }
    };

    loadData();
  }, [seriesId, seasonNumber]);

  // Save watched episodes to Firestore when the watched state changes
  useEffect(() => {
    const saveEpisodesToFirestore = async () => {
      try {
        const userId = firebase_auth.currentUser.uid;
        const watchedArray = Array.from(watched);
        await saveWatchedEpisodes(userId, seriesId, seasonNumber, watchedArray);
      } catch (error) {
        console.error("Failed to save watched episodes to Firestore", error);
      }
    };

    saveEpisodesToFirestore();
  }, [watched, seriesId, seasonNumber]);

  // Animation for button presses
  const animatePress = (animation) => {
    Animated.sequence([
      Animated.timing(animation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Function to toggle the watched state for a single episode
  const toggleWatched = (episodeNumber) => {
    const updatedWatched = new Set(watched);
    if (updatedWatched.has(episodeNumber)) {
      updatedWatched.delete(episodeNumber);
    } else {
      updatedWatched.add(episodeNumber);
    }
    setWatched(updatedWatched); // Only triggers the save when `watched` changes
  };

  // Toggle watched status for all episodes in the season
  const toggleSeasonWatched = () => {
    const updatedWatched =
      watched.size === episodes.length
        ? new Set()
        : new Set(episodes.map((ep) => ep.episode_number));
    setWatched(updatedWatched);
  };

  // Toggle expanded state for a specific episode
  const toggleEpisodeExpanded = (episodeId) => {
    setExpandedEpisodes((prev) => ({
      ...prev,
      [episodeId]: !prev[episodeId], // Toggle expanded state for the episode
    }));
  };

  const renderEpisodeItem = ({ item }) => {
    const animation = new Animated.Value(1);

    return (
      <Animated.View
        style={{
          backgroundColor: watched.has(item.episode_number)
            ? colors.episode
            : colors.details,
          transform: [{ scale: scaleValue }],
          opacity: fadeAnim,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <Pressable
          onPressIn={() => animatePress(animation)}
          style={styles.episodeContainer}
        >
          <View style={styles.episodeHeader}>
            <View style={styles.episodeSection}>
              <Text style={[styles.episodeNumber, { color: colors.primary }]}>
                Episode {item.episode_number}
              </Text>
              <View style={styles.episodeTitleContainer}>
                <Text
                  style={[
                    styles.episodeTitle,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </View>
            </View>
            <BouncyCheckbox
              isChecked={watched.has(item.episode_number)}
              onPress={() => toggleWatched(item.episode_number)}
              fillColor={colors.primary}
              unfillColor={colors.input}
              innerIconStyle={{ borderRadius: 50 }}
              iconStyle={{ borderRadius: 50 }}
              style={styles.checkbox}
            />
          </View>

          <View style={styles.episodeDetails}>
            <Text
              style={[
                styles.detailText,
                { color: colors.gray, opacity: colors.opacity },
              ]}
            >
              {item.air_date} • {item.runtime} mins
            </Text>
          </View>

          {item.still_path && (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${item.still_path}`,
              }}
              style={[styles.episodeImage, { borderColor: colors.itemBorder }]}
              resizeMode="cover"
            />
          )}

          {item.overview && (
            <View style={styles.overviewContainer}>
              <Text
                style={[
                  styles.overview,
                  { color: colors.text, opacity: colors.opacity },
                ]}
                numberOfLines={expandedEpisodes[item.id] ? undefined : 3}
              >
                {item.overview}
              </Text>
              {item.overview.length > 150 && (
                <Pressable
                  onPress={() => toggleEpisodeExpanded(item.id)}
                  style={styles.readMoreButton}
                >
                  <Text style={[styles.readMore, { color: colors.primary }]}>
                    {expandedEpisodes[item.id] ? "Show Less" : "Read More"}
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  if (!season) {
    return <LoadingItem />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.View
        style={[
          styles.upperContainer,
          {
            backgroundColor: colors.headerBackground,
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
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
              color={colors.icon}
              opacity={colors.opacity}
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text
              style={[
                styles.header,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              {name}
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />

        <Animated.View
          style={[
            styles.seasonHeader,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          {season.poster_path && (
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${season.poster_path}`,
              }}
              style={[styles.seasonPoster, { borderColor: colors.itemBorder }]}
              resizeMode="cover"
            />
          )}

          <View style={styles.seasonInfo}>
            <View style={styles.seasonActions}>
              <Text style={[styles.seasonTitle, { color: colors.text }]}>
                Season {seasonNumber}
              </Text>
              <BouncyCheckbox
                isChecked={watched.size === episodes.length}
                onPress={toggleSeasonWatched}
                fillColor={colors.primary}
                unfillColor={colors.input}
                innerIconStyle={{ borderRadius: 50 }}
                iconStyle={{ borderRadius: 50 }}
                style={styles.seasonCheckbox}
              />
            </View>

            <Text
              style={[
                styles.detailText,
                { color: colors.gray, opacity: colors.opacity },
              ]}
            >
              {season.air_date} • {episodes.length} episodes
            </Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.ratingText,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                {season.vote_average?.toFixed(1)} / 10
              </Text>
            </View>

            {season.overview && (
              <View style={styles.overviewContainer}>
                <Text
                  style={[
                    styles.overview,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                  numberOfLines={expandedSeason ? undefined : 3}
                >
                  {season.overview}
                </Text>
                <Pressable
                  onPress={() => setExpandedSeason(!expandedSeason)}
                  style={styles.readMoreButton}
                >
                  <Text style={[styles.readMore, { color: colors.primary }]}>
                    {expandedSeason ? "Show Less" : "Read More"}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </Animated.View>

        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              opacity: colors.opacity,
              backgroundColor: colors.background,
            },
          ]}
        >
          Episodes
        </Text>

        <FlatList
          data={episodes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderEpisodeItem}
          contentContainerStyle={styles.episodesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={styles.footer} />}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: Platform.select({
      ios: 60,
      android: 20,
    }),
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerContainer: {
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  seasonHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  seasonPoster: {
    width: width * 0.3,
    height: width * 0.45,
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 1,
  },
  seasonInfo: {
    flex: 1,
  },
  seasonActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  seasonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginRight: 10,
  },
  seasonCheckbox: {
    marginRight: -5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 5,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  episodesList: {
    paddingBottom: 20,
  },
  episodeContainer: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  episodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  episodeSection: {
    marginBottom: 5,
  },
  episodeNumber: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  episodeTitleContainer: {
    marginRight: 12,
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  checkbox: {
    marginRight: -5,
  },
  episodeDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
  },
  episodeImage: {
    width: "100%",
    height: width * 0.5,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  overviewContainer: {
    marginBottom: 4,
  },
  overview: {
    fontSize: 14,
    lineHeight: 20,
  },
  readMoreButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  readMore: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    height: 20,
  },
});

export default SeasonScreen;
