import { create } from "zustand"

export interface UIState {
  activeWorkspaceId: string | null
  taskDetailPanelOpen: boolean
  taskDetailPanelTaskId: string | null
  sidebarOpen: boolean
  theme: "light" | "dark"

  setActiveWorkspaceId: (id: string | null) => void
  openTaskDetailPanel: (taskId: string) => void
  closeTaskDetailPanel: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: "light" | "dark") => void
}

export const useUIStore = create<UIState>((set) => ({
  activeWorkspaceId: null,
  taskDetailPanelOpen: false,
  taskDetailPanelTaskId: null,
  sidebarOpen: true,
  theme: "light",

  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  openTaskDetailPanel: (taskId) =>
    set({ taskDetailPanelOpen: true, taskDetailPanelTaskId: taskId }),
  closeTaskDetailPanel: () =>
    set({ taskDetailPanelOpen: false, taskDetailPanelTaskId: null }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))
