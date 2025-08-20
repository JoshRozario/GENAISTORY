import { Story, StorySegment, InventoryItem, Character, Goal, StoryState } from '../../../shared/types';

export class StateUpdater {
  /**
   * Update story state based on validated content
   */
  async updateStoryState(
    story: Story, 
    validatedContent: string, 
    playerInput: string
  ): Promise<Story> {
    const updatedStory = { ...story };
    
    // Create new story segment
    const newSegment = this.createStorySegment(validatedContent, playerInput);
    
    // Extract state changes from the content
    const stateChanges = await this.extractStateChanges(validatedContent, story);
    
    // Apply changes to story
    updatedStory.inventory = this.updateInventory(story.inventory, stateChanges.inventoryChanges);
    updatedStory.characters = this.updateCharacters(story.characters, stateChanges.characterUpdates);
    updatedStory.goals = this.updateGoals(story.goals, stateChanges.goalUpdates);
    updatedStory.state = this.updateWorldState(story.state, stateChanges.stateUpdates);
    
    // Add state changes to the segment
    newSegment.stateChanges = stateChanges;
    
    // Add segment to story log
    updatedStory.storyLog.push(newSegment);
    updatedStory.lastPlayed = new Date().toISOString();
    updatedStory.state.lastUpdateTimestamp = new Date().toISOString();
    
    return updatedStory;
  }

  /**
   * Create a new story segment
   */
  private createStorySegment(content: string, playerInput: string): StorySegment {
    return {
      id: this.generateId(),
      content,
      timestamp: new Date().toISOString(),
      playerInput,
      stateChanges: {
        inventoryChanges: [],
        characterUpdates: [],
        goalUpdates: [],
        stateUpdates: {}
      }
    };
  }

  /**
   * Extract state changes from story content
   */
  private async extractStateChanges(content: string, story: Story): Promise<{
    inventoryChanges: InventoryItem[];
    characterUpdates: Partial<Character>[];
    goalUpdates: Partial<Goal>[];
    stateUpdates: Partial<StoryState>;
  }> {
    return {
      inventoryChanges: this.extractInventoryChanges(content, story),
      characterUpdates: this.extractCharacterUpdates(content, story),
      goalUpdates: this.extractGoalUpdates(content, story),
      stateUpdates: this.extractStateUpdates(content, story)
    };
  }

