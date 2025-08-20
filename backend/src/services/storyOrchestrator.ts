import { Story, AgentResponse } from '../../../shared/types';
import { ContextAgent } from './contextAgent';
import { StoryGenerator } from './storyGenerator';
import { ConsistencyValidator } from './consistencyValidator';
import { StateUpdater } from './stateUpdater';

export class StoryOrchestrator {
  private contextAgent: ContextAgent;
  private storyGenerator: StoryGenerator;
  private consistencyValidator: ConsistencyValidator;
  private stateUpdater: StateUpdater;

  constructor() {
    this.contextAgent = new ContextAgent();
    this.storyGenerator = new StoryGenerator();
    this.consistencyValidator = new ConsistencyValidator();
    this.stateUpdater = new StateUpdater();
  }

  /**
   * Generate next story segment using multi-agent pipeline
   */
  async generateStorySegment(story: Story, playerInput: string): Promise<{
    success: boolean;
    updatedStory?: Story;
    generatedContent?: string;
    error?: string;
    metadata?: any;
  }> {
    try {
      console.log('🚀 Starting story generation pipeline...');
      
      // Step 1: Build context
      console.log('📋 Context Agent: Building story context...');
      const context = await this.contextAgent.buildContext(story, playerInput);
      
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`✍️ Story Generator: Attempt ${attempts}/${maxAttempts}...`);
        
        // Step 2: Generate story content
        const generationResult = await this.storyGenerator.generateStorySegment(context);
        
        if (!generationResult.success) {
          console.log('❌ Story generation failed:', generationResult.error);
          return {
            success: false,
            error: `Story generation failed: ${generationResult.error}`
          };
        }
        
        console.log('✅ Story content generated');
        
        // Step 3: Validate consistency
        console.log('🔍 Consistency Validator: Checking for contradictions...');
        const validationResult = await this.consistencyValidator.validateStoryContent(
          generationResult.content,
          context,
          story
        );
        
        console.log(`📊 Validation score: ${validationResult.confidenceScore}%`);
        
        if (validationResult.isValid || validationResult.confidenceScore >= 70) {
          console.log('✅ Content validation passed');
          
          // Step 4: Update story state
          console.log('🔄 State Updater: Applying changes to story state...');
          const updatedStory = await this.stateUpdater.updateStoryState(
            story,
            generationResult.content,
            playerInput
          );
          
          console.log('✅ Story state updated successfully');
          
          return {
            success: true,
            updatedStory,
            generatedContent: generationResult.content,
            metadata: {
              attempts,
              validationScore: validationResult.confidenceScore,
              contradictions: validationResult.contradictions,
              newFacts: validationResult.newFacts,
              generationMetadata: generationResult.metadata
            }
          };
        } else {
          console.log('⚠️ Content validation failed:');
          console.log('  Contradictions:', validationResult.contradictions);
          console.log('  Suggested corrections:', validationResult.suggestedCorrections);
          
          if (attempts >= maxAttempts) {
            console.log('❌ Max attempts reached, using content with warnings');
            
            // Still update the story but with warnings
            const updatedStory = await this.stateUpdater.updateStoryState(
              story,
              generationResult.content,
              playerInput
            );
            
            return {
              success: true,
              updatedStory,
              generatedContent: generationResult.content,
              metadata: {
                attempts,
                validationScore: validationResult.confidenceScore,
                contradictions: validationResult.contradictions,
                newFacts: validationResult.newFacts,
                warnings: ['Content generated with consistency warnings'],
                generationMetadata: generationResult.metadata
              }
            };
          }
          
          // Add correction context for next attempt
          context.worldRules.push(
            ...validationResult.suggestedCorrections,
            'CRITICAL: Address the following contradictions:',
            ...validationResult.contradictions
          );
        }
      }
      
      return {
        success: false,
        error: 'Failed to generate consistent content after maximum attempts'
      };
      
    } catch (error) {
      console.error('💥 Story orchestrator error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new story with initial setup
   */
  async createNewStory(config: {
    title: string;
    description: string;
    genre: string;
    theme: string;
    initialLocation: string;
    playerName?: string;
  }): Promise<Story> {
    const storyId = this.generateId();
    const now = new Date().toISOString();
    
    const story: Story = {
      id: storyId,
      title: config.title,
      description: config.description,
      genre: config.genre,
      theme: config.theme,
      createdAt: now,
      lastPlayed: now,
      characters: [],
      inventory: [],
      goals: [],
      beats: [],
      state: {
        currentLocation: config.initialLocation,
        worldState: {},
        playerStats: {
          health: 100,
          energy: 100,
          experience: 0
        },
        flags: {},
        lastUpdateTimestamp: now
      },
      storyLog: [],
      isActive: true
    };
    
    // Generate initial story segment
    const initialResult = await this.generateStorySegment(
      story, 
      'Begin the adventure'
    );
    
    if (initialResult.success && initialResult.updatedStory) {
      return initialResult.updatedStory;
    } else {
      // Fallback to basic story if generation fails
      story.storyLog.push({
        id: this.generateId(),
        content: `Welcome to ${config.title}. Your adventure begins in ${config.initialLocation}. The world awaits your choices.`,
        timestamp: now,
        playerInput: 'Begin the adventure',
        stateChanges: {
          inventoryChanges: [],
          characterUpdates: [],
          goalUpdates: [],
          stateUpdates: {}
        }
      });
      
      return story;
    }
  }

  /**
   * Get story summary for player (filtering hidden information)
   */
  getPlayerView(story: Story): {
    title: string;
    description: string;
    currentLocation: string;
    playerStats: Record<string, number>;
    knownCharacters: any[];
    inventory: any[];
    activeGoals: any[];
    conversationHistory: Array<{
      id: string;
      type: 'player' | 'ai';
      content: string;
      timestamp: string;
    }>;
  } {
    // Build conversation history with alternating player/ai messages
    const conversationHistory: Array<{
      id: string;
      type: 'player' | 'ai';
      content: string;
      timestamp: string;
    }> = [];

    story.storyLog.forEach(segment => {
      // Add player input if it exists
      if (segment.playerInput && segment.playerInput.trim() !== '') {
        conversationHistory.push({
          id: `${segment.id}-player`,
          type: 'player',
          content: segment.playerInput,
          timestamp: segment.timestamp
        });
      }
      
      // Add AI response
      conversationHistory.push({
        id: `${segment.id}-ai`,
        type: 'ai',
        content: segment.content,
        timestamp: segment.timestamp
      });
    });

    return {
      title: story.title,
      description: story.description,
      currentLocation: story.state.currentLocation,
      playerStats: story.state.playerStats,
      knownCharacters: story.characters.filter(char => char.knownToPlayer),
      inventory: story.inventory.filter(item => item.quantity > 0),
      activeGoals: story.goals.filter(goal => goal.knownToPlayer && goal.status === 'active'),
      conversationHistory
    };
  }

  /**
   * Get admin view with all story information
   */
  getAdminView(story: Story): Story {
    return story;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}