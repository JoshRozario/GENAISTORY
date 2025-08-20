// Centralized type definitions for the story domain

export interface ConversationMessage {
  id: string;
  type: 'player' | 'ai';
  content: string;
  timestamp: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  knownToPlayer: boolean;
  attributes: Record<string, any>;
  relationships: Record<string, string>;
  secrets: string[];
  role?: string;
  traits?: string[];
  currentLocation?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'tool' | 'consumable' | 'key' | 'misc' | 'container';
  quantity: number;
  properties: Record<string, any>;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'hidden';
  progress: number;
  knownToPlayer: boolean;
  requirements?: string[];
  rewards?: string[];
}

export interface StoryBeat {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  playerVisible: boolean;
  order: number;
  requirements?: string[];
  type?: string;
  status?: string;
  triggers?: string[];
  consequences?: string[];
}

export interface PlayerStats {
  [key: string]: number;
}

export interface StoryState {
  currentLocation: string;
  worldState: Record<string, any>;
  playerStats: PlayerStats;
  flags: Record<string, boolean>;
  lastUpdateTimestamp: string;
}

export interface PlayerView {
  title: string;
  description: string;
  currentLocation: string;
  playerStats: PlayerStats;
  knownCharacters: Character[];
  inventory: InventoryItem[];
  activeGoals: Goal[];
  conversationHistory: ConversationMessage[];
}

export interface Story {
  id: string;
  title: string;
  description: string;
  genre: string;
  theme: string;
  lastPlayed: string;
  isActive: boolean;
  characters: Character[];
  inventory: InventoryItem[];
  goals: Goal[];
  beats: StoryBeat[];
  state: StoryState;
  storyLog: any[];
}

export interface CreateStoryRequest {
  title: string;
  description: string;
  genre: string;
  theme: string;
  initialLocation: string;
  playerName?: string;
}

export interface ContinueStoryRequest {
  playerInput: string;
}

export interface StoryGenerationStep {
  step: string;
  message: string;
}