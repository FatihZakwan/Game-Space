import { create } from 'zustand'

interface GameState {
  score: number;
  combo: number;
  isStarted: boolean;
  handPos: [number, number];
  setHandPos: (pos: [number, number]) => void;
  addScore: (points: number) => void;
  resetGame: () => void;
  startGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  combo: 0,
  isStarted: false,
  handPos: [0, 1],
  setHandPos: (pos) => set({ handPos: pos }),
  addScore: (points) => set((state) => ({ score: state.score + points, combo: state.combo + 1 })),
  resetGame: () => set({ score: 0, combo: 0, isStarted: false }),
  startGame: () => set({ isStarted: true }),
}))