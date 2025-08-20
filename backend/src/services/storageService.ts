import fs from 'fs';
import path from 'path';
import { Story } from '../../../shared/types';

export class StorageService {
  private storiesDir: string;
  private backupDir: string;

  constructor() {
    this.storiesDir = path.join(process.cwd(), 'data', 'stories');
    this.backupDir = path.join(process.cwd(), 'data', 'backups');
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure required directories exist
   */
  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.storiesDir)) {
      fs.mkdirSync(this.storiesDir, { recursive: true });
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Save a story to file
   */
  async saveStory(story: Story): Promise<void> {
    try {
      const filePath = path.join(this.storiesDir, `${story.id}.json`);
      const storyData = {
        ...story,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      };
      
      // Create backup if file exists
      if (fs.existsSync(filePath)) {
        await this.createBackup(story.id);
      }
      
      await fs.promises.writeFile(filePath, JSON.stringify(storyData, null, 2), 'utf8');
    } catch (error) {
      console.error(`Failed to save story ${story.id}:`, error);
      throw new Error(`Failed to save story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load a story from file
   */
  async loadStory(storyId: string): Promise<Story | null> {
    try {
      const filePath = path.join(this.storiesDir, `${storyId}.json`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const storyData = JSON.parse(fileContent);
      
      // Remove storage metadata
      const { lastSaved, version, ...story } = storyData;
      
      return story as Story;
    } catch (error) {
      console.error(`Failed to load story ${storyId}:`, error);
      throw new Error(`Failed to load story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load all stories from files
   */
  async loadAllStories(): Promise<Story[]> {
    try {
      const files = await fs.promises.readdir(this.storiesDir);
      const storyFiles = files.filter(file => file.endsWith('.json'));
      
      const stories: Story[] = [];
      
      for (const file of storyFiles) {
        const storyId = path.basename(file, '.json');
        const story = await this.loadStory(storyId);
        if (story) {
          stories.push(story);
        }
      }
      
      return stories;
    } catch (error) {
      console.error('Failed to load all stories:', error);
      return [];
    }
  }

  /**
   * Delete a story file
   */
  async deleteStory(storyId: string): Promise<boolean> {
    try {
      const filePath = path.join(this.storiesDir, `${storyId}.json`);
      
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      // Create backup before deletion
      await this.createBackup(storyId);
      
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete story ${storyId}:`, error);
      throw new Error(`Failed to delete story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if a story file exists
   */
  storyExists(storyId: string): boolean {
    const filePath = path.join(this.storiesDir, `${storyId}.json`);
    return fs.existsSync(filePath);
  }

  /**
   * Get list of all story IDs
   */
  async getAllStoryIds(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.storiesDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch (error) {
      console.error('Failed to get story IDs:', error);
      return [];
    }
  }

  /**
   * Create a backup of a story
   */
  private async createBackup(storyId: string): Promise<void> {
    try {
      const sourceFile = path.join(this.storiesDir, `${storyId}.json`);
      
      if (!fs.existsSync(sourceFile)) {
        return;
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `${storyId}_${timestamp}.json`);
      
      await fs.promises.copyFile(sourceFile, backupFile);
      
      // Keep only the 5 most recent backups per story
      await this.cleanupOldBackups(storyId);
    } catch (error) {
      console.error(`Failed to create backup for story ${storyId}:`, error);
    }
  }

  /**
   * Clean up old backup files
   */
  private async cleanupOldBackups(storyId: string): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const storyBackups = files
        .filter(file => file.startsWith(`${storyId}_`) && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      // Keep only the 5 most recent backups
      const backupsToDelete = storyBackups.slice(5);
      
      for (const backup of backupsToDelete) {
        await fs.promises.unlink(backup.path);
      }
    } catch (error) {
      console.error(`Failed to cleanup old backups for story ${storyId}:`, error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalStories: number;
    totalBackups: number;
    storageSize: string;
  }> {
    try {
      const storyFiles = await fs.promises.readdir(this.storiesDir);
      const backupFiles = await fs.promises.readdir(this.backupDir);
      
      let totalSize = 0;
      
      // Calculate size of story files
      for (const file of storyFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storiesDir, file);
          const stats = await fs.promises.stat(filePath);
          totalSize += stats.size;
        }
      }
      
      // Calculate size of backup files
      for (const file of backupFiles) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.backupDir, file);
          const stats = await fs.promises.stat(filePath);
          totalSize += stats.size;
        }
      }
      
      const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
        return `${Math.round(bytes / (1024 * 1024))} MB`;
      };
      
      return {
        totalStories: storyFiles.filter(f => f.endsWith('.json')).length,
        totalBackups: backupFiles.filter(f => f.endsWith('.json')).length,
        storageSize: formatSize(totalSize)
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalStories: 0,
        totalBackups: 0,
        storageSize: '0 B'
      };
    }
  }

  /**
   * Export story to a specific directory
   */
  async exportStory(storyId: string, exportDir: string): Promise<string | null> {
    try {
      const story = await this.loadStory(storyId);
      if (!story) {
        return null;
      }
      
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const exportPath = path.join(exportDir, `${story.title.replace(/[^a-zA-Z0-9]/g, '_')}_${storyId}.json`);
      await fs.promises.writeFile(exportPath, JSON.stringify(story, null, 2), 'utf8');
      
      return exportPath;
    } catch (error) {
      console.error(`Failed to export story ${storyId}:`, error);
      throw new Error(`Failed to export story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import story from file
   */
  async importStory(filePath: string): Promise<Story> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      const storyData = JSON.parse(fileContent);
      
      // Validate story structure
      if (!storyData.id || !storyData.title || !storyData.storyLog) {
        throw new Error('Invalid story format');
      }
      
      // Generate new ID if story already exists
      let newId = storyData.id;
      let counter = 1;
      while (this.storyExists(newId)) {
        newId = `${storyData.id}_copy_${counter}`;
        counter++;
      }
      
      const story: Story = {
        ...storyData,
        id: newId,
        createdAt: new Date().toISOString(),
        lastPlayed: new Date().toISOString()
      };
      
      await this.saveStory(story);
      return story;
    } catch (error) {
      console.error(`Failed to import story from ${filePath}:`, error);
      throw new Error(`Failed to import story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}