import { Story } from '../../../shared/types';
import { StoryOrchestrator } from './storyOrchestrator';

export class StoryService {
  private stories: Map<string, Story> = new Map();
  private orchestrator: StoryOrchestrator;

  constructor() {
    this.orchestrator = new StoryOrchestrator();
    this.initializeDefaultStory();
  }

  /**
   * Initialize a default test story
   */
  private async initializeDefaultStory(): Promise<void> {
    const defaultStory: Story = {
      id: 'test-story-001',
      title: 'The Mysterious Tavern',
      description: 'A fantasy adventure beginning in a mysterious tavern where strange things happen.',
      genre: 'fantasy',
      theme: 'mystery',
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      isActive: true,
      playerName: 'Adventurer',
      characters: [
        {
          id: 'char-001',
          name: 'Barkeep Magnus',
          description: 'A gruff but kind tavern owner with knowing eyes and silver hair.',
          role: 'npc',
          knownToPlayer: true,
          traits: ['wise', 'secretive', 'helpful'],
          currentLocation: 'The Crooked Crown Tavern',
          relationships: {},
          secrets: ['Knows about the hidden cellar', 'Former adventurer']
        }
      ],
      inventory: [
        {
          id: 'item-001',
          name: 'Worn Leather Pouch',
          description: 'A small leather pouch containing a few copper coins.',
          type: 'container',
          quantity: 1,
          properties: {
            value: 5,
            capacity: 10
          }
        }
      ],
      goals: [
        {
          id: 'goal-001',
          title: 'Discover the tavern\'s secret',
          description: 'Something mysterious is happening in this tavern. Find out what.',
          status: 'active',
          progress: 0,
          knownToPlayer: true,
          requirements: ['Talk to the barkeep', 'Explore the tavern'],
          rewards: ['Experience', 'New story path']
        }
      ],
      beats: [
        {
          id: 'beat-001',
          type: 'introduction',
          title: 'Arrival at the Tavern',
          description: 'Player enters the mysterious tavern',
          status: 'completed',
          triggers: ['story_start'],
          consequences: ['meet_barkeep', 'establish_setting']
        },
        {
          id: 'beat-002',
          type: 'exploration',
          title: 'First Investigation',
          description: 'Player begins to explore and ask questions',
          status: 'pending',
          triggers: ['player_investigates'],
          consequences: ['reveal_clue', 'npc_reaction']
        }
      ],
      state: {
        currentLocation: 'The Crooked Crown Tavern',
        worldState: {
          timeOfDay: 'evening',
          weather: 'stormy outside',
          tavernCrowded: true
        },
        playerStats: {
          health: 100,
          energy: 80,
          experience: 0
        },
        flags: {
          enteredTavern: true,
          spokeToBarkeep: false,
          discoveredSecret: false
        },
        lastUpdateTimestamp: new Date().toISOString()
      },
      storyLog: [
        {
          id: 'log-001',
          timestamp: new Date().toISOString(),
          playerInput: null,
          content: 'The storm drives you through the heavy wooden door of The Crooked Crown Tavern. Inside, flickering candlelight dances across weathered stone walls, and the air is thick with the scent of ale and mystery. The barkeep, a silver-haired man with knowing eyes, looks up from polishing a mug and nods in your direction. Rain patters against the diamond-paned windows as other patrons huddle over their drinks, speaking in hushed tones.',
          agentResponses: [],
          metadata: {
            generatedBy: 'default_story_creation',
            location: 'The Crooked Crown Tavern',
            npcsPresent: ['Barkeep Magnus'],
            itemsVisible: ['Worn Leather Pouch']
          }
        }
      ]
    };

    this.stories.set(defaultStory.id, defaultStory);
  }

  /**
   * Create a new story
   */
  async createStory(config: {
    title: string;
    description: string;
    genre: string;
    theme: string;
    initialLocation: string;
    playerName?: string;
  }): Promise<Story> {
    const story = await this.orchestrator.createNewStory(config);
    this.stories.set(story.id, story);
    return story;
  }

  /**
   * Get story by ID
   */
  getStory(storyId: string): Story | null {
    return this.stories.get(storyId) || null;
  }

  /**
   * Get all stories
   */
  getAllStories(): Story[] {
    return Array.from(this.stories.values());
  }

  /**
   * Get active stories only
   */
  getActiveStories(): Story[] {
    return this.getAllStories().filter(story => story.isActive);
  }

  /**
   * Generate next story segment
   */
  async continueStory(storyId: string, playerInput: string): Promise<{
    success: boolean;
    story?: Story;
    generatedContent?: string;
    error?: string;
    metadata?: any;
  }> {
    const story = this.getStory(storyId);
    
    if (!story) {
      return {
        success: false,
        error: 'Story not found'
      };
    }

    const result = await this.orchestrator.generateStorySegment(story, playerInput);
    
    if (result.success && result.updatedStory) {
      // Update stored story
      this.stories.set(storyId, result.updatedStory);
      
      return {
        success: true,
        story: result.updatedStory,
        generatedContent: result.generatedContent,
        metadata: result.metadata
      };
    } else {
      return {
        success: false,
        error: result.error
      };
    }
  }

