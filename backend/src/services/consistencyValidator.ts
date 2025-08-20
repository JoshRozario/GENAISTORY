import { Story, ValidationResult, ContextPackage } from '../../../shared/types';

export class ConsistencyValidator {
  /**
   * Validate generated story content for consistency
   */
  async validateStoryContent(
    generatedContent: string, 
    context: ContextPackage, 
    story: Story
  ): Promise<ValidationResult> {
    const contradictions: string[] = [];
    const newFacts: string[] = [];
    const suggestedCorrections: string[] = [];
    
    // Check character consistency
    const characterIssues = this.validateCharacters(generatedContent, story.characters);
    contradictions.push(...characterIssues.contradictions);
    newFacts.push(...characterIssues.newFacts);
    
    // Check inventory consistency
    const inventoryIssues = this.validateInventory(generatedContent, story.inventory);
    contradictions.push(...inventoryIssues.contradictions);
    newFacts.push(...inventoryIssues.newFacts);
    
    // Check location consistency
    const locationIssues = this.validateLocation(generatedContent, story.state);
    contradictions.push(...locationIssues.contradictions);
    
    // Check goal consistency
    const goalIssues = this.validateGoals(generatedContent, story.goals);
    contradictions.push(...goalIssues.contradictions);
    
    // Generate corrections for found issues
    if (contradictions.length > 0) {
      suggestedCorrections.push(...this.generateCorrections(contradictions, context));
    }
    
    const confidenceScore = this.calculateConfidenceScore(contradictions.length, newFacts.length);
    
    return {
      isValid: contradictions.length === 0,
      contradictions,
      newFacts,
      suggestedCorrections,
      confidenceScore
    };
  }

  /**
   * Check for character-related inconsistencies
   */
  private validateCharacters(content: string, characters: any[]): { contradictions: string[], newFacts: string[] } {
    const contradictions: string[] = [];
    const newFacts: string[] = [];
    
    characters.forEach(char => {
      const charMentions = this.findCharacterMentions(content, char.name);
      
      charMentions.forEach(mention => {
        // Check if description matches established character
        if (this.contradictsCharacterDescription(mention, char.description)) {
          contradictions.push(`Character ${char.name} described inconsistently: "${mention}"`);
        }
        
        // Check for new character information
        const newInfo = this.extractNewCharacterInfo(mention, char);
        if (newInfo) {
          newFacts.push(`New character info for ${char.name}: ${newInfo}`);
        }
      });
    });
    
    // Check for new characters being introduced
    const newCharacters = this.detectNewCharacters(content, characters);
    newCharacters.forEach(newChar => {
      newFacts.push(`New character introduced: ${newChar}`);
    });
    
    return { contradictions, newFacts };
  }

  /**
   * Check for inventory-related inconsistencies
   */
  private validateInventory(content: string, inventory: any[]): { contradictions: string[], newFacts: string[] } {
    const contradictions: string[] = [];
    const newFacts: string[] = [];
    
    // Check if content mentions items not in inventory
    const mentionedItems = this.extractItemMentions(content);
    const playerInventoryNames = inventory.map(item => item.name.toLowerCase());
    
    mentionedItems.forEach(item => {
      if (!playerInventoryNames.includes(item.toLowerCase())) {
        // Could be a new item or a contradiction
        if (this.impliesPlayerPossession(content, item)) {
          contradictions.push(`Content implies player has "${item}" but it's not in inventory`);
        } else {
          newFacts.push(`New item mentioned: ${item}`);
        }
      }
    });
    
    return { contradictions, newFacts };
  }

  /**
   * Check for location-related inconsistencies
   */
  private validateLocation(content: string, state: any): { contradictions: string[] } {
    const contradictions: string[] = [];
    
    const currentLocation = state.currentLocation;
    const impliedLocations = this.extractLocationReferences(content);
    
    impliedLocations.forEach(location => {
      if (location !== currentLocation && this.impliesPlayerPresence(content, location)) {
        contradictions.push(`Content implies player is at "${location}" but current location is "${currentLocation}"`);
      }
    });
    
    return { contradictions };
  }

  /**
   * Check for goal-related inconsistencies
   */
  private validateGoals(content: string, goals: any[]): { contradictions: string[] } {
    const contradictions: string[] = [];
    
    goals.forEach(goal => {
      if (goal.status === 'completed' && this.impliesGoalIncomplete(content, goal.title)) {
        contradictions.push(`Content treats completed goal "${goal.title}" as incomplete`);
      }
      
      if (goal.status === 'failed' && this.impliesGoalActive(content, goal.title)) {
        contradictions.push(`Content treats failed goal "${goal.title}" as active`);
      }
    });
    
    return { contradictions };
  }

