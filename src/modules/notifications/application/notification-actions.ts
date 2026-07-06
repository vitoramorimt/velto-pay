"use server";

import { revalidatePath } from "next/cache";

import type {
  NotificationPreferenceInput,
  PushSubscriptionInput,
} from "@/modules/notifications/domain/types";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  updateUserNotificationPreferences,
} from "@/modules/notifications/application/notification-use-cases";

export type NotificationActionResult = {
  message: string;
  status: "error" | "success";
};

function success(message: string): NotificationActionResult {
  return {
    message,
    status: "success",
  };
}

function error(message: string): NotificationActionResult {
  return {
    message,
    status: "error",
  };
}

function getActionErrorMessage(caughtError: unknown): string {
  return caughtError instanceof Error
    ? caughtError.message
    : "Não foi possível concluir a ação agora.";
}

export async function subscribeToPushNotificationsAction(
  input: PushSubscriptionInput,
): Promise<NotificationActionResult> {
  try {
    await subscribeToPushNotifications(input);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notificacoes");

    return success("Notificações ativadas com sucesso.");
  } catch (caughtError) {
    return error(getActionErrorMessage(caughtError));
  }
}

export async function unsubscribeFromPushNotificationsAction(
  endpoint: string,
): Promise<NotificationActionResult> {
  try {
    await unsubscribeFromPushNotifications(endpoint);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notificacoes");

    return success("Notificações desativadas neste dispositivo.");
  } catch (caughtError) {
    return error(getActionErrorMessage(caughtError));
  }
}

export async function markNotificationAsReadAction(
  notificationId: string,
): Promise<NotificationActionResult> {
  try {
    await markNotificationAsRead(notificationId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notificacoes");

    return success("Notificação marcada como lida.");
  } catch (caughtError) {
    return error(getActionErrorMessage(caughtError));
  }
}

export async function markAllNotificationsAsReadAction(): Promise<NotificationActionResult> {
  try {
    await markAllNotificationsAsRead();
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/notificacoes");

    return success("Todas as notificações foram marcadas como lidas.");
  } catch (caughtError) {
    return error(getActionErrorMessage(caughtError));
  }
}

export async function updateNotificationPreferencesAction(
  input: NotificationPreferenceInput,
): Promise<NotificationActionResult> {
  try {
    await updateUserNotificationPreferences(input);
    revalidatePath("/dashboard/notificacoes");

    return success("Preferências salvas.");
  } catch (caughtError) {
    return error(getActionErrorMessage(caughtError));
  }
}