  /**
   * Get player view of story (filtered for player)
   */
  getPlayerView(storyId: string): any {
    const story = this.getStory(storyId);
    
    if (!story) {
      return null;
    }

    return this.orchestrator.getPlayerView(story);
  }

  /**
   * Get admin view of story (full access)
   */
  getAdminView(storyId: string): Story | null {
    const story = this.getStory(storyId);
    
    if (!story) {
      return null;
    }

    return this.orchestrator.getAdminView(story);
  }

  /**
   * Update story (admin only)
   */
  updateStory(storyId: string, updates: Partial<Story>): Story | null {
    const story = this.getStory(storyId);
    
    if (!story) {
      return null;
    }

    const updatedStory = { ...story, ...updates };
    this.stories.set(storyId, updatedStory);
    
    return updatedStory;
  }

  /**
   * Delete story
   */
  deleteStory(storyId: string): boolean {
    return this.stories.delete(storyId);
  }

  /**
   * Archive story (set inactive)
   */
  archiveStory(storyId: string): Story | null {
    const story = this.getStory(storyId);
    
    if (!story) {
      return null;
    }

    story.isActive = false;
    this.stories.set(storyId, story);
    
    return story;
  }

  /**
   * Reset story to beginning
   */
  resetStory(storyId: string): Story | null {
    const story = this.getStory(storyId);
    
    if (!story) {
      return null;
    }

    // Reset story state but keep basic info
    const resetStory: Story = {
      ...story,
      characters: [],
      inventory: [],
      goals: [],
      beats: [],
      state: {
        currentLocation: story.storyLog[0]?.content.includes('begins in') 
          ? story.state.currentLocation 
          : 'unknown location',
        worldState: {},
        playerStats: {
          health: 100,
          energy: 100,
          experience: 0
        },
        flags: {},
        lastUpdateTimestamp: new Date().toISOString()
      },
      storyLog: [],
      lastPlayed: new Date().toISOString()
    };

    this.stories.set(storyId, resetStory);
    return resetStory;
  }

  /**
   * Get story statistics
   */
  getStoryStats(storyId: string): any {
    const story = this.getStory(storyId);
    
    if (!story) {
      return null;
    }

    return {
      totalSegments: story.storyLog.length,
      charactersKnown: story.characters.filter(char => char.knownToPlayer).length,
      charactersTotal: story.characters.length,
      inventoryItems: story.inventory.filter(item => item.quantity > 0).length,
      activeGoals: story.goals.filter(goal => goal.status === 'active').length,
      completedGoals: story.goals.filter(goal => goal.status === 'completed').length,
      currentLocation: story.state.currentLocation,
      lastPlayed: story.lastPlayed,
      playtime: this.calculatePlaytime(story)
    };
  }

  /**
   * Search stories by criteria
   */
  searchStories(criteria: {
    genre?: string;
    theme?: string;
    isActive?: boolean;
    title?: string;
  }): Story[] {
    let results = this.getAllStories();

    if (criteria.genre) {
      results = results.filter(story => 
        story.genre.toLowerCase().includes(criteria.genre!.toLowerCase())
      );
    }

    if (criteria.theme) {
      results = results.filter(story => 
        story.theme.toLowerCase().includes(criteria.theme!.toLowerCase())
      );
    }

    if (criteria.isActive !== undefined) {
      results = results.filter(story => story.isActive === criteria.isActive);
    }

    if (criteria.title) {
      results = results.filter(story => 
        story.title.toLowerCase().includes(criteria.title!.toLowerCase())
      );
    }

    return results;
  }

  /**
   * Export story data
   */
  exportStory(storyId: string, format: 'json' | 'text' = 'json'): string | null {
    const story = this.getStory(storyId);
    
    if (!story) {
      return null;
    }

    if (format === 'json') {
      return JSON.stringify(story, null, 2);
    } else {
      // Text format for reading
      const sections = [
        `# ${story.title}`,
        '',
        `**Genre:** ${story.genre}`,
        `**Theme:** ${story.theme}`,
        `**Description:** ${story.description}`,
        '',
        '## Story Progress',
        '',
        ...story.storyLog.map((segment, index) => [
          `### Segment ${index + 1}`,
          segment.playerInput ? `**Player:** ${segment.playerInput}` : '',
          segment.content,
          ''
        ]).flat(),
        '',
        '## Characters',
        ...story.characters.filter(char => char.knownToPlayer).map(char => 
          `- **${char.name}:** ${char.description}`
        ),
        '',
        '## Inventory',
        ...story.inventory.filter(item => item.quantity > 0).map(item => 
          `- ${item.name} (${item.quantity}): ${item.description}`
        ),
        '',
        '## Goals',
        ...story.goals.filter(goal => goal.knownToPlayer).map(goal => 
          `- ${goal.title} (${goal.status}, ${goal.progress}%): ${goal.description}`
        )
      ];
      
      return sections.join('\n');
    }
  }

  private calculatePlaytime(story: Story): string {
    if (story.storyLog.length === 0) {
      return '0 minutes';
    }

    const startTime = new Date(story.createdAt);
    const lastTime = new Date(story.lastPlayed);
    const diffMs = lastTime.getTime() - startTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }
}