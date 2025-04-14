// components/CategoryModal.js
import React, { useContext } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { saveToWatchList } from "../services/firestore";
import { firebase_auth } from "../../firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "./ThemeContext";
import { getTheme } from "./theme";

const CategoryModal = ({ isVisible, onClose, show, type, setIsAdded }) => {
  const navigation = useNavigation();

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  /**
   * Handles the selection of watchlist category by the user
   * @param {string} category - The watchlist category selected by the user.
   */
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
      Alert.alert("Please log in to save shows.");
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
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <Text
            style={[
              styles.title,
              { color: colors.text, opacity: colors.opacity },
            ]}
          >
            Please select Watchlist Category before adding the show
          </Text>
          <View>
            {["Watched", "In Progress", "Plan to Watch"].map((category) => (
              <Pressable
                key={category}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.5 : 1,
                    borderColor: colors.grey,
                  },
                  styles.categoryButton,
                ]}
                onPress={() => handleSelectCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: colors.text, opacity: colors.opacity },
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
                backgroundColor: colors.button,
              },
              styles.closeButton,
            ]}
            onPress={onClose}
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
    margin: 5,
  },
  categoryText: {
    fontSize: 16,
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

export default CategoryModal;
