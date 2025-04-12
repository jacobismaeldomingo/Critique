// components/CategoryModal.js
import React, { useEffect, useState, useContext } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { updateShowProgress } from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import { Rating } from "@kolking/react-native-rating";
import { ThemeContext } from "./ThemeContext";
import { getTheme } from "./theme";

const RateModal = ({ isVisible, onClose, showId, type }) => {
  const [rating, setRating] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  useEffect(() => {
    const loadRatings = async () => {
      if (firebase_auth.currentUser) {
        const ratingDetails = await fetchRatings(
          firebase_auth.currentUser.uid,
          showId,
          type
        );
        setRating(ratingDetails);
        setIsSaved(ratingDetails !== 0); // Check if rating is loaded (not zero)
      }
    };

    if (isVisible) {
      loadRatings();
    }
  }, [isVisible]);

  const handleUserRating = async () => {
    if (firebase_auth.currentUser) {
      const parsedRating = parseFloat(rating);
      if (!isNaN(parsedRating) && parsedRating >= 0 && parsedRating <= 5) {
        const data = { rating: parsedRating };
        await updateShowProgress(
          firebase_auth.currentUser.uid,
          showId,
          type,
          data
        );
        setIsSaved(true);
        Alert.alert("Ratings update successfully!");
        onClose();
      } else {
        Alert.alert("Please enter a valid rating between 0 and 5.");
      }
    } else {
      Alert.alert("Please log in to rate shows.");
    }
  };

  const handleStarPress = (newRating) => {
    setRating(newRating);
    setIsSaved(false);
  };

  const handleInputChange = (text) => {
    if (text === "") {
      setRating("");
      return;
    }

    // Allow numbers and at most one decimal point
    if (/^\d*\.?\d*$/.test(text)) {
      setRating(text);
    }
  };

  const handleClose = () => {
    if (!isSaved || rating === "") {
      setRating("0"); // Reset rating to 0 only if it's not saved and empty
    }

    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Your Ratings
          </Text>
          <View style={styles.ratingContainer}>
            <Rating
              maxRating={5}
              rating={rating}
              onChange={handleStarPress}
              size={24}
              fillColor="#9575CD"
              touchColor="#FFFFFF"
              baseColor={colors.gray}
            />
            <View style={[styles.inputContainer, { borderColor: colors.gray }]}>
              <TextInput
                style={[
                  styles.ratingInput,
                  { color: colors.text, opacity: colors.opacity },
                ]}
                keyboardType="numeric"
                value={rating.toString()}
                onChangeText={handleInputChange}
              />
              <Text
                style={[
                  styles.slashFive,
                  { color: colors.text, opacity: colors.opacity },
                ]}
              >
                / 5
              </Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
                backgroundColor: colors.button,
              },
              styles.closeButton,
            ]}
            onPress={handleUserRating}
          >
            <Text style={styles.closeButtonText}>Save Ratings</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
                backgroundColor: colors.button,
              },
              styles.closeButton,
            ]}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    justifyContent: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  ratingInput: {
    textAlign: "center",
    fontSize: 16,
  },
  slashFive: {
    fontSize: 16,
    marginLeft: 5,
  },
  closeButton: {
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default RateModal;
