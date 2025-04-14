// screens/shows/FullCastCrewScreen.js
import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  SectionList,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  Platform,
  SafeAreaView,
} from "react-native";
import placeholderPicture from "../../../assets/placeholder_profile.png";
import { Ionicons } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const { width } = Dimensions.get("window");

const FullCastCrewScreen = ({ route }) => {
  const { cast } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Set responsive width and height for the cast image
  const castImageSize = width * 0.16;

  // Start animations when component mounts
  useEffect(() => {
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
  }, []);

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

  // Function to group members by their roles
  const groupByDepartment = (data) => {
    return data.reduce((acc, member) => {
      const department = member.known_for_department || "Other";
      if (!acc[department]) acc[department] = [];
      acc[department].push(member);
      return acc;
    }, {});
  };

  const groupedCast = groupByDepartment(cast);

  // Convert grouped data into SectionList format
  const sections = Object.keys(groupedCast).map((department) => ({
    title: department,
    data: groupedCast[department],
  }));

  // Filter function based on search query
  const filterData = (sections) => {
    return sections
      .map((section) => ({
        title: section.title,
        data: section.data.filter(
          (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (member.roles?.[0]?.character || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((section) => section.data.length > 0);
  };

  /**
   * Renders an individual cast item as a pressable component with a profile image.
   * @param {object} item - Show object containing information of the cast.
   */
  const renderCastItem = ({ item }) => {
    const animation = new Animated.Value(1);
    return (
      <Animated.View
        style={[
          styles.castItem,
          {
            transform: [{ scale: scaleValue }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          onPressIn={() => animatePress(animation)}
          style={styles.castPressable}
        >
          <View style={styles.castImageContainer}>
            <Image
              source={
                item.profile_path
                  ? {
                      uri: `https://image.tmdb.org/t/p/w200${item.profile_path}`,
                    }
                  : placeholderPicture
              }
              style={[
                styles.castImage,
                {
                  width: castImageSize,
                  height: castImageSize,
                  borderColor: colors.itemBorder,
                  backgroundColor: colors.input,
                },
              ]}
            />
          </View>
          <View style={styles.castInfo}>
            <Text
              style={[
                styles.castName,
                { color: colors.text, opacity: colors.opacity },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text
              style={[
                styles.castRole,
                { color: colors.subtitle, opacity: colors.opacity },
              ]}
              numberOfLines={2}
            >
              {item.character ||
                item.roles?.[0]?.character ||
                item.job ||
                "Unknown Role"}
            </Text>
            {item.creditType === "cast" && item.total_episode_count && (
              <Text
                style={[
                  styles.episodeCount,
                  { color: colors.gray, opacity: colors.opacity },
                ]}
              >
                {item.total_episode_count} episodes
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

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
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back-outline" size={28} color="#fff" />
        </Pressable>

        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          Full Cast & Crew
        </Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <Animated.View
        style={[
          styles.content,
          {
            backgroundColor: colors.background,
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.gray}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                backgroundColor: colors.input,
                borderColor: colors.itemBorder,
              },
            ]}
            placeholder="Search cast or crew..."
            placeholderTextColor={colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <SectionList
          sections={filterData(sections)}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section: { title } }) => (
            <Animated.View
              style={[
                styles.sectionHeader,
                {
                  backgroundColor: colors.background,
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                {title}
              </Text>
            </Animated.View>
          )}
          renderItem={renderCastItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={60}
                color={colors.gray}
                style={{ opacity: 0.5 }}
              />
              <Text
                style={[
                  styles.noResults,
                  { color: colors.subtitle, opacity: colors.opacity },
                ]}
              >
                No results found
              </Text>
              <Text
                style={[
                  styles.noResultsSubtext,
                  { color: colors.gray, opacity: colors.opacity },
                ]}
              >
                Try a different search term
              </Text>
            </View>
          }
          stickySectionHeadersEnabled={true}
          contentContainerStyle={styles.listContent}
          indicatorStyle={theme === "dark" ? "white" : "black"}
        />
      </Animated.View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  searchIcon: {
    position: "absolute",
    left: 20,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    paddingLeft: 48,
    borderWidth: 1,
    borderRadius: 30,
    fontSize: 16,
  },
  sectionHeader: {
    paddingVertical: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingBottom: 20,
  },
  castItem: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  castPressable: {
    flexDirection: "row",
    alignItems: "center",
  },
  castImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  castImage: {
    borderRadius: 30,
    borderWidth: 1,
  },
  initialsContainer: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  initialsText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  castInfo: {
    flex: 1,
  },
  castName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  castRole: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  noResults: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default FullCastCrewScreen;
