import React from 'react';
import { Button, View } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function TestNotification() {
  const triggerTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification sent from your app!',
        data: { screen: 'Profile' }, // Optional data to handle navigation
      },
      trigger: { seconds: 1 }, // Show after 1 second
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button 
        title="Trigger Test Notification" 
        onPress={triggerTestNotification} 
      />
    </View>
  );
}
