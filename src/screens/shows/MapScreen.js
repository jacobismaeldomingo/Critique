// screens/shows/MapScreen.js
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "react-native-vector-icons";
import { firebase_auth } from "../../../firebaseConfig";
import {
  saveWatchLocation,
  getMovieData,
  getTVSeriesData,
} from "../../services/firestore";
import Geocoder from "react-native-geocoding";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";
import Constants from "expo-constants";

const { GEOCODER_API_KEY } = Constants.expoConfig.extra;

Geocoder.init(GEOCODER_API_KEY);

const MapScreen = ({ route, navigation }) => {
  const { showId, type } = route.params || {};
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const statsScale = useRef(new Animated.Value(0.8)).current;

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
      Animated.spring(statsScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // useEffect hook to fetch and set the user's location
  useEffect(() => {
    const fetchLocation = async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Enable location services to use maps."
        );
        return;
      }

      // Check if the user is logged in and fetch location from Firebase if available
      const user = firebase_auth.currentUser;
      if (user) {
        // Fetch the saved location from Firestore
        const savedData =
          type === "movies"
            ? await getMovieData(firebase_auth.currentUser.uid, showId)
            : await getTVSeriesData(firebase_auth.currentUser.uid, showId);
        if (savedData && savedData.location) {
          setLocation(savedData.location);
          setAddress(savedData.location.name);
          return;
        } else {
          // If no saved location, fallback to Halifax
          setLocation({
            latitude: 44.6509,
            longitude: -63.5923,
            name: "Halifax",
          });
        }
      } else {
        // Fallback to Halifax if no user is logged in
        setLocation({
          latitude: 44.6509,
          longitude: -63.5923,
          name: "Halifax",
        });
      }
    };

    fetchLocation();
  }, [showId]);

  // Handles searching for a location based on the user's input address.
  const handleSearch = async () => {
    if (address.length < 3) {
      return;
    }

    try {
      const json = await Geocoder.from(address);
      const location = json.results[0].geometry.location;
      const searchedLocation = {
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
        title: address,
      };

      setSelectedLocation(searchedLocation);

      // Save the searchedLocation to firebase
      const user = firebase_auth.currentUser;
      if (!user) return;

      saveWatchLocation(user.uid, showId, type, searchedLocation);

      mapRef.current?.animateCamera(
        { center: searchedLocation, zoom: 15 },
        { duration: 2000 }
      );

      Alert.alert("Location saved successfully!");
    } catch (error) {
      console.error("Search error:", error);
    }
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

        <Text style={[styles.headerTitle, { color: "#fff" }]}>Map</Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                opacity: colors.opacity,
                borderColor: colors.grey,
              },
            ]}
            placeholder="Search theatre or address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor={colors.gray}
          />
          <Pressable
            style={[styles.searchButton, { backgroundColor: colors.secondary }]}
            onPress={handleSearch}
          >
            <Ionicons name="search" size={24} color="white" />
          </Pressable>
        </View>
        <View style={styles.mapContainer}>
          {location ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.select({ ios: "", android: "google" })}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
            >
              {!selectedLocation ? (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={location.name}
                >
                  <Ionicons name="film-sharp" size={32} color="#9575CD" />
                </Marker>
              ) : (
                <Marker
                  coordinate={selectedLocation}
                  title={selectedLocation.title}
                >
                  <Ionicons name="film-sharp" size={32} color="#9575CD" />
                </Marker>
              )}
            </MapView>
          ) : (
            <Text>Loading map...</Text>
          )}
        </View>
      </View>
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
    marginVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 5,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 5,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default MapScreen;
