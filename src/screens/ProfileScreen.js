// screens/ProfileScreen.js
import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Platform,
  SafeAreaView,
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
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "react-native-vector-icons";
import { ThemeContext } from "../components/ThemeContext";
import { getTheme } from "../components/theme";

const { width } = Dimensions.get("window");

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

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  const derivedColors = {
    cardBackground: theme === "dark" ? colors.details : colors.viewAll,
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
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

  // Button press animation
  const animateButtonPress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
            const storedGenres = userData.preferredGenres || [];
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

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  // Validate birthday format
  const validateBirthday = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const [year, month, day] = date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  // Handle save button click
  const handleSave = async () => {
    let profileErrors = {};

    // Check if fields are empty
    if (!username.trim()) {
      profileErrors.username = "Username is required.";
    } else if (username.length < 3) {
      profileErrors.username = "Username must be at least 3 characters.";
    }

    // Phone number validation
    if (!phoneNumber.trim()) {
      profileErrors.phoneNumber = "Phone Number is required.";
    } else if (!validatePhoneNumber(phoneNumber)) {
      profileErrors.phoneNumber = "Please use format 123-456-7890";
    }

    // Birthday validation
    if (!birthday.trim()) {
      profileErrors.birthday = "Birthday is required.";
    } else if (!validateBirthday(birthday)) {
      profileErrors.birthday = "Please use format YYYY-MM-DD";
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
        await setDoc(
          doc(db, "users", user.uid),
          {
            username,
            email,
            phoneNumber,
            birthday,
          },
          { merge: true }
        );
        await AsyncStorage.setItem("username", username);
        await AsyncStorage.setItem("email", email);

        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
        setErrors({}); // Clear errors on success
      }
    } catch (error) {
      Alert.alert("Error", error.message);
      setErrors({ general: error.message });
    }
  };

  const renderProfileField = (
    title,
    value,
    iconName,
    fieldName,
    isEditable = false,
    onChangeText = null,
    placeholder = "",
    keyboardType = "default"
  ) => {
    return (
      <View>
        <Animated.View
          style={[
            styles.profileFieldContainer,
            {
              backgroundColor: derivedColors.cardBackground,
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
              borderColor: errors[fieldName] ? colors.error : "transparent",
              borderWidth: errors[fieldName] ? 1 : 0,
            },
          ]}
        >
          <View style={styles.fieldIcon}>
            <MaterialCommunityIcons
              name={iconName}
              size={25}
              color={colors.icon}
            />
          </View>
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { color: colors.subtitle }]}>
              {title}
            </Text>
            {isEditing && isEditable ? (
              <>
                <TextInput
                  style={[
                    styles.fieldInput,
                    {
                      color: colors.text,
                      borderBottomColor: errors[fieldName]
                        ? colors.error
                        : colors.gray,
                    },
                  ]}
                  value={value}
                  onChangeText={(text) => {
                    onChangeText(text);
                    // Clear error when user starts typing
                    if (errors[fieldName]) {
                      setErrors((prev) => ({
                        ...prev,
                        [fieldName]: undefined,
                      }));
                    }
                  }}
                  placeholder={placeholder}
                  placeholderTextColor={colors.gray}
                  keyboardType={keyboardType}
                />
                {errors[fieldName] && (
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {errors[fieldName]}
                  </Text>
                )}
              </>
            ) : (
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {value || "Not set"}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderStatCard = (title, value, iconName) => {
    return (
      <Animated.View
        style={[
          styles.statCard,
          {
            backgroundColor: derivedColors.cardBackground,
            transform: [{ scale: statsScale }],
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={26}
          color={colors.primary}
        />
        <Text style={[styles.statValue, { color: colors.text }]}>
          {value.toString()}
        </Text>
        <Text style={[styles.statLabel, { color: colors.subtitle }]}>
          {title}
        </Text>
      </Animated.View>
    );
  };

  const handleEditButton = () => {
    setIsEditing(!isEditing);
    setErrors({});
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
        <Pressable onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>
        <Text style={[styles.headerTitle, { color: "#fff" }]}>Profile</Text>
        <View style={{ width: 28 }} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.profileHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <Pressable
              onPressIn={animateButtonPress}
              onPress={handleEditButton}
              style={[styles.editButton, { backgroundColor: colors.secondary }]}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? "Cancel" : "Edit Profile"}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {renderProfileField(
          "Username",
          username,
          "account-outline",
          "username",
          true,
          (text) => {
            setUsername(text);
            checkUsernameAvailability(text);
          },
          "Enter your username",
          "default"
        )}

        {renderProfileField("Email", email, "email-outline", "email")}

        {isEditing ? (
          <>
            {renderProfileField(
              "Phone",
              phoneNumber,
              "phone-outline",
              "phoneNumber",
              true,
              (text) => {
                // Format phone number as 999-999-9999
                const formattedText = text
                  .replace(/\D/g, "") // Remove non-digits
                  .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
                setPhoneNumber(
                  !formattedText[2]
                    ? formattedText[1]
                    : `${formattedText[1]}-${formattedText[2]}` +
                        (formattedText[3] ? `-${formattedText[3]}` : "")
                );
                // Clear error when typing
                if (errors.phoneNumber) {
                  setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }
              },
              "123-456-7890",
              "phone-pad"
            )}
            {renderProfileField(
              "Birthday",
              birthday,
              "cake-variant-outline",
              "birthday",
              true,
              (text) => {
                // Format as YYYY-MM-DD
                const formattedText = text
                  .replace(/\D/g, "") // Remove non-digits
                  .match(/(\d{0,4})(\d{0,2})(\d{0,2})/);
                setBirthday(
                  !formattedText[2]
                    ? formattedText[1]
                    : `${formattedText[1]}-${formattedText[2]}` +
                        (formattedText[3] ? `-${formattedText[3]}` : "")
                );
                // Clear error when typing
                if (errors.birthday) {
                  setErrors((prev) => ({ ...prev, birthday: undefined }));
                }
              },
              "YYYY-MM-DD",
              "numeric"
            )}

            {errors.general && (
              <Text
                style={[
                  styles.errorText,
                  {
                    textAlign: "center",
                    marginBottom: 10,
                    color: colors.error,
                  },
                ]}
              >
                {errors.general}
              </Text>
            )}

            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <Pressable
                onPressIn={animateButtonPress}
                onPress={handleSave}
                style={[
                  styles.saveButton,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>
            </Animated.View>
          </>
        ) : (
          <>
            {renderProfileField(
              "Phone",
              phoneNumber,
              "phone-outline",
              "phoneNumber"
            )}
            {renderProfileField(
              "Birthday",
              birthday,
              "cake-variant-outline",
              "birthday"
            )}
          </>
        )}

        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Favorite Genres
            </Text>
            <Pressable
              onPress={() => setIsGenreModalVisible(true)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <MaterialCommunityIcons
                name="movie-open-plus-outline"
                size={25}
                color={colors.primary}
              />
            </Pressable>
          </View>

          {selectedGenres.length > 0 ? (
            <View style={styles.genreChipsContainer}>
              {genres
                .filter((genre) => selectedGenres.includes(genre.id))
                .map((genre) => (
                  <View
                    key={genre.id}
                    style={[styles.genreChip, { backgroundColor: genre.color }]}
                  >
                    <Text style={[styles.genreChipText]}>{genre.name}</Text>
                  </View>
                ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              No favorite genres selected yet
            </Text>
          )}
        </Animated.View>

        <Animated.View
          style={[
            styles.sectionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Stats
          </Text>
          <View style={styles.statsContainer}>
            {renderStatCard("Movies", movies, "filmstrip")}
            {renderStatCard("TV Shows", series, "television")}
          </View>
        </Animated.View>
      </ScrollView>

      <GenreModal
        isVisible={isGenreModalVisible}
        onClose={() => setIsGenreModalVisible(false)}
        onSave={(updatedGenres) => {
          setSelectedGenres(updatedGenres);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.select({
      ios: 30,
      android: 100,
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  editButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
    marginHorizontal: 20,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  profileFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 1,
  },
  fieldIcon: {
    marginRight: 15,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 2,
    opacity: 0.8,
  },
  fieldValue: {
    fontSize: 18,
    fontWeight: "500",
  },
  fieldInput: {
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 5,
    borderBottomWidth: 1,
    width: "100%",
  },
  sectionContainer: {
    marginTop: 25,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  genreChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  genreChip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  genreChipText: {
    fontSize: 15,
    color: "#fff",
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statCard: {
    width: width * 0.4,
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 8,
  },
});

export default ProfileScreen;
