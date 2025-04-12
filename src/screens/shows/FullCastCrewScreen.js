import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  SectionList,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import placeholderPicture from "../../../assets/placeholder_profile.png";
import { Ionicons } from "react-native-vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const FullCastCrewScreen = ({ route }) => {
  const { cast } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  // Get device width
  const { width } = Dimensions.get("window");
  // Set responsive width and height for the cast image
  const castImageSize = width * 0.15;

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

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

  const renderCastItem = ({ item }) => (
    <View style={styles.castItem}>
      <Image
        source={
          item.profile_path
            ? { uri: `https://image.tmdb.org/t/p/w200${item.profile_path}` }
            : placeholderPicture
        }
        style={{
          width: castImageSize,
          height: castImageSize,
          borderRadius: 40,
          marginRight: 10,
        }}
      />
      <View>
        <Text
          style={[
            styles.castName,
            { color: colors.text, opacity: colors.opacity },
          ]}
        >
          {item.name}
        </Text>
        <Text
          style={[
            styles.castRole,
            { color: colors.subtitle, opacity: colors.opacity },
          ]}
        >
          {item.roles?.[0]?.character || "Unknown Role"}
        </Text>
      </View>
    </View>
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
              Full Cast & Crew List
            </Text>
          </View>
        </View>
        <View style={[styles.divider, { borderBottomColor: colors.gray }]} />
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.text, opacity: colors.opacity },
          ]}
          placeholder="Search cast or crew..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.gray}
        />
        <SectionList
          sections={filterData(sections)}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section: { title } }) => (
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, opacity: colors.opacity },
              ]}
            >
              {title}
            </Text>
          )}
          renderItem={renderCastItem}
          ListEmptyComponent={
            <Text
              style={[
                styles.noResults,
                { color: colors.subtitle, opacity: colors.opacity },
              ]}
            >
              No results found.
            </Text>
          }
          stickySectionHeadersEnabled={false}
          indicatorStyle={colors.bar} // only works in IOS
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
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
    paddingLeft: 5,
  },
  castItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingLeft: 5,
  },
  castName: {
    fontSize: 18,
    fontWeight: "500",
  },
  castRole: {
    fontSize: 16,
  },
  noResults: {
    textAlign: "center",
    marginTop: 20,
  },
});

export default FullCastCrewScreen;
