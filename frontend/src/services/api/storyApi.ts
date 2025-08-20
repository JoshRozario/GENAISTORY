// Centralized API service for story operations
import type { Story, PlayerView, CreateStoryRequest, ContinueStoryRequest } from '../../types/story';

export class StoryApiService {
  private baseUrl = '/api/stories';

  async getAllStories(): Promise<{ stories: Story[] }> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch stories: ${response.statusText}`);
    }
    return response.json();
  }

  async getStory(storyId: string): Promise<{ story: PlayerView }> {
    const response = await fetch(`${this.baseUrl}/${storyId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch story: ${response.statusText}`);
    }
    return response.json();
  }

  async getAdminStory(storyId: string): Promise<{ story: Story }> {
    const response = await fetch(`${this.baseUrl}/${storyId}/admin`);
    if (!response.ok) {
      throw new Error(`Failed to fetch admin story: ${response.statusText}`);
    }
    return response.json();
  }

  async createStory(storyData: CreateStoryRequest): Promise<{ story: Story }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create story: ${response.statusText}`);
    }

    return response.json();
  }

  async continueStory(storyId: string, request: ContinueStoryRequest): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${storyId}/continue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to continue story: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteStory(storyId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${storyId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete story: ${response.statusText}`);
    }
  }

  async exportStory(storyId: string, format: 'json' | 'text'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/${storyId}/export?format=${format}`);
    if (!response.ok) {
      throw new Error(`Failed to export story: ${response.statusText}`);
    }
    return response.blob();
  }

  async resetStory(storyId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${storyId}/reset`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to reset story: ${response.statusText}`);
    }
  }
}

// Singleton instance
export const storyApi = new StoryApiService();