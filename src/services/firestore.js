// services/firestore.js
import { db } from "../../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from "firebase/firestore";
import { MAPS_API_KEY } from "../../firebaseConfig";
import * as FileSystem from "expo-file-system";

/**
 * Saves a movie or TV series to the user's watchlist in Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {object} item - The movie or TV series object.
 * @param {string} type - Either "movies" or "tvSeries".
 * @param {string} category - The category to save under (e.g. "Watched", "Plan to Watch").
 * @param {number} [rating=0] - User's rating for the item.
 * @param {string} [review=""] - User's review for the item.
 */
export const saveToWatchList = async (
  userId,
  item,
  type,
  category,
  rating = 0,
  review = ""
) => {
  try {
    await setDoc(
      doc(db, "users", userId, type, item.id.toString()),
      {
        ...item,
        title: type === "movies" ? item.title : item.name,
        releaseDate:
          type === "movies" ? item.release_date : item.first_air_date,
        type,
        category,
        rating,
        review,
      },
      { merge: true }
    );
    console.log(
      `${type === "movies" ? item.title : item.name} saved successfully!`
    );
  } catch (error) {
    console.error(`Error saving ${type}:`, error);
  }
};

/**
 * Saves the location where the user watched a show using Google Places API and stores it in Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string|number} showId - The ID of the movie or series.
 * @param {string} type - Either "movies" or "tvSeries".
 * @param {object} location - An object containing latitude, longitude, and title of the place.
 */
export const saveWatchLocation = async (userId, showId, type, location) => {
  try {
    if (!location || !location.latitude || !location.longitude) {
      console.error("Invalid location data.");
      return;
    }

    const { latitude, longitude, title } = location;

    // Use Google Places API to get place name and address
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1000&keyword=${title}&key=${MAPS_API_KEY}`;

    const response = await fetch(placesUrl);
    const data = await response.json();

    let address = "Unknown Address";
    let name = "Unknown Place";

    if (data.results && data.results.length > 0) {
      const place = data.results[0]; // Get the first result from the search
      const placeId = place.place_id;

      // Now, fetch detailed place info using the Place Details endpoint
      const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${MAPS_API_KEY}`;

      const detailsResponse = await fetch(placeDetailsUrl);
      const detailsData = await detailsResponse.json();

      if (detailsData.result) {
        const placeDetails = detailsData.result;
        name = placeDetails.name;
        address = placeDetails.formatted_address || "Unknown Address"; // Use formatted address
      }
    }

    const locationRef = doc(db, `users/${userId}/${type}`, showId.toString());

    // Save to Firestore
    await setDoc(
      locationRef,
      {
        location: {
          name,
          address,
          latitude,
          longitude,
          dateAdded: new Date(),
        },
      },
      { merge: true }
    );

    console.log("Location saved successfully!");
  } catch (error) {
    console.error("Error saving location:", error);
  }
};

/**
 * Saves a list of watched episodes for a specific season of a TV series in Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string|number} seriesId - The ID of the TV series.
 * @param {number} seasonNumber - The season number.
 * @param {Array<number>} watchedEps - An array of watched episode numbers.
 */
export const saveWatchedEpisodes = async (
  userId,
  seriesId,
  seasonNumber,
  watchedEps
) => {
  const docRef = doc(db, "users", userId, "tvSeries", seriesId.toString());
  const existingDoc = await getDoc(docRef);

  const seasonKey = `Season ${seasonNumber}`;

  let newWatchedData = { [seasonKey]: watchedEps };

  if (existingDoc.exists()) {
    const existingData = existingDoc.data().watchedEpisodes || {};
    newWatchedData = {
      ...existingData,
      [seasonKey]: watchedEps,
    };
  }

  await setDoc(docRef, { watchedEpisodes: newWatchedData }, { merge: true });
};

/**
 * Retrieves watched episodes for a TV series from Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string|number} seriesId - The ID of the TV series.
 * @returns {Promise<object>} - An object containing watched episodes by season.
 */
export const getWatchedEpisodes = async (userId, seriesId) => {
  const docRef = doc(db, "users", userId, "tvSeries", seriesId.toString());
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    return snapshot.data().watchedEpisodes || {};
  }

  return {};
};

/**
 * Retrieves all saved movies or TV series for a user from Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} type - Either "movies" or "tvSeries".
 * @returns {Promise<Array<object>>} - An array of saved items.
 */
export const getSavedShows = async (userId, type) => {
  try {
    const showsRef = collection(db, "users", userId, type);
    const querySnapshot = await getDocs(showsRef);
    const shows = [];
    querySnapshot.forEach((doc) => {
      shows.push(doc.data());
    });
    return shows;
  } catch (error) {
    console.error(`Error fetching saved ${type}:`, error);
    return [];
  }
};

/**
 * Retrieves all watched movies or TV series for a user (i.e., category === "Watched").
 *
 * @param {string} userId - The ID of the user.
 * @param {string} type - Either "movies" or "tvSeries".
 * @returns {Promise<Array<object>>} - An array of watched items.
 */
export const getWatchedShows = async (userId, type) => {
  try {
    const showsRef = collection(db, "users", userId, type);
    const q = query(showsRef, where("category", "==", "Watched"));
    const querySnapshot = await getDocs(q);
    const shows = [];
    querySnapshot.forEach((doc) => {
      shows.push(doc.data());
    });
    return shows;
  } catch (error) {
    console.error(`Error fetching saved ${type}:`, error);
    return [];
  }
};

