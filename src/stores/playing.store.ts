import {createStore} from 'zustand'
import {immer} from 'zustand/middleware/immer'

type PersistedState = { volume: number; playerSize: "BIG" | "SMALL" };
type EphemeralState = { currentUrl: string };
type State = PersistedState & EphemeralState;
type Actions = {
    setVolume: (volume: number) => void,
    setPlayerSize: (size: "BIG" | "SMALL") => void,
    setCurrentUrl: (url: string) => void
};

const StorageKeys = {
    VOLUME: "playing-volume",
    PLAYER_SIZE: "playing-playersize",
} as const;

export const playingStore = createStore<State & Actions>()(
    immer((set, _get) => ({
        volume: parseFloat(localStorage.getItem(StorageKeys.VOLUME) || "0.5"),
        setVolume: (volume: number) => set((state) => {
            state.volume = volume;
            localStorage.setItem(StorageKeys.VOLUME, volume.toString(10));
        }),

        playerSize: localStorage.getItem(StorageKeys.PLAYER_SIZE) as "BIG" | "SMALL" | undefined ?? "BIG",
        setPlayerSize: (size: "BIG" | "SMALL") => set((state) => {
            state.playerSize = size;
            localStorage.setItem(StorageKeys.PLAYER_SIZE, size);
        }),

        currentUrl: "",
        setCurrentUrl: (url: string) => set((state) => {
            state.currentUrl = url;
        }),
    })),
);