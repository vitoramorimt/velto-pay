"use client";

import { useEffect, useState, useTransition } from "react";
import { BellRing, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { subscribeToPushNotificationsAction } from "@/modules/notifications/application/notification-actions";

type NotificationPermissionBannerProps = {
  isPushAvailable: boolean;
  publicKey: string | null;
};

type PermissionState = "default" | "denied" | "granted" | "unsupported";

function urlBase64ToArrayBuffer(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = `${value}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return buffer;
}

function getPlatform(): string | null {
  return navigator.platform || null;
}

function getSupportState(isPushAvailable: boolean): PermissionState {
  if (
    !isPushAvailable ||
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {
    return "unsupported";
  }

  return Notification.permission;
}

export function NotificationPermissionBanner({
  isPushAvailable,
  publicKey,
}: NotificationPermissionBannerProps) {
  const [isPending, startTransition] = useTransition();
  const [permissionState, setPermissionState] =
    useState<PermissionState>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const supportState = getSupportState(isPushAvailable);

    setPermissionState(supportState);

    if (supportState !== "granted" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setIsSubscribed(Boolean(subscription)))
      .catch(() => setIsSubscribed(false));
  }, [isPushAvailable]);

  if (permissionState === "granted" && isSubscribed) {
    return null;
  }

  async function activateNotifications() {
    if (!publicKey || permissionState === "unsupported") {
      toast.info("As notificações ainda não estão disponíveis nesta versão.");
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionState(permission);

    if (permission === "denied") {
      toast.info(
        "Permissão negada. Você pode ativar notificações depois nas configurações do navegador.",
      );
      return;
    }

    if (permission !== "granted") {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const existingSubscription =
      await registration.pushManager.getSubscription();
    const subscription =
      existingSubscription ??
      (await registration.pushManager.subscribe({
        applicationServerKey: urlBase64ToArrayBuffer(publicKey),
        userVisibleOnly: true,
      }));
    const subscriptionJson = subscription.toJSON();
    const endpoint = subscription.endpoint;
    const p256dh = subscriptionJson.keys?.p256dh;
    const auth = subscriptionJson.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      toast.error("Não foi possível ativar notificações neste dispositivo.");
      return;
    }

    startTransition(() => {
      void subscribeToPushNotificationsAction({
        auth,
        endpoint,
        p256dh,
        platform: getPlatform(),
        userAgent: navigator.userAgent,
      }).then((result) => {
        if (result.status === "success") {
          setIsSubscribed(true);
          toast.success(result.message);
          return;
        }

        toast.error(result.message);
      });
    });
  }

  return (
    <section className="px-3 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 rounded-lg border border-accent/20 bg-accent/10 p-4 text-sm shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-accent/20 bg-background/70 text-accent">
            {permissionState === "denied" ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <BellRing className="h-5 w-5" />
            )}
          </span>
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              Ative notificações para receber alertas de vendas em tempo real.
            </p>
            <p className="mt-1 leading-6 text-muted-foreground">
              {permissionState === "denied"
                ? "As notificações foram bloqueadas neste navegador. Você pode liberar o acesso nas configurações do dispositivo."
                : "Receba avisos de vendas, pagamentos, reembolsos e chargebacks no app da Velto Pay."}
            </p>
          </div>
        </div>
        <Button
          className="w-full shrink-0 sm:w-auto"
          disabled={isPending || permissionState === "denied"}
          onClick={() => void activateNotifications()}
          type="button"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Ativar notificações
        </Button>
      </div>
    </section>
  );
}
