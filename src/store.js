import { create } from 'zustand'

export const useAppStore = create(set => ({
  loginComplete: false,
  setLoginComplete: (v) => set({ loginComplete: v }),
  view: 'bio',
  setView: (v) => set({ view: v }),
}))