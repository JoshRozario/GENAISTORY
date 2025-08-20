export type Event = {
  userId: string;
  videoId: string;
  timestamp: string; // ISO string
  payload?: any;
};

// Story System Types
export type Character = {
  id: string;
  name: string;
  description: string;
  knownToPlayer: boolean;
  attributes: Record<string, any>;
  relationships: Record<string, string>; // characterId -> relationship type
  secrets: string[]; // hidden from player
  role?: string;
  traits?: string[];
  currentLocation?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'tool' | 'consumable' | 'key' | 'misc' | 'container';
  quantity: number;
  properties: Record<string, any>;
};

export type Goal = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'failed' | 'hidden';
  progress: number; // 0-100
  knownToPlayer: boolean;
  requirements?: string[];
  rewards?: string[];
};

export type StoryBeat = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  playerVisible: boolean;
  order: number;
  requirements?: string[]; // required goals/events
  type?: string;
  status?: string;
  triggers?: string[];
  consequences?: string[];
};

export type StoryState = {
  currentLocation: string;
  worldState: Record<string, any>;
  playerStats: Record<string, number>;
  flags: Record<string, boolean>; // story flags
  lastUpdateTimestamp: string;
};

export type Story = {
  id: string;
  title: string;
  description: string;
  genre: string;
  theme: string;
  createdAt: string;
  lastPlayed: string;
  characters: Character[];
  inventory: InventoryItem[];
  goals: Goal[];
  beats: StoryBeat[];
  state: StoryState;
  storyLog: StorySegment[];
  isActive: boolean;
  playerName?: string;
};

export type StorySegment = {
  id: string;
  content: string;
  timestamp: string;
  playerInput?: string | null;
  stateChanges?: {
    inventoryChanges?: InventoryItem[];
    characterUpdates?: Partial<Character>[];
    goalUpdates?: Partial<Goal>[];
    stateUpdates?: Partial<StoryState>;
  };
  agentResponses?: any[];
  metadata?: Record<string, any>;
};

// Multi-Agent System Types
export type ContextPackage = {
  currentState: StoryState;
  knownCharacters: Character[];
  playerInventory: InventoryItem[];
  activeGoals: Goal[];
  recentEvents: StorySegment[];
  worldRules: string[];
  playerInput: string;
};

export type ValidationResult = {
  isValid: boolean;
  contradictions: string[];
  newFacts: string[];
  suggestedCorrections: string[];
  confidenceScore: number;
};

export type AgentResponse = {
  success: boolean;
  content: string;
  metadata?: Record<string, any>;
  error?: string;
};
