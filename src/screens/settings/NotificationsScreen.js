import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ActivityIndicator,
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

const NotificationsScreen = ({ navigation }) => {
  const { user } = firebase_auth.currentUser;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <View style={styles.upperContainer} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back-outline"
              size={28}
              color="black"
              style={{ marginRight: 50 }}
            />
          </Pressable>
          <View style={styles.headerWrapper}>
            <Text style={styles.header}>Notifications</Text>
          </View>
        </View>
        <View style={styles.divider} />

        <View style={{ alignItems: "center", justifyContent: "center" }}>
          <Pressable
            onPress={() => navigation.navigate("TestNotification")}
            style={styles.testButton}
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
    </>
  );
};

const styles = StyleSheet.create({
  upperContainer: {
    paddingBottom: 60,
    backgroundColor: "#7850bf",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    padding: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  headerWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  divider: {
    borderBottomColor: "#9E9E9E",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  testButton: {
    marginTop: 5,
    padding: 5,
    backgroundColor: "#7850bf20",
    borderRadius: 5,
  },
  testButtonText: {
    color: "#7850bf",
    fontSize: 12,
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