  /**
   * Extract inventory changes from content
   */
  private extractInventoryChanges(content: string, story: Story): InventoryItem[] {
    const changes: InventoryItem[] = [];
    const contentLower = content.toLowerCase();
    
    // Detect item acquisition - more specific patterns to avoid false positives
    const acquisitionPatterns = [
      /you (?:find|discover|pick up|take|grab|acquire) (?:a |an |the )?([a-zA-Z\s\-]+)(?:\s+(?:from|in|on|under|behind))/gi,
      /you (?:are given|receive|obtain) (?:a |an |the )?([a-zA-Z\s\-]+)(?:\s+(?:from|by))/gi,
      /(?:a |an |the )?([a-zA-Z\s\-]+) (?:appears?|materializes?) in your (?:hand|inventory|pack|bag|pouch)/gi,
      /you (?:purchase|buy) (?:a |an |the )?([a-zA-Z\s\-]+)/gi,
      /you (?:loot|find) (?:a |an |the )?([a-zA-Z\s\-]+) (?:among|in|inside)/gi
    ];
    
    acquisitionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const itemName = this.extractItemName(match);
          if (itemName && this.isValidItem(itemName)) {
            const existingItem = story.inventory.find(item => 
              item.name.toLowerCase() === itemName.toLowerCase()
            );
            
            if (existingItem) {
              // Increase quantity of existing item
              changes.push({
                ...existingItem,
                quantity: existingItem.quantity + 1
              });
            } else {
              // Add new item
              changes.push({
                id: this.generateId(),
                name: itemName,
                description: `A ${itemName} you acquired during your adventure.`,
                type: this.guessItemType(itemName),
                quantity: 1,
                properties: {}
              });
            }
          }
        });
      }
    });
    
    // Detect item loss and usage
    const lossPatterns = [
      /you (?:lose|drop|break|destroy|give away|hand over) (?:your |the )?([a-zA-Z\s\-]+)/gi,
      /(?:your |the )?([a-zA-Z\s\-]+) (?:breaks?|shatters?|disappears?|is (?:lost|stolen|destroyed))/gi
    ];
    
    // Detect item usage/consumption
    const usagePatterns = [
      /you (?:use|consume|drink|eat|activate) (?:your |the )?([a-zA-Z\s\-]+)/gi,
      /you (?:apply|pour|sprinkle) (?:your |the )?([a-zA-Z\s\-]+)/gi,
      /(?:your |the )?([a-zA-Z\s\-]+) is (?:used up|consumed|depleted|empty)/gi
    ];
    
    lossPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const itemName = this.extractItemName(match);
          const existingItem = story.inventory.find(item => 
            item.name.toLowerCase().includes(itemName.toLowerCase())
          );
          
          if (existingItem && existingItem.quantity > 0) {
            changes.push({
              ...existingItem,
              quantity: Math.max(0, existingItem.quantity - 1)
            });
          }
        });
      }
    });
    
    // Process usage patterns (for consumables)
    usagePatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const itemName = this.extractUsageItemName(match);
          const existingItem = story.inventory.find(item => 
            item.name.toLowerCase().includes(itemName.toLowerCase())
          );
          
          if (existingItem && existingItem.quantity > 0) {
            // Only consume if it's a consumable type
            if (existingItem.type === 'consumable') {
              changes.push({
                ...existingItem,
                quantity: Math.max(0, existingItem.quantity - 1)
              });
            }
            // For non-consumables, track usage without removing (tools, keys, etc.)
          }
        });
      }
    });
    
    return changes;
  }

  /**
   * Extract character updates from content
   */
  private extractCharacterUpdates(content: string, story: Story): Partial<Character>[] {
    const updates: Partial<Character>[] = [];
    
    story.characters.forEach(character => {
      const charMentions = this.findCharacterMentions(content, character.name);
      
      if (charMentions.length > 0) {
        const update: Partial<Character> = { id: character.id };
        let hasUpdates = false;
        
        // Check if character becomes known to player
        if (!character.knownToPlayer && this.impliesCharacterIntroduction(content, character.name)) {
          update.knownToPlayer = true;
          hasUpdates = true;
        }
        
        // Extract new attributes or relationship changes
        const newAttributes = this.extractCharacterAttributes(content, character.name);
        if (Object.keys(newAttributes).length > 0) {
          update.attributes = { ...character.attributes, ...newAttributes };
          hasUpdates = true;
        }
        
        // Extract relationship changes
        const relationshipChanges = this.extractRelationshipChanges(content, character.name);
        if (Object.keys(relationshipChanges).length > 0) {
          update.relationships = { ...character.relationships, ...relationshipChanges };
          hasUpdates = true;
        }
        
        if (hasUpdates) {
          updates.push(update);
        }
      }
    });
    
    return updates;
  }

  /**
   * Extract goal updates from content
   */
  private extractGoalUpdates(content: string, story: Story): Partial<Goal>[] {
    const updates: Partial<Goal>[] = [];
    
    story.goals.forEach(goal => {
      const goalMention = this.findGoalMentions(content, goal.title);
      
      if (goalMention) {
        const update: Partial<Goal> = { id: goal.id };
        let hasUpdates = false;
        
        // Check for goal completion
        if (this.impliesGoalCompletion(content, goal.title)) {
          update.status = 'completed';
          update.progress = 100;
          hasUpdates = true;
        }
        
        // Check for goal failure
        if (this.impliesGoalFailure(content, goal.title)) {
          update.status = 'failed';
          hasUpdates = true;
        }
        
        // Check for progress updates
        const progressChange = this.extractProgressChange(content, goal.title);
        if (progressChange !== null) {
          update.progress = Math.min(100, Math.max(0, goal.progress + progressChange));
          hasUpdates = true;
        }
        
        // Check if goal becomes known to player
        if (!goal.knownToPlayer && this.impliesGoalDiscovery(content, goal.title)) {
          update.knownToPlayer = true;
          hasUpdates = true;
        }
        
        if (hasUpdates) {
          updates.push(update);
        }
      }
    });
    
    return updates;
  }

  /**
   * Extract world state updates from content
   */
  private extractStateUpdates(content: string, story: Story): Partial<StoryState> {
    const updates: Partial<StoryState> = {};
    
    // Check for location changes
    const newLocation = this.extractLocationChange(content);
    if (newLocation && newLocation !== story.state.currentLocation) {
      updates.currentLocation = newLocation;
    }
    
    // Check for stat changes
    const statChanges = this.extractStatChanges(content);
    if (Object.keys(statChanges).length > 0) {
      updates.playerStats = { ...story.state.playerStats, ...statChanges };
    }
    
    // Check for flag changes
    const flagChanges = this.extractFlagChanges(content);
    if (Object.keys(flagChanges).length > 0) {
      updates.flags = { ...story.state.flags, ...flagChanges };
    }
    
    return updates;
  }

  /**
   * Update inventory with changes
   */
  private updateInventory(currentInventory: InventoryItem[], changes: InventoryItem[]): InventoryItem[] {
    const updated = [...currentInventory];
    
    changes.forEach(change => {
      const existingIndex = updated.findIndex(item => item.id === change.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        updated[existingIndex] = { ...updated[existingIndex], ...change };
      } else {
        // Add new item
        updated.push(change);
      }
    });
    
    // Remove items with 0 quantity
    return updated.filter(item => item.quantity > 0);
  }

  /**
   * Update characters with changes
   */
  private updateCharacters(currentCharacters: Character[], updates: Partial<Character>[]): Character[] {
    const updated = [...currentCharacters];
    
    updates.forEach(update => {
      const existingIndex = updated.findIndex(char => char.id === update.id);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], ...update };
      }
    });
    
    return updated;
  }

  /**
   * Update goals with changes
   */
  private updateGoals(currentGoals: Goal[], updates: Partial<Goal>[]): Goal[] {
    const updated = [...currentGoals];
    
    updates.forEach(update => {
      const existingIndex = updated.findIndex(goal => goal.id === update.id);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], ...update };
      }
    });
    
    return updated;
  }

  /**
   * Update world state with changes
   */
  private updateWorldState(currentState: StoryState, updates: Partial<StoryState>): StoryState {
    return { ...currentState, ...updates };
  }

  // Helper methods for extraction logic
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private extractItemName(match: string): string {
    // Extract the actual item name from the regex match
    let itemName = match
      .replace(/you (?:find|discover|pick up|take|grab|acquire|lose|drop|break|destroy|give away|hand over|purchase|buy|loot|are given|receive|obtain) (?:a |an |the |your )?/gi, '')
      .replace(/(?:appears?|materializes?) in your (?:hand|inventory|pack|bag|pouch)/gi, '')
      .replace(/(?:\s+(?:from|in|on|under|behind|by|among|inside)).*$/gi, '') // Remove location/source info
      .trim();
    
    // Clean up any remaining artifacts
    itemName = itemName.replace(/^(?:a |an |the )/gi, '').trim();
    
    return itemName;
  }

  private extractUsageItemName(match: string): string {
    // Extract item name from usage patterns
    let itemName = match
      .replace(/you (?:use|consume|drink|eat|activate|apply|pour|sprinkle) (?:your |the )?/gi, '')
      .replace(/is (?:used up|consumed|depleted|empty)/gi, '')
      .trim();
    
    // Clean up any remaining artifacts
    itemName = itemName.replace(/^(?:a |an |the |your )/gi, '').trim();
    
    return itemName;
  }

  private isValidItem(itemName: string): boolean {
    // Enhanced validation to avoid false positives
    if (itemName.length < 2 || itemName.length > 50) return false;
    if (!/^[a-zA-Z\s\-]+$/.test(itemName)) return false;
    
    // Filter out common non-item phrases that match patterns
    const blacklistedPhrases = [
      'slow sip', 'quick look', 'deep breath', 'long glance', 'careful step',
      'moment', 'second', 'minute', 'hour', 'day', 'night', 'time',
      'breath', 'sip', 'drink', 'look', 'glance', 'step', 'walk', 'run',
      'word', 'words', 'sentence', 'phrase', 'sound', 'noise',
      'chance', 'opportunity', 'moment to think', 'pause', 'rest',
      'thought', 'idea', 'feeling', 'sense', 'impression'
    ];
    
    const itemLower = itemName.toLowerCase().trim();
    return !blacklistedPhrases.some(phrase => itemLower.includes(phrase));
  }

  private guessItemType(itemName: string): 'weapon' | 'tool' | 'consumable' | 'key' | 'misc' {
    const nameLower = itemName.toLowerCase();
    
    // Weapons
    if (/sword|blade|dagger|bow|axe|mace|spear|club|staff|wand/.test(nameLower)) return 'weapon';
    
    // Consumables (food, drinks, potions, etc.)
    if (/potion|elixir|food|bread|water|ale|beer|wine|drink|meal|soup|stew|fruit|meat|cheese/.test(nameLower)) return 'consumable';
    if (/breath|sip|gulp|bottle|flask|vial/.test(nameLower)) return 'consumable';
    
    // Keys and unlocking items
    if (/key|lockpick|pass|card/.test(nameLower)) return 'key';
    
    // Tools and equipment
    if (/tool|rope|hammer|shovel|pick|lantern|torch|map|compass|bag|pack|pouch/.test(nameLower)) return 'tool';
    
    // Default to misc for everything else
    return 'misc';
  }

  private findCharacterMentions(content: string, characterName: string): string[] {
    const mentions: string[] = [];
    const sentences = content.split(/[.!?]+/);
    
    // Create variations of the character name to match
    const nameVariations = [
      characterName.toLowerCase(),
      characterName.toLowerCase().split(' ')[0], // First name only
      characterName.toLowerCase().split(' ').pop() || characterName.toLowerCase() // Last name only
    ];
    
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      
      // Check if any variation of the character name is mentioned
      const isMentioned = nameVariations.some(nameVar => {
        // Use word boundaries to avoid partial matches
        const regex = new RegExp(`\\b${nameVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
        return regex.test(sentenceLower);
      });
      
      if (isMentioned) {
        mentions.push(sentence.trim());
      }
    });
    
    return mentions;
  }

  private impliesCharacterIntroduction(content: string, characterName: string): boolean {
    const contentLower = content.toLowerCase();
    const nameLower = characterName.toLowerCase();
    const firstName = nameLower.split(' ')[0];
    
    // Introduction patterns - more flexible matching
    const introPatterns = [
      `you meet ${nameLower}`,
      `you meet ${firstName}`,
      `${nameLower} introduces`,
      `${firstName} introduces`,
      `you encounter ${nameLower}`,
      `you encounter ${firstName}`,
      `you see ${nameLower}`,
      `you see ${firstName}`,
      `${nameLower} approaches`,
      `${firstName} approaches`,
      `${nameLower} speaks`,
      `${firstName} speaks`,
      `${nameLower} says`,
      `${firstName} says`,
      `a person named ${nameLower}`,
      `a person named ${firstName}`,
      `someone called ${nameLower}`,
      `someone called ${firstName}`
    ];
    
    return introPatterns.some(pattern => contentLower.includes(pattern));
  }

  private extractCharacterAttributes(content: string, characterName: string): Record<string, any> {
    // Simple attribute extraction - in real implementation, use NLP
    return {};
  }

  private extractRelationshipChanges(content: string, characterName: string): Record<string, string> {
    // Simple relationship extraction - in real implementation, use NLP
    return {};
  }

  private findGoalMentions(content: string, goalTitle: string): boolean {
    return content.toLowerCase().includes(goalTitle.toLowerCase());
  }

  private impliesGoalCompletion(content: string, goalTitle: string): boolean {
    const completionPatterns = [
      `${goalTitle} is complete`,
      `you have completed ${goalTitle}`,
      `${goalTitle} accomplished`
    ];
    
    return completionPatterns.some(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private impliesGoalFailure(content: string, goalTitle: string): boolean {
    const failurePatterns = [
      `${goalTitle} failed`,
      `impossible to ${goalTitle}`,
      `${goalTitle} cannot be done`
    ];
    
    return failurePatterns.some(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private extractProgressChange(content: string, goalTitle: string): number | null {
    // Simple progress detection - in real implementation, use more sophisticated methods
    if (content.toLowerCase().includes('progress') && content.toLowerCase().includes(goalTitle.toLowerCase())) {
      return 10; // Default progress increment
    }
    return null;
  }

  private impliesGoalDiscovery(content: string, goalTitle: string): boolean {
    const discoveryPatterns = [
      `you must ${goalTitle}`,
      `your mission is to ${goalTitle}`,
      `you need to ${goalTitle}`
    ];
    
    return discoveryPatterns.some(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private extractLocationChange(content: string): string | null {
    const locationPatterns = [
      /you (?:enter|arrive at|reach|travel to) (?:the )?([^,.!?]+)/gi,
      /you find yourself in (?:the )?([^,.!?]+)/gi
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1]?.trim() || null;
      }
    }
    
    return null;
  }

  private extractStatChanges(content: string): Record<string, number> {
    const changes: Record<string, number> = {};
    
    // Simple stat change detection
    const statPatterns = [
      /(?:health|hp) (?:increases?|goes up) by (\d+)/gi,
      /(?:health|hp) (?:decreases?|goes down) by (\d+)/gi,
      /you (?:gain|lose) (\d+) (?:health|hp)/gi
    ];
    
    // This is a simplified implementation
    return changes;
  }

  private extractFlagChanges(content: string): Record<string, boolean> {
    const changes: Record<string, boolean> = {};
    
    // Simple flag detection - in real implementation, use more sophisticated methods
    if (content.toLowerCase().includes('door opens')) {
      changes['door_opened'] = true;
    }
    
    if (content.toLowerCase().includes('secret revealed')) {
      changes['secret_discovered'] = true;
    }
    
    return changes;
  }
}