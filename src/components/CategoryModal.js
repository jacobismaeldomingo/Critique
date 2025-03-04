// components/CategoryModal.js
import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { saveToWatchList } from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const CategoryModal = ({ isVisible, onClose, show, type, setIsAdded }) => {
  const navigation = useNavigation();

  const handleSelectCategory = async (category) => {
    if (firebase_auth.currentUser) {
      await saveToWatchList(
        firebase_auth.currentUser.uid,
        show,
        type,
        category
      );
      setIsAdded(true);
      onClose();
      navigation.navigate("MainTabs", { screen: "WatchList" }); // Navigate to WatchList after adding
    } else {
      alert("Please log in to save shows.");
    }
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
          <Text style={styles.title}>
            Please select Watchlist Category before adding the show
          </Text>
          <View>
            {["Watched", "In Progress", "Plan to Watch"].map((category) => (
              <Pressable
                key={category}
                style={[styles.categoryButton]}
                onPress={() => handleSelectCategory(category)}
              >
                <Text style={styles.categoryText}>{category}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  categoryButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "gray",
    margin: 5,
  },
  selectedCategoryButton: {
    backgroundColor: "blue",
  },
  categoryText: {
    fontSize: 16,
  },
  selectedCategoryText: {
    color: "white",
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

export default CategoryModal;
