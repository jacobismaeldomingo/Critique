// src/services/showNotifications.js
import { collection, query, where } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import * as Notifications from "expo-notifications";
import { checkForNewReleases } from "../services/tmdb";

// Helper function to get watched shows
export const getWatchedShows = async (userId, type) => {
  try {
    const showsRef = collection(db, "users", userId, type);
    const q = query(showsRef, where("category", "==", "Watched"));
    const querySnapshot = await getDocs(q);
    const shows = [];
    querySnapshot.forEach((doc) => {
      shows.push({ id: doc.id, ...doc.data() });
    });
    return shows;
  } catch (error) {
    console.error(`Error fetching watched ${type}:`, error);
    return [];
  }
};

// Main notification setup function
export async function setupShowNotifications(userId) {
  if (!userId) return;

  // Check for new releases daily
  const checkInterval = setInterval(async () => {
    try {
      // Get watched TV series
      const watchedSeries = await getWatchedShows(userId, "tvSeries");

      // Get watched movies
      const watchedMovies = await getWatchedShows(userId, "movies");

      // Check for new episodes in watched series
      for (const series of watchedSeries) {
        const hasNewEpisode = await checkForNewEpisode(series);
        if (hasNewEpisode) {
          await sendShowNotification(userId, {
            type: "tv",
            id: series.id,
            name: series.name,
            lastSeason: series.season,
            lastEpisode: series.episode,
          });

          // Update last checked date
          await updateLastChecked(userId, "tvSeries", series.id);
        }
      }

      // Check for theater releases of watched movies
      for (const movie of watchedMovies) {
        const isNowPlaying = await checkForTheaterRelease(movie);
        if (isNowPlaying) {
          await sendShowNotification(userId, {
            type: "movie",
            id: movie.id,
            title: movie.title,
          });

          // Update last checked date
          await updateLastChecked(userId, "movies", movie.id);
        }
      }
    } catch (error) {
      console.error("Error checking for new releases:", error);
    }
  }, 24 * 60 * 60 * 1000); // Check daily

  return () => clearInterval(checkInterval);
}

// Update last checked timestamp
async function updateLastChecked(userId, collectionName, docId) {
  try {
    const docRef = doc(db, "users", userId, collectionName, docId);
    await updateDoc(docRef, {
      lastChecked: new Date(),
    });
  } catch (error) {
    console.error("Error updating last checked:", error);
  }
}

// Check for new TV episodes
async function checkForNewEpisode(series) {
  try {
    const currentData = await checkForNewReleases(series);
    return (
      currentData.season > series.season ||
      (currentData.season === series.season &&
        currentData.episode > series.episode)
    );
  } catch (error) {
    console.error("Error checking for new episodes:", error);
    return false;
  }
}

// Check for movie theater release
async function checkForTheaterRelease(movie) {
  try {
    const releaseData = await checkForNewReleases(movie);
    const releaseDate = new Date(releaseData.theaterRelease);
    return releaseDate <= new Date();
  } catch (error) {
    console.error("Error checking theater release:", error);
    return false;
  }
}

// Send notification and store in Firestore
async function sendShowNotification(userId, show) {
  const notificationContent = {
    title:
      show.type === "tv"
        ? `New Episode Available!`
        : `Now Playing in Theaters!`,
    body:
      show.type === "tv"
        ? `${show.name} Season ${show.lastSeason} Episode ${
            show.lastEpisode + 1
          } is out!`
        : `${show.title} is now playing in theaters!`,
    type: show.type === "tv" ? "new_episode" : "new_movie",
    data: {
      screen: "ShowDetails",
      showId: show.id,
      type: show.type,
    },
  };

  // Store in Firestore
  const notificationsRef = collection(db, "users", userId, "notifications");
  await addDoc(notificationsRef, {
    ...notificationContent,
    createdAt: new Date(),
    read: false,
  });

  // Show in-app notification
  await Notifications.scheduleNotificationAsync({
    content: notificationContent,
    trigger: null, // Show immediately
  });
}
