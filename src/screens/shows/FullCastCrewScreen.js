import React, { useState } from "react";
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

const FullCastCrewScreen = ({ route }) => {
  const { cast } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  // Get device width
  const { width } = Dimensions.get("window");

  // Set responsive width and height for the cast image
  const castImageSize = width * 0.15;

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
        <Text style={styles.castName}>{item.name}</Text>
        <Text style={styles.castRole}>
          {item.roles?.[0]?.character || "Unknown Role"}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.upperContainer} />
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
            <Ionicons name="chevron-back-outline" size={28} color="black" />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Full Cast & Crew List</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cast or crew..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <SectionList
          sections={filterData(sections)}
          keyExtractor={(item) => item.id.toString()}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
          renderItem={renderCastItem}
          ListEmptyComponent={
            <Text style={styles.noResults}>No results found.</Text>
          }
          stickySectionHeadersEnabled={false}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: 60,
    backgroundColor: "#7850bf",
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
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
    borderBottomColor: "#9E9E9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  searchInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#9E9E9E",
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 15,
    color: "#000",
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
    color: "#666",
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
});

export default FullCastCrewScreen;
