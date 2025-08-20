import { Story, ContextPackage, Character, InventoryItem, Goal, StorySegment } from '../../../shared/types';

export class ContextAgent {
  /**
   * Gather all relevant story context for LLM generation
   */
  async buildContext(story: Story, playerInput: string): Promise<ContextPackage> {
    const knownCharacters = story.characters.filter(char => char.knownToPlayer);
    const playerInventory = story.inventory.filter(item => item.quantity > 0);
    const activeGoals = story.goals.filter(goal => 
      goal.status === 'active' && goal.knownToPlayer
    );
    const recentEvents = story.storyLog.slice(-5); // Last 5 story segments
    
    const worldRules = this.extractWorldRules(story);
    
    return {
      currentState: story.state,
      knownCharacters,
      playerInventory,
      activeGoals,
      recentEvents,
      worldRules,
      playerInput
    };
  }

  /**
   * Extract established world rules and facts from story history
   */
  private extractWorldRules(story: Story): string[] {
    const rules: string[] = [];
    
    // Add basic world rules
    rules.push(`Genre: ${story.genre}`);
    rules.push(`Theme: ${story.theme}`);
    rules.push(`Current location: ${story.state.currentLocation}`);
    
    // Add character consistency rules
    story.characters.forEach(char => {
      if (char.knownToPlayer) {
        rules.push(`${char.name}: ${char.description}`);
      }
    });
    
    // Add inventory consistency
    story.inventory.forEach(item => {
      if (item.quantity > 0) {
        rules.push(`Player has ${item.quantity}x ${item.name}: ${item.description}`);
      }
    });
    
    // Add goal context
    story.goals.forEach(goal => {
      if (goal.knownToPlayer && goal.status === 'active') {
        rules.push(`Active goal: ${goal.title} - ${goal.description}`);
      }
    });
    
    // Add world state flags
    Object.entries(story.state.flags).forEach(([flag, value]) => {
      rules.push(`World state: ${flag} = ${value}`);
    });
    
    return rules;
  }

  /**
   * Build a formatted context string for LLM consumption
   */
  formatContextForLLM(context: ContextPackage): string {
    const sections = [
      '=== STORY CONTEXT ===',
      '',
      '## Current Situation',
      `Location: ${context.currentState.currentLocation}`,
      '',
      '## Player Stats',
      Object.entries(context.currentState.playerStats)
        .map(([stat, value]) => `${stat}: ${value}`)
        .join('\n'),
      '',
      '## Known Characters',
      ...context.knownCharacters.map(char => 
        `- ${char.name}: ${char.description}`
      ),
      '',
      '## Player Inventory',
      ...context.playerInventory.map(item => 
        `- ${item.name} (${item.quantity}x): ${item.description}`
      ),
      '',
      '## Active Goals',
      ...context.activeGoals.map(goal => 
        `- ${goal.title}: ${goal.description} (${goal.progress}% complete)`
      ),
      '',
      '## Recent Events',
      ...context.recentEvents.map((event, index) => 
        `${index + 1}. ${event.content.substring(0, 100)}...`
      ),
      '',
      '## World Rules (MUST MAINTAIN CONSISTENCY)',
      ...context.worldRules,
      '',
      '## Player Input',
      context.playerInput,
      '',
      '=== GENERATION REQUIREMENTS ===',
      '1. Maintain ALL established facts and character details',
      '2. Reference appropriate inventory items when relevant',
      '3. Progress active goals naturally',
      '4. Stay consistent with the genre and theme',
      '5. Build upon recent events logically',
      '6. Do not introduce contradictory information',
      ''
    ];
    
    return sections.join('\n');
  }
}