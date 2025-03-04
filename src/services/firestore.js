// services/firestore.js
import { db } from "../../firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

// Save a new movie or TV series to the user's collection.
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

// Get all saved movies or TV series for a user.
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

// Get all saved movies or TV series for a user that they have watched already.
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

export const getMovieData = async (userId, movieId) => {
  const movieRef = doc(db, `users/${userId}/movies`, movieId.toString());
  const snapshot = await getDoc(movieRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const getTVSeriesData = async (userId, seriesId) => {
  const seriesRef = doc(db, `users/${userId}/tvSeries`, seriesId.toString());
  const snapshot = await getDoc(seriesRef);
  return snapshot.exists() ? snapshot.data() : null;
};

// Update the progress, review, or rating for a movie or TV series.
export const updateShowProgress = async (userId, showId, type, data) => {
  try {
    const itemRef = doc(db, `users/${userId}/${type}`, showId.toString());
    await setDoc(itemRef, data, { merge: true });
    console.log(`${type} updated successfully!`);
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
  }
};

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
