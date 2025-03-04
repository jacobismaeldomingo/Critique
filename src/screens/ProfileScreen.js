// screens/ProfileScreen.js
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { firebase_auth, db } from "../../firebaseConfig.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import { getWatchedShows } from "../services/firestore.js";
import { fetchGenres } from "../services/tmdb";
import GenreModal from "../components/GenreModal.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "react-native-vector-icons";

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthday, setBirthday] = useState("");
  const [series, setSeries] = useState(0);
  const [movies, setMovies] = useState(0);
  const [errors, setErrors] = useState({});
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isGenreModalVisible, setIsGenreModalVisible] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Fetch user profile data on component mount
  useFocusEffect(
    useCallback(() => {
      const fetchUserProfile = async () => {
        const user = firebase_auth.currentUser;

        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));

          // If user exist, set their information
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.username || "");
            setEmail(userData.email || "");
            setPhoneNumber(userData.phoneNumber || "");
            setBirthday(userData.birthday || "");

            // Retrieving User Preferences from Async Storage
            // const storedGenres = await AsyncStorage.getItem("preferredGenres");
            const storedGenres = userData.preferredGenres || "";
            // const parsedGenres = storedGenres ? JSON.parse(storedGenres) : [];
            setSelectedGenres(storedGenres);
          } else {
            throw Error("No User Found.");
          }

          // Fetch watched movies and series count
          const savedMovies = await getWatchedShows(user.uid, "movies");
          const savedSeries = await getWatchedShows(user.uid, "tvSeries");
          setMovies(savedMovies.length);
          setSeries(savedSeries.length);
        }
      };

      fetchUserProfile();
    }, [isEditing])
  );

  useEffect(() => {
    const getGenres = async () => {
      const genreList = await fetchGenres();
      setGenres(genreList);
    };

    getGenres();
  }, []);

  // Check username availability while typing
  const checkUsernameAvailability = async (username) => {
    if (username.trim() === "") {
      setIsUsernameAvailable(true);
      return;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    setIsUsernameAvailable(querySnapshot.empty);
  };

  // Handle save button click
  const handleSave = async () => {
    let profileErrors = {};

    // Check if fields are empty
    if (!username.trim()) {
      profileErrors.username = "Username is required.";
    }

    if (!phoneNumber.trim()) {
      profileErrors.phoneNumber = "Phone Number is required.";
    }

    if (!birthday.trim()) {
      profileErrors.birthday = "Birthday is required.";
    }

    if (Object.keys(profileErrors).length > 0) {
      setErrors(profileErrors);
      return;
    }

    try {
      // Check if username is available
      if (!isUsernameAvailable) {
        throw new Error(
          "Username is already taken. Please choose another one."
        );
      }

      const user = firebase_auth.currentUser;
      if (user) {
        // Update user profile in Firestore
        await setDoc(doc(db, "users", user.uid), {
          username,
          email,
          phoneNumber,
          birthday,
        });
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("email", email);

        alert("Success", "Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      setErrors(error.message);
    }
  };

  const handleBack = () => {
    setErrors("");
    setIsEditing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="menu" size={28} color="black" />
        </Pressable>
        <Text style={styles.header}>Profile</Text>
      </View>
      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: StyleSheet.hairlineWidth,
          marginBottom: 5,
        }}
      />

      {isEditing ? (
        <>
          <View style={[styles.profileEditContainer, { marginTop: 10 }]}>
            <Text style={styles.profileTitle}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                checkUsernameAvailability(text);
              }}
              placeholder="Enter username"
              placeholderTextColor="#888"
            />
          </View>

          {!isUsernameAvailable && (
            <Text style={styles.errorText}>Username is already taken.</Text>
          )}

          {errors.username ? (
            <Text style={styles.errorText}>{errors.username}</Text>
          ) : null}

          <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>Email</Text>
            <TextInput
              style={styles.nonEditableText}
              value={email}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#888"
              editable={false}
            />
          </View>

          <View style={styles.profileEditContainer}>
            <Text style={styles.profileTitle}>
              Phone Number (999-999-9999):
            </Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#888"
            />
          </View>

          {errors.phoneNumber ? (
            <Text style={styles.errorText}>{errors.phoneNumber}</Text>
          ) : null}

          <View style={styles.profileEditContainer}>
            <Text style={styles.profileTitle}>Birthday (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.input}
              value={birthday}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#888"
            />
          </View>

          {errors.birthday ? (
            <Text style={styles.errorText}>{errors.birthday}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <Pressable style={styles.editButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable style={styles.editButton} onPress={handleBack}>
              <Text style={styles.buttonText}>Back</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <View style={styles.button}>
            <Pressable onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Edit Profile</Text>
            </Pressable>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>Username</Text>
            <Text style={styles.profileText}>{username}</Text>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>Email</Text>
            <Text style={styles.profileText}>{email}</Text>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>Phone Number</Text>
            <Text style={styles.profileText}>{phoneNumber}</Text>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>Birthday</Text>
            <Text style={styles.profileText}>{birthday}</Text>
          </View>

          <View style={styles.genreContainer}>
            <View style={styles.profileEditContainer}>
              <Text style={styles.genreTitle}>Favorite Genres</Text>
              {selectedGenres.length > 0 ? (
                <Text style={styles.profileText}>
                  {genres
                    .filter((genre) => selectedGenres.includes(genre.id))
                    .map((genre) => genre.name)
                    .join(", ")}
                </Text>
              ) : (
                <Text style={styles.profileText}>
                  No favorite genres selected.
                </Text>
              )}
            </View>

            <Pressable
              style={styles.preferencesButton}
              onPress={() => setIsGenreModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={26} color="black" />
            </Pressable>
          </View>

          <View
            style={{
              borderBottomColor: "black",
              borderBottomWidth: StyleSheet.hairlineWidth,
              marginVertical: 10,
            }}
          />

          <Text style={styles.stats}>My Stats</Text>
          <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>Movies Watched</Text>
            <Text style={styles.profileText}>{movies}</Text>
          </View>
          <View style={styles.profileContainer}>
            <Text style={styles.profileTitle}>TV Series Watched</Text>
            <Text style={styles.profileText}>{series}</Text>
          </View>
        </>
      )}

      <GenreModal
        isVisible={isGenreModalVisible}
        onClose={() => setIsGenreModalVisible(false)}
      />
    </ScrollView>
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
    flexDirection: "row",
    marginBottom: 5,
    justifyContent: "space-between",
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginRight: 150,
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  profileContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "lightgray",
  },
  profileTitle: {
    color: "black",
    fontSize: 18,
    fontWeight: "500",
  },
  profileText: {
    fontSize: 18,
    fontWeight: "500",
    paddingRight: 5,
  },
  profileEditContainer: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "lightgray",
  },
  nonEditableText: {
    fontSize: 18,
    fontWeight: "500",
    paddingRight: 5,
  },
  input: {
    width: "100%",
    height: 30,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
    width: 150,
    alignItems: "center",
    alignSelf: "center",
  },
  editButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    width: 150,
    alignItems: "center",
    alignSelf: "center",
  },
  preferencesButton: {
    padding: 12,
    borderRadius: 8,
    width: 50,
    marginRight: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  stats: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  genreTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  genreContainer: {
    flexDirection: "row",
    backgroundColor: "lightgray",
    borderRadius: 10,
    justifyContent: "space-between",
  },
});

export default ProfileScreen;
