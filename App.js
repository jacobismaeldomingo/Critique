// App.js - Navigation Page
import React, { useEffect, useState, useRef, useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { Ionicons } from "react-native-vector-icons"; // Icon Library
import { onAuthStateChanged } from "firebase/auth";
import { firebase_auth } from "./firebaseConfig";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  setupNotificationListeners,
} from "./src/components/Notifications";
import { setupShowNotifications } from "./src/components/ShowNotifcations";
import { ThemeProvider, ThemeContext } from "./src/components/ThemeContext";
import { getTheme } from "./src/components/theme";

import LoginScreen from "./src/screens/authentication/LoginScreen.js";
import SignupScreen from "./src/screens/authentication/SignupScreen.js";
import HomeScreen from "./src/screens/HomeScreen";
import WatchListScreen from "./src/screens/WatchListScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/settings/SettingsScreen.js";
import MovieDetailsScreen from "./src/screens/shows/MovieDetailsScreen.js";
import TVSeriesDetailsScreen from "./src/screens/shows/TVSeriesDetailsScreen.js";
import FullCastCrewScreen from "./src/screens/shows/FullCastCrewScreen.js";
import SeasonScreen from "./src/screens/shows/SeasonScreen.js";
import GenreScreen from "./src/screens/showlists/GenreScreen.js";
import ForgotPasswordScreen from "./src/screens/authentication/ForgotPasswordScreen.js";
import ResetPasswordScreen from "./src/screens/settings/ResetPasswordScreen.js";
import TrendingListScreen from "./src/screens/showlists/TrendingListScreen.js";
import WatchedListScreen from "./src/screens/watchlists/WatchedListScreen.js";
import InProgressListScreen from "./src/screens/watchlists/InProgressListScreen.js";
import PlanToWatchListScreen from "./src/screens/watchlists/PlanToWatchListScreen.js";
import MapScreen from "./src/screens/shows/MapScreen.js";
import PhotoGalleryScreen from "./src/screens/camera/PhotoGalleryScreen.js";
import CameraScreen from "./src/screens/camera/CameraScreen.js";
import PhotoViewerScreen from "./src/screens/camera/PhotoViewerScreen.js";
import NotificationsScreen from "./src/screens/settings/NotificationsScreen.js";
import AboutScreen from "./src/screens/settings/AboutScreen.js";
import PopularListScreen from "./src/screens/showlists/PopularListScreen.js";
import NowPlayingListScreen from "./src/screens/showlists/NowPlayingListScreen.js";
import TestNotification from "./src/components/TestNotifications";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (Login and Signup)
const AuthStack = () => {
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

// Main Tabs Navigator (Home, WatchList, Profile)
const MainTabs = () => {
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "WatchList") {
            iconName = "bookmark-outline";
          } else if (route.name === "Profile") {
            iconName = "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: colors.headerBackground,
          paddingTop: 10,
        },
        headerShown: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: colors.gray,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="WatchList" component={WatchListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// App Stack
const AppStack = () => {
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="TVSeriesDetails" component={TVSeriesDetailsScreen} />
      <Stack.Screen name="FullCastCrew" component={FullCastCrewScreen} />
      <Stack.Screen name="Season" component={SeasonScreen} />
      <Stack.Screen name="Genres" component={GenreScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="TrendingList" component={TrendingListScreen} />
      <Stack.Screen name="PopularList" component={PopularListScreen} />
      <Stack.Screen name="NowPlayingList" component={NowPlayingListScreen} />
      <Stack.Screen name="WatchedList" component={WatchedListScreen} />
      <Stack.Screen name="InProgressList" component={InProgressListScreen} />
      <Stack.Screen name="PlanToWatchList" component={PlanToWatchListScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="PhotoGallery" component={PhotoGalleryScreen} />
      <Stack.Screen name="Camera" component={CameraScreen} />
      <Stack.Screen name="PhotoViewer" component={PhotoViewerScreen} />
      <Stack.Screen name="TestNotification" component={TestNotification} />
    </Stack.Navigator>
  );
};

// Main App component with ThemeProvider
function AppContent() {
  const [user, setUser] = useState(null);
  const navigationRef = useRef();
  const notificationListener = useRef();
  const showNotificationCleanup = useRef();
  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);
  const navigationTheme =
    theme === "dark"
      ? {
          ...NavigationDarkTheme,
          colors: {
            ...NavigationDarkTheme.colors,
            background: colors.background,
            text: colors.text,
            primary: colors.primary,
            border: colors.gray,
            notification: colors.primary,
            card: colors.background,
          },
        }
      : {
          ...NavigationDefaultTheme,
          colors: {
            ...NavigationDefaultTheme.colors,
            background: colors.background,
            text: colors.text,
            primary: colors.primary,
            border: colors.gray,
            notification: colors.primary,
            card: colors.background,
          },
        };

  // Configure notification handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Register for push notifications
    registerForPushNotificationsAsync();

    return () => {
      // Clean up any existing listeners
      if (notificationListener.current) {
        notificationListener.current();
      }
      if (showNotificationCleanup.current) {
        showNotificationCleanup.current();
      }
    };
  }, []);

  // Handle auth state changes and notification setup
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(firebase_auth, async (user) => {
      setUser(user);

      // Clean up previous notification listeners
      if (notificationListener.current) {
        notificationListener.current();
      }
      if (showNotificationCleanup.current) {
        showNotificationCleanup.current();
      }

      if (user) {
        // Setup notification listeners
        notificationListener.current = setupNotificationListeners(
          navigationRef.current
        );

        // Setup show notifications watcher
        showNotificationCleanup.current = await setupShowNotifications(
          user.uid
        );
      }
    });

    return () => {
      authUnsubscribe();
      if (notificationListener.current) {
        notificationListener.current();
      }
      if (showNotificationCleanup.current) {
        showNotificationCleanup.current();
      }
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator>
        {user ? (
          // User is signed in, show the AppStack
          <Stack.Screen
            name="App"
            component={AppStack}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          // User is not signed in, show the AuthStack
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
