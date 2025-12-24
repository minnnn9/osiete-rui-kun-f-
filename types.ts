
export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SETTINGS = 'SETTINGS',
  LOAD = 'LOAD',
  ACHIEVEMENTS = 'ACHIEVEMENTS'
}

export type ModalType = 'help' | 'settings' | 'achievements' | 'save' | null;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DialoguePart {
  speaker: string;
  text: string;
  emotion?: string;
}

export interface Scene {
  background: string;
  character: string;
  dialogue: DialoguePart[];
}

export interface GameContext {
  playerName: string;
  history: DialoguePart[];
}
