import { ContextPackage, AgentResponse } from '../../../shared/types';

export class StoryGenerator {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = process.env.DEEPSEEK_API_KEY || '', provider: 'deepseek' = 'deepseek') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  /**
   * Generate new story content based on context
   */
  async generateStorySegment(context: ContextPackage): Promise<AgentResponse> {
    try {
      const prompt = this.buildGenerationPrompt(context);
      const response = await this.callLLM(prompt);
      
      return {
        success: true,
        content: response,
        metadata: {
          promptLength: prompt.length,
          contextItemsCount: {
            characters: context.knownCharacters.length,
            inventory: context.playerInventory.length,
            goals: context.activeGoals.length,
            rules: context.worldRules.length
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Build the generation prompt with context
   */
  private buildGenerationPrompt(context: ContextPackage): string {
    return `You are a masterful storyteller creating an interactive narrative. Generate the next story segment based on the provided context and player input.

CONTEXT INFORMATION:
${this.formatContext(context)}

WRITING GUIDELINES:
1. Write 2-4 paragraphs of engaging narrative
2. Show, don't tell - use vivid descriptions and dialogue
3. Maintain consistency with ALL established facts
4. Reference relevant inventory items and characters naturally
5. Create opportunities for player agency and choice
6. End with a clear point for player response or decision
7. Stay true to the genre: ${context.worldRules.find(r => r.startsWith('Genre:')) || 'adventure'}

CRITICAL REQUIREMENTS:
- Do NOT contradict any established character details
- Do NOT introduce items not in the established world
- Do NOT change character personalities without reason
- Do NOT ignore active goals and ongoing plot threads
- Do NOT break the established world rules

Generate the next story segment now:`;
  }

  /**
   * Format context for the LLM prompt
   */
  private formatContext(context: ContextPackage): string {
    const sections = [];
    
    sections.push(`Current Location: ${context.currentState.currentLocation}`);
    
    if (context.knownCharacters.length > 0) {
      sections.push('\nKnown Characters:');
      context.knownCharacters.forEach(char => {
        sections.push(`- ${char.name}: ${char.description}`);
      });
    }
    
    if (context.playerInventory.length > 0) {
      sections.push('\nPlayer Inventory:');
      context.playerInventory.forEach(item => {
        sections.push(`- ${item.name} (${item.quantity}): ${item.description}`);
      });
    }
    
    if (context.activeGoals.length > 0) {
      sections.push('\nActive Goals:');
      context.activeGoals.forEach(goal => {
        sections.push(`- ${goal.title}: ${goal.description} (${goal.progress}% complete)`);
      });
    }
    
    if (context.recentEvents.length > 0) {
      sections.push('\nRecent Story Events:');
      context.recentEvents.forEach((event, i) => {
        sections.push(`${i + 1}. ${event.content.substring(0, 150)}...`);
      });
    }
    
    sections.push(`\nPlayer Input: "${context.playerInput}"`);
    
    return sections.join('\n');
  }

  /**
   * Call the DeepSeek API
   */
  private async callLLM(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured. Please set DEEPSEEK_API_KEY environment variable.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a masterful storyteller creating immersive interactive narratives. Write engaging, vivid prose that maintains consistency with established story elements. Always end with a clear opportunity for player choice or action.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from DeepSeek API');
      }

      return data.choices[0].message.content.trim();
      
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while calling DeepSeek API');
      }
    }
  }
}