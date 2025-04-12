import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { firebase_auth, db } from "../../firebaseConfig";

/// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }

  // Get Expo push token (only this part is needed for in-app notifications)
  token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to Firestore
  if (firebase_auth.currentUser) {
    const userRef = doc(db, "users", firebase_auth.currentUser.uid);
    await setDoc(userRef, { notificationToken: token }, { merge: true });
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

// Listen for incoming notifications
function setupNotificationListeners(navigation) {
  // Foreground notifications
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log("Notification received:", notification);
    }
  );

  // Notification interactions
  const responseListener =
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification tapped:", response);
      const data = response.notification.request.content.data;
      if (data?.screen) {
        navigation.navigate(data.screen);
      }
    });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}

export { registerForPushNotificationsAsync, setupNotificationListeners };
