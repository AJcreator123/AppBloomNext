import React, { createContext, useContext, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

type Status = "granted" | "denied" | "undetermined";

type Ctx = {
  status: Status;
  requestPermission: () => Promise<void>;
  openSettings: () => Promise<void>;
};

const NotificationContext = createContext<Ctx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("undetermined");

  const refresh = async () => {
    const perms = await Notifications.getPermissionsAsync();
    setStatus(perms.status);
  };

  useEffect(() => {
    refresh();
  }, []);

  const requestPermission = async () => {
    if (!Device.isDevice) return;

    const res = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlerts: true,
        allowSound: true,
        allowBadge: true,
      },
    });

    setStatus(res.status);
  };

  const openSettings = async () => {
    await Notifications.openSettings();
  };

  return (
    <NotificationContext.Provider
      value={{ status, requestPermission, openSettings }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }
  return ctx;
}