/**
 * Retrieves detailed movie data for a user from Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string|number} movieId - The ID of the movie.
 * @returns {Promise<object|null>} - The movie data or null if not found.
 */
export const getMovieData = async (userId, movieId) => {
  const movieRef = doc(db, `users/${userId}/movies`, movieId.toString());
  const snapshot = await getDoc(movieRef);
  return snapshot.exists() ? snapshot.data() : null;
};

/**
 * Retrieves detailed TV series data for a user from Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string|number} seriesId - The ID of the TV series.
 * @returns {Promise<object|null>} - The TV series data or null if not found.
 */
export const getTVSeriesData = async (userId, seriesId) => {
  const seriesRef = doc(db, `users/${userId}/tvSeries`, seriesId.toString());
  const snapshot = await getDoc(seriesRef);
  return snapshot.exists() ? snapshot.data() : null;
};

/**
 * Updates the progress, rating, or review for a saved movie or TV series in Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string|number} showId - The ID of the movie or series.
 * @param {string} type - Either "movies" or "tvSeries".
 * @param {object} data - Object containing fields to update (e.g., progress, rating, review).
 */
export const updateShowProgress = async (userId, showId, type, data) => {
  try {
    const itemRef = doc(db, `users/${userId}/${type}`, showId.toString());
    await setDoc(itemRef, data, { merge: true });
    console.log(`${type} updated successfully!`);
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
  }
};

/**
 * Fetches the rating for a saved movie or TV series from Firestore.
 *
 * @param {string} userId - The ID of the user.
 * @param {string|number} showId - The ID of the movie or series.
 * @param {string} type - Either "movies" or "tvSeries".
 * @returns {Promise<number>} - The rating if it exists, or 0 by default.
 */
export const fetchRatings = async (userId, showId, type) => {
  try {
    const ratingRef = doc(db, `users/${userId}/${type}`, showId.toString());
    const ratingSnap = await getDoc(ratingRef);

    if (ratingSnap.exists()) {
      return ratingSnap.data().rating || 0; // Return rating if it exists, else return 0
    } else {
      return 0; // Default rating if not found
    }
  } catch (error) {
    console.error(`Error fetching ${type} rating:`, error);
    return 0;
  }
};

/**
 * Save a photo to the device
 * @param {string} uri - The local URI of the photo to save
 * @param {string} showId - The ID of the movie/show the photo belongs to
 * @returns {Promise<string>} - The new local URI of the saved photo
 */
export const savePhotoToDevice = async (uri, showId) => {
  try {
    const fileName = `${showId}_${Date.now()}.jpg`;
    const newUri = `${FileSystem.documentDirectory}photos/${fileName}`;

    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(
      `${FileSystem.documentDirectory}photos`
    );
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}photos`,
        { intermediates: true }
      );
    }

    // Copy file
    await FileSystem.copyAsync({ from: uri, to: newUri });
    return newUri;
  } catch (error) {
    console.error("Error saving photo to device:", error);
    throw new Error("Failed to save photo to device");
  }
};

/**
 * Save photo metadata to Firestore
 * @param {string} userId - The user ID
 * @param {string} showId - The movie/show ID
 * @param {string} type - 'movies' or 'series'
 * @param {object} photoData - The photo data to save (e.g., localUri, caption, timestamp)
 * @returns {Promise<string>} - ID of the saved photo document
 */
export const savePhotoToFirestore = async (userId, showId, type, photoData) => {
  try {
    const showRef = doc(db, `users/${userId}/${type}`, showId.toString());

    // Generate a Firestore timestamp manually
    const timestamp = Timestamp.now();

    // Add the photo to the `photos` array in the movie/show document
    await updateDoc(showRef, {
      photos: arrayUnion({
        ...photoData,
        createdAt: timestamp,
      }),
    });

    console.log("Photo metadata saved to Firestore");
  } catch (error) {
    console.error("Error saving photo metadata to Firestore:", error);
    throw new Error("Failed to save photo metadata to Firestore");
  }
};

/**
 * Get all photos for a specific show
 * @param {string} userId - The user ID
 * @param {string} showId - The movie/show ID
 * @param {string} type - 'movies' or 'series'
 * @returns {Promise<Array>} - Array of photo documents
 */
export const getShowPhotos = async (userId, showId, type) => {
  try {
    const showRef = doc(db, `users/${userId}/${type}`, showId.toString());
    const showSnapshot = await getDoc(showRef);

    if (showSnapshot.exists()) {
      const photos = showSnapshot.data().photos || [];
      return photos;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting photos from Firestore:", error);
    throw new Error("Failed to retrieve photos from Firestore");
  }
};

/**
 * Delete a photo from Firestore and the device
 * @param {string} userId - The user ID
 * @param {string} showId - The movie/show ID
 * @param {string} type - 'movies' or 'series'
 * @param {string} photoId - The photo document ID
 * @param {string} localUri - The local URI of the photo to delete
 */
export const deletePhoto = async (userId, showId, type, photoToDelete) => {
  try {
    const showRef = doc(db, `users/${userId}/${type}`, showId.toString());

    // Remove the photo from the `photos` array
    await updateDoc(showRef, {
      photos: arrayRemove(photoToDelete),
    });

    console.log("Photo deleted from Firestore");
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw new Error("Failed to delete photo");
  }
};
