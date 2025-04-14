import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  SafeAreaView,
  Easing,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, firebase_auth } from "../../../firebaseConfig";
import * as Notifications from "expo-notifications";
import { ThemeContext } from "../../components/ThemeContext";
import { getTheme } from "../../components/theme";

const NotificationsScreen = ({ navigation }) => {
  const { user } = firebase_auth.currentUser;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const { theme } = useContext(ThemeContext);
  const colors = getTheme(theme);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const statsScale = useRef(new Animated.Value(0.8)).current;

  // Start animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.spring(statsScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, "users", user.uid, "notifications"),
        orderBy("createdAt", "desc")
      ),
      (snapshot) => {
        const notifs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date object
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setNotifications(notifs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const renderNotificationItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <Ionicons
          name={
            item.type === "new_episode"
              ? "tv-outline"
              : item.type === "confirmation"
              ? "mail-outline"
              : "notifications-outline"
          }
          size={24}
          color="#7850bf"
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationTime}>
          {item.createdAt?.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" • "}
          {item.createdAt?.toLocaleDateString([], {
            month: "short",
            day: "numeric",
          })}
        </Text>
      </View>
    </View>
  );

  const triggerTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification sent from your app!",
        data: { screen: "Profile" }, // Optional data to handle navigation
      },
      trigger: { seconds: 1 }, // Show after 1 second
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.headerBackground,
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.5 : 1,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back-outline" size={28} color="#fff" />
        </Pressable>

        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          Notifications
        </Text>
        <View style={{ width: 28 }} />
      </Animated.View>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Pressable
            onPress={triggerTestNotification}
            style={[styles.testButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.testButtonText}>Test Notification</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7850bf"
            style={styles.loader}
          />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  testButton: {
    marginTop: 5,
    padding: 10,
    borderRadius: 5,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  notificationIcon: {
    marginRight: 16,
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#333",
  },
  notificationBody: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});

export default NotificationsScreen;
