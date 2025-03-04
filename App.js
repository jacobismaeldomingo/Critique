// App.js - Navigation Page
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Pressable } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import HomeScreen from "./src/screens/HomeScreen";
import WatchListScreen from "./src/screens/WatchListScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ShowDetailsScreen from "./src/screens/ShowDetailsScreen";
import { Ionicons } from "react-native-vector-icons"; // Icon Library
import { onAuthStateChanged } from "firebase/auth";
import { firebase_auth } from "./firebaseConfig";
import MovieDetailsScreen from "./src/screens/MovieDetailsScreen";
import TVSeriesDetailsScreen from "./src/screens/TVSeriesDetailsScreen";
import FullCastCrewScreen from "./src/screens/FullCastCrewScreen";
import SeriesEpisodeScreen from "./src/screens/SeriesEpisodeScreen";
import GenreScreen from "./src/screens/GenreScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack (Login and Signup)
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Signup"
      component={SignupScreen}
      options={{ headerTitle: "Sign Up", headerShown: false }}
    />
  </Stack.Navigator>
);

// Main Tabs Navigator (Home, WatchList, Profile)
const MainTabs = ({ navigation }) => {
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
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="WatchList" component={WatchListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// App Stack (Main Tabs, Settings, MovieDetails)
const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
    <Stack.Screen name="TVSeriesDetails" component={TVSeriesDetailsScreen} />
    <Stack.Screen name="FullCastCrew" component={FullCastCrewScreen} />
    <Stack.Screen name="SeriesEpisode" component={SeriesEpisodeScreen} />
    <Stack.Screen name="GenreScreen" component={GenreScreen} />
  </Stack.Navigator>
);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase_auth, (user) => {
      setUser(user);
    });

    // Clean up the subscription when the component is unmounted
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // User is signed in, show the AppStack
          <Stack.Screen
            name="App"
            component={AppStack}
            options={{ headerShown: false }}
          />
        ) : (
          // User is not signed in, show the AuthStack
          <Stack.Screen
            name="Auth"
            component={AuthStack}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
