import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Pressable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "react-native-vector-icons";
import { firebase_auth } from "../../../firebaseConfig";
import { saveWatchLocation, getMovieData } from "../../services/firestore";
import Geocoder from "react-native-geocoding";

Geocoder.init("AIzaSyASxi5UgDU5ZaiB-Tgv6oRfKUrhaRWSGKE");

const MapScreen = ({ route, navigation }) => {
  const { showId, type } = route.params || {};
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

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
        const savedData = await getMovieData(
          firebase_auth.currentUser.uid,
          showId
        );
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
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <>
      <View style={styles.upperContainer} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={28} color="black" />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Maps</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Search theatre or address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor={"#9E9E9E"}
          />
          <Pressable style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={24} color="white" />
          </Pressable>
        </View>
        <View style={styles.mapContainer}>
          {location ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={location.name}
              >
                <Ionicons name="film-sharp" size={32} color="#9575CD" />
              </Marker>

              {selectedLocation && (
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
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: "#3F51B5",
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
