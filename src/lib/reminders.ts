import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from './database';

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });

export async function requestReminderPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Expo SDK 58 exposes this enum on the Notifications namespace.
    // eslint-disable-next-line import/namespace
    await Notifications.setNotificationChannelAsync('livo-reminders', { name: 'Livo reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  const current = await Notifications.getPermissionsAsync();
  const status = current.status === 'granted' ? current : await Notifications.requestPermissionsAsync();
  return status.status === 'granted';
}

export async function scheduleReminder(reminder: Reminder): Promise<string | null> {
  if (!reminder.enabled || !(await requestReminderPermission())) return null;
  if (reminder.notificationId) await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
  const date = new Date(reminder.dueAt);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const trigger: Notifications.SchedulableNotificationTriggerInput = reminder.frequency === 'once'
    ? { type: Notifications.SchedulableTriggerInputTypes.DATE, date }
    : Platform.OS === 'android' && reminder.frequency === 'daily'
      ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute }
      : Platform.OS === 'android' && reminder.frequency === 'weekly'
        ? { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: date.getDay() + 1, hour, minute }
        : Platform.OS === 'android' && reminder.frequency === 'monthly'
          ? { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: date.getDate(), hour, minute }
          : { type: Notifications.SchedulableTriggerInputTypes.CALENDAR, hour, minute, ...(reminder.frequency === 'weekly' ? { weekday: date.getDay() + 1 } : {}), ...(reminder.frequency === 'monthly' ? { day: date.getDate() } : {}), repeats: true };
  return Notifications.scheduleNotificationAsync({ content: { title: reminder.title, body: reminder.notes || 'Livo reminder', sound: 'default' }, trigger });
}
