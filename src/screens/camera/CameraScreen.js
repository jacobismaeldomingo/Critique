import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "react-native-vector-icons";

const CameraScreen = ({ navigation, route }) => {
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need camera access</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          skipProcessing: false,
        });
        setCapturedImage(photo);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to capture image");
      }
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const onPhotoTaken = async (photoUri) => {
    try {
      setPhotoLoading(true);

      // Upload to Cloudinary
      const { secure_url, public_id } = await uploadImageToCloudinary(photoUri);

      if (!secure_url) {
        Alert.alert("Error", "Failed to upload image to Cloudinary.");
        setPhotoLoading(false);
        return;
      }

      // Generate a unique ID for the photo
      const photoId = generateId();

      // Save the photo metadata in Firestore
      const userId = firebase_auth.currentUser.uid;
      await savePhotoToFirestore(userId, showId, "movies", {
        id: photoId,
        imageUrl: secure_url,
        public_id: public_id,
        caption: "",
        timestamp: new Date().toISOString(),
      });

      // Update local state
      setPhotos((prevPhotos) => [
        ...prevPhotos,
        { id: photoId, imageUrl: secure_url, public_id, caption: "" },
      ]);

      // Save to device gallery if user granted permission
      await MediaLibrary.saveToLibraryAsync(photoUri);

      Alert.alert("Success", "Photo saved successfully!");
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to save photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const saveAndUsePhoto = async () => {
    if (!capturedImage) return;
    try {
      setIsUploading(true);

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(capturedImage.uri);

      // Pass the photo back to the parent screen
      onPhotoTaken(capturedImage.uri);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving photo:", error);
      Alert.alert("Error", "Failed to save photo.");
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle flash mode
  const toggleFlash = () => {
    setFlash((prevFlash) => (prevFlash === "off" ? "on" : "off"));
  };

  return (
    <View style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: capturedImage.uri }} style={styles.preview} />
          </View>
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={retakePicture}
            >
              <Ionicons name="refresh-outline" size={28} color="white" />
              <Text style={styles.previewButtonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.previewButton}
              onPress={saveAndUsePhoto}
              disabled={isUploading}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color="white"
              />
              <Text style={styles.previewButtonText}>
                {isUploading ? "Uploading..." : "Use Photo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <View style={styles.cameraWrapper}>
            <CameraView
              style={styles.camera}
              facing={facing}
              flashMode={flash}
              ref={cameraRef}
            />
          </View>
          <View style={styles.controlsContainer}>
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="close-outline" size={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={toggleFlash}
              >
                <Ionicons
                  name={flash === "off" ? "flash-outline" : "flash"}
                  size={28}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(facing === "back" ? "front" : "back")}
            >
              <Ionicons name="camera-reverse-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
  },
  message: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cameraWrapper: {
    height: "70%",
    overflow: "hidden",
    borderRadius: 20,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  controlButton: {
    padding: 10,
  },
  captureContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  flipButton: {
    alignSelf: "center",
    padding: 10,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
  },
  imageWrapper: {
    height: "70%",
    overflow: "hidden",
    borderRadius: 20,
  },
  preview: {
    flex: 1,
  },
  previewActions: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  previewButton: {
    alignItems: "center",
    backgroundColor: "gray",
    padding: 15,
    borderRadius: 10,
  },
  previewButtonText: {
    color: "white",
    marginTop: 5,
  },
});

export default CameraScreen;
