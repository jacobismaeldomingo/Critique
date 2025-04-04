import axios from "axios";

const CLOUD_NAME = "dimv8dzcp";
const UPLOAD_PRESET = "unsigned-upload-preset";
const CLOUD_API_KEY = "118562247484894";
const CLOUD_API_SECRET = "UF_MCXXvGHucV9RBS4aYyK6V7FU";

export const uploadImageToCloudinary = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg", // Adjust based on your image type
      name: "upload.jpg",
    });
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const { secure_url, public_id } = response.data;
    return { secure_url, public_id }; // This is the hosted image URL
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    return null;
  }
};
