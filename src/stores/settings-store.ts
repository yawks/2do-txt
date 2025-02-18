import { createContext, useContext } from "react";
import { getPreferencesItem, setPreferencesItem } from "@/utils/preferences";

import { createStore } from "zustand/vanilla";
import { getI18n } from "react-i18next";
import { useStore as useZustandStore } from "zustand";

export type Language = "de" | "en" | "fr";

export type ArchiveMode = "no-archiving" | "automatic" | "manual";

export type TaskView = "list" | "timeline";

export type PriorityTransformation = "keep" | "remove" | "archive";

const defaultReminderOffset = 1000 * 60 * 60 * 4; // 4h

export interface SettingsFields {
  createCreationDate: boolean;
  createCompletionDate: boolean;
  showNotifications: boolean;
  archiveMode: ArchiveMode;
  taskView: TaskView;
  priorityTransformation: PriorityTransformation;
  language: Language;
  reminderOffset: number;
}

interface SettingsState extends SettingsFields {
  toggleCreateCreationDate: () => void;
  toggleCreateCompletionDate: () => void;
  changeLanguage: (language: Language) => void;
  setShowNotifications: (showNotifications: boolean) => void;
  setArchiveMode: (archiveMode: ArchiveMode) => void;
  setTaskView: (taskView: TaskView) => void;
  setCompletedTaskPriority: (
    priorityTransformation: PriorityTransformation,
  ) => void;
  setReminderOffset: (ms: number) => void;
}

export type SettingsStore = ReturnType<typeof initializeSettingsStore>;

const zustandContext = createContext<SettingsStore | null>(null);

export const SettingsStoreProvider = zustandContext.Provider;

export async function settingsLoader(): Promise<SettingsFields> {
  const [
    createCreationDate,
    createCompletionDate,
    showNotifications,
    archiveMode,
    taskView,
    completedTaskPriority,
    language,
    reminderOffset,
  ] = await Promise.all([
    getPreferencesItem("create-creation-date"),
    getPreferencesItem("create-completion-date"),
    getPreferencesItem("show-notifications"),
    getPreferencesItem<ArchiveMode>("archive-mode"),
    getPreferencesItem<TaskView>("task-view"),
    getPreferencesItem<PriorityTransformation>("priority-transformation"),
    getPreferencesItem<Language>("language"),
    getPreferencesItem("reminder-offset"),
  ]);
  return {
    showNotifications: showNotifications === "true",
    createCreationDate:
      createCreationDate === null ? true : createCreationDate === "true",
    createCompletionDate:
      createCompletionDate === null ? true : createCompletionDate === "true",
    archiveMode: archiveMode || "no-archiving",
    taskView: taskView || "list",
    priorityTransformation: completedTaskPriority || "keep",
    language: language || "en",
    reminderOffset: reminderOffset
      ? parseInt(reminderOffset)
      : defaultReminderOffset,
  };
}

export function initializeSettingsStore(
  preloadedState: Partial<SettingsState> = {},
) {
  return createStore<SettingsState>((set) => ({
    createCreationDate: true,
    createCompletionDate: true,
    showNotifications: false,
    archiveMode: "no-archiving",
    taskView: "list",
    priorityTransformation: "keep",
    language: "en",
    reminderOffset: defaultReminderOffset,
    ...preloadedState,
    toggleCreateCreationDate: () =>
      set((state) => {
        const createCreationDate = !state.createCreationDate;
        setPreferencesItem(
          "create-creation-date",
          createCreationDate.toString(),
        );
        return {
          createCreationDate,
        };
      }),
    toggleCreateCompletionDate: () =>
      set((state) => {
        const createCompletionDate = !state.createCompletionDate;
        setPreferencesItem(
          "create-completion-date",
          createCompletionDate.toString(),
        );
        return {
          createCompletionDate,
        };
      }),
    changeLanguage: (language: Language) => {
      setPreferencesItem("language", language);
      getI18n().changeLanguage(language);
      set({ language });
    },
    setShowNotifications: (showNotifications: boolean) => {
      set({ showNotifications });
      setPreferencesItem("show-notifications", showNotifications.toString());
    },
    setArchiveMode: (archiveMode: ArchiveMode) => {
      set({ archiveMode });
      setPreferencesItem("archive-mode", archiveMode);
    },
    setTaskView: (taskView: TaskView) => {
      set({ taskView });
      setPreferencesItem("task-view", taskView);
    },
    setCompletedTaskPriority: (
      priorityTransformation: PriorityTransformation,
    ) => {
      set({ priorityTransformation });
      setPreferencesItem("priority-transformation", priorityTransformation);
    },
    setReminderOffset: (ms: number) => {
      set({ reminderOffset: ms });
      setPreferencesItem("reminder-offset", ms.toString());
    },
  }));
}

export function useSettingsStore<T = SettingsState>(
  selector: (state: SettingsState) => T = (state) => state as T,
) {
  const store = useContext(zustandContext);
  if (!store) throw new Error("Store is missing the provider");
  return useZustandStore(store, selector);
}
