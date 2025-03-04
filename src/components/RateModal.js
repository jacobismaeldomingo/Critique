// components/CategoryModal.js
import React, { useEffect, useState } from "react";
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

const RateModal = ({ isVisible, onClose, showId, type }) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const loadRatings = async () => {
      if (firebase_auth.currentUser) {
        const ratingDetails = await fetchRatings(
          firebase_auth.currentUser.uid,
          showId,
          type
        );
        setRating(ratingDetails);
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
    setRating("");
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
        <View style={styles.modalContainer}>
          <Text style={styles.label}>Your Ratings</Text>
          <View style={styles.ratingContainer}>
            <Rating
              maxRating={5}
              rating={rating}
              onChange={handleStarPress}
              size={24}
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.ratingInput}
                keyboardType="numeric"
                value={rating.toString()}
                onChangeText={handleInputChange}
              />
              <Text style={styles.slashFive}>/ 5</Text>
            </View>
          </View>
          <Pressable style={styles.closeButton} onPress={handleUserRating}>
            <Text style={styles.closeButtonText}>Save Ratings</Text>
          </Pressable>
          <Pressable style={styles.closeButton} onPress={handleClose}>
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
    backgroundColor: "#fff",
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
  ratingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  ratingInput: {
    textAlign: "center",
    fontSize: 16,
    color: "#000",
  },
  slashFive: {
    fontSize: 16,
    marginLeft: 5,
    color: "#000",
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: "#007BFF",
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
