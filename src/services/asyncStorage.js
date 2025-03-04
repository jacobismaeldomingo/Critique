// services/asyncStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

export const savePreferences = async (preferences) => {
  try {
    await AsyncStorage.setItem("preferences", JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving preferences:", error);
  }
};

export const getPreferences = async () => {
  try {
    const preferences = await AsyncStorage.getItem("preferences");
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error("Error retrieving preferences:", error);
    return null;
  }
};