  /**
   * Find mentions of a character in the content
   */
  private findCharacterMentions(content: string, characterName: string): string[] {
    const mentions: string[] = [];
    const sentences = content.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (sentence.toLowerCase().includes(characterName.toLowerCase())) {
        mentions.push(sentence.trim());
      }
    });
    
    return mentions;
  }

  /**
   * Check if a mention contradicts established character description
   */
  private contradictsCharacterDescription(mention: string, establishedDescription: string): boolean {
    // Simple contradiction detection - in real implementation, use NLP
    const mentionLower = mention.toLowerCase();
    const descLower = establishedDescription.toLowerCase();
    
    // Check for obvious contradictions
    if (descLower.includes('tall') && mentionLower.includes('short')) return true;
    if (descLower.includes('friendly') && mentionLower.includes('hostile')) return true;
    if (descLower.includes('young') && mentionLower.includes('elderly')) return true;
    
    return false;
  }

  /**
   * Extract new character information from mention
   */
  private extractNewCharacterInfo(mention: string, character: any): string | null {
    // Simple extraction - in real implementation, use NLP
    const newDescriptors = ['wearing', 'carrying', 'holding', 'has', 'looks'];
    
    for (const descriptor of newDescriptors) {
      if (mention.toLowerCase().includes(descriptor)) {
        const parts = mention.split(descriptor);
        if (parts.length > 1) {
          return `${descriptor} ${parts[1].trim()}`;
        }
      }
    }
    
    return null;
  }

  /**
   * Detect new characters being introduced
   */
  private detectNewCharacters(content: string, existingCharacters: any[]): string[] {
    const newCharacters: string[] = [];
    const existingNames = existingCharacters.map(char => char.name.toLowerCase());
    
    // Simple detection of proper nouns that might be new characters
    const properNouns = content.match(/\b[A-Z][a-z]+\b/g) || [];
    
    properNouns.forEach(noun => {
      if (!existingNames.includes(noun.toLowerCase()) && 
          this.appearsToBeCharacter(content, noun)) {
        newCharacters.push(noun);
      }
    });
    
    return newCharacters;
  }

  /**
   * Check if a proper noun appears to be a character
   */
  private appearsToBeCharacter(content: string, noun: string): boolean {
    const context = content.toLowerCase();
    const nounLower = noun.toLowerCase();
    
    // Look for character-indicating words near the noun
    const characterIndicators = ['says', 'said', 'speaks', 'tells', 'asks', 'replies', 'looks', 'walks'];
    
    return characterIndicators.some(indicator => 
      context.includes(`${nounLower} ${indicator}`) || 
      context.includes(`${indicator} ${nounLower}`)
    );
  }

  /**
   * Extract item mentions from content
   */
  private extractItemMentions(content: string): string[] {
    // Simple item detection - look for common item patterns
    const itemPatterns = [
      /\b(sword|weapon|blade|dagger|bow|staff)\b/gi,
      /\b(potion|elixir|brew|medicine)\b/gi,
      /\b(key|lockpick|gem|coin|gold)\b/gi,
      /\b(armor|shield|helmet|boots|cloak)\b/gi,
      /\b(scroll|book|map|letter|note)\b/gi
    ];
    
    const items: string[] = [];
    itemPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        items.push(...matches);
      }
    });
    
    return [...new Set(items)]; // Remove duplicates
  }

  /**
   * Check if content implies player possession of an item
   */
  private impliesPlayerPossession(content: string, item: string): boolean {
    const possessionPhrases = [
      `your ${item}`,
      `you draw your ${item}`,
      `you use your ${item}`,
      `you reach for your ${item}`
    ];
    
    return possessionPhrases.some(phrase => 
      content.toLowerCase().includes(phrase.toLowerCase())
    );
  }

  /**
   * Extract location references from content
   */
  private extractLocationReferences(content: string): string[] {
    // Simple location detection
    const locationPatterns = [
      /\bin the ([^,.!?]+)\b/gi,
      /\bat the ([^,.!?]+)\b/gi,
      /\bnear the ([^,.!?]+)\b/gi
    ];
    
    const locations: string[] = [];
    locationPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const location = match.replace(/^(in|at|near) the /i, '');
          locations.push(location);
        });
      }
    });
    
    return locations;
  }

  /**
   * Check if content implies player presence at a location
   */
  private impliesPlayerPresence(content: string, location: string): boolean {
    const presenceIndicators = [
      `you are in the ${location}`,
      `you find yourself in the ${location}`,
      `you enter the ${location}`
    ];
    
    return presenceIndicators.some(indicator => 
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * Check if content implies a goal is incomplete when it should be complete
   */
  private impliesGoalIncomplete(content: string, goalTitle: string): boolean {
    // Simple check - in real implementation, use more sophisticated NLP
    return content.toLowerCase().includes(`still need to ${goalTitle.toLowerCase()}`);
  }

  /**
   * Check if content implies a goal is active when it should be failed
   */
  private impliesGoalActive(content: string, goalTitle: string): boolean {
    return content.toLowerCase().includes(`must ${goalTitle.toLowerCase()}`);
  }

  /**
   * Generate correction suggestions
   */
  private generateCorrections(contradictions: string[], context: ContextPackage): string[] {
    return contradictions.map(contradiction => 
      `Fix: ${contradiction} - Ensure consistency with established facts`
    );
  }

  /**
   * Calculate confidence score based on validation results
   */
  private calculateConfidenceScore(contradictionCount: number, newFactCount: number): number {
    const baseScore = 100;
    const contradictionPenalty = contradictionCount * 25;
    const newFactPenalty = newFactCount * 5;
    
    return Math.max(0, baseScore - contradictionPenalty - newFactPenalty);
  }
}