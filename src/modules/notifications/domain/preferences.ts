import { getNotificationPreferenceKey } from "@/modules/notifications/domain/messages";
import type {
  NotificationEventType,
  NotificationPreferenceInput,
} from "@/modules/notifications/domain/types";

export function isNotificationEnabledByPreferences(
  eventType: NotificationEventType,
  preferences: NotificationPreferenceInput,
): boolean {
  return preferences[getNotificationPreferenceKey(eventType)];
}
