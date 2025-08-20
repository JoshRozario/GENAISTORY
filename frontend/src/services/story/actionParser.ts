// Service for parsing and extracting suggested actions from story content

export class ActionParserService {
  /**
   * Extract suggested actions from AI-generated story content
   */
  extractSuggestedActions(content: string): string[] {
    const lines = content.split('\n');
    const actions: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines starting with dash, bullet, or numbered options
      if (trimmed.match(/^[-•*]\s+/) || trimmed.match(/^\d+[\.)]\s+/)) {
        // Extract the action text, removing the prefix
        const action = trimmed
          .replace(/^[-•*]\s+/, '')
          .replace(/^\d+[\.)]\s+/, '')
          .trim();
        
        if (action.length > 3) { // Filter out very short actions
          actions.push(action);
        }
      }
    }
    
    return actions.slice(0, 6); // Limit to 6 actions max
  }

  /**
   * Clean and format action text for display
   */
  formatAction(action: string): string {
    // Remove quotes if present
    return action.replace(/^["']|["']$/g, '').trim();
  }

  /**
   * Validate if an action is reasonable (basic sanity check)
   */
  isValidAction(action: string): boolean {
    if (!action || action.length < 3) return false;
    if (action.length > 100) return false; // Too long
    
    // Check for basic action patterns
    const actionPatterns = [
      /^(go|walk|move|enter|exit|leave|approach|examine|look|search|talk|speak|ask|tell|take|grab|pick|use|try|attempt|cast|fight|attack|defend|run|flee|wait|rest|think|consider)/i
    ];
    
    return actionPatterns.some(pattern => pattern.test(action));
  }
}

export const actionParser = new ActionParserService();