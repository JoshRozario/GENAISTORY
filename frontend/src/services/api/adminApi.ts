// Admin-specific API operations
import type { Story } from '../../types/story';

export class AdminApiService {
  private baseUrl = '/api/stories';

  async updateStoryComponent(storyId: string, componentType: string, componentId: string | undefined, data: any): Promise<void> {
    let url = `${this.baseUrl}/${storyId}/admin/${componentType}`;
    let method = 'POST';
    
    if (componentId) {
      url += `/${componentId}`;
      method = 'PUT';
    }

    // Clean up data for inventory items
    if (componentType === 'inventory' && data.properties) {
      const cleanedProperties = Object.entries(data.properties)
        .filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      data.properties = cleanedProperties;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save ${componentType}: ${response.statusText}`);
    }
  }

  async deleteStoryComponent(storyId: string, componentType: string, componentId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${storyId}/admin/${componentType}/${componentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${componentType}: ${response.statusText}`);
    }
  }

  async exportStory(storyId: string, format: 'json' | 'text'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${storyId}/export?format=${format}`);
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `story_export.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  async resetStory(storyId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${storyId}/reset`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Reset failed: ${response.statusText}`);
    }
  }

  async deleteStory(storyId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${storyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete story: ${response.statusText}`);
    }
  }
}

export const adminApi = new AdminApiService();