import express from 'express';
import { StoryService } from '../services/storyService';

const router = express.Router();
const storyService = new StoryService();

// GET /api/stories - Get all stories
router.get('/', (req, res) => {
  try {
    const { active, genre, theme, title } = req.query;
    
    const criteria: any = {};
    if (active !== undefined) criteria.isActive = active === 'true';
    if (genre) criteria.genre = genre as string;
    if (theme) criteria.theme = theme as string;
    if (title) criteria.title = title as string;
    
    const stories = Object.keys(criteria).length > 0 
      ? storyService.searchStories(criteria)
      : storyService.getAllStories();
    
    // Return player view for each story
    const playerViews = stories.map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      genre: story.genre,
      theme: story.theme,
      lastPlayed: story.lastPlayed,
      isActive: story.isActive,
      stats: storyService.getStoryStats(story.id)
    }));
    
    res.json({ stories: playerViews });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

// POST /api/stories - Create new story
router.post('/', async (req, res) => {
  try {
    const { title, description, genre, theme, initialLocation, playerName } = req.body;
    
    if (!title || !genre || !initialLocation) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, genre, initialLocation' 
      });
    }
    
    const story = await storyService.createStory({
      title,
      description: description || '',
      genre,
      theme: theme || '',
      initialLocation,
      playerName
    });
    
    res.status(201).json({ 
      story: storyService.getPlayerView(story.id),
      message: 'Story created successfully'
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

// GET /api/stories/:id - Get specific story (player view)
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const playerView = storyService.getPlayerView(id);
    
    if (!playerView) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ story: playerView });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({ error: 'Failed to fetch story' });
  }
});

// POST /api/stories/:id/continue - Generate next story segment
router.post('/:id/continue', async (req, res) => {
  try {
    const { id } = req.params;
    const { playerInput } = req.body;
    
    if (!playerInput || playerInput.trim() === '') {
      return res.status(400).json({ error: 'Player input is required' });
    }
    
    const result = await storyService.continueStory(id, playerInput.trim());
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json({
      story: storyService.getPlayerView(id),
      generatedContent: result.generatedContent,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error continuing story:', error);
    res.status(500).json({ error: 'Failed to continue story' });
  }
});

// GET /api/stories/:id/stats - Get story statistics
router.get('/:id/stats', (req, res) => {
  try {
    const { id } = req.params;
    const stats = storyService.getStoryStats(id);
    
    if (!stats) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching story stats:', error);
    res.status(500).json({ error: 'Failed to fetch story stats' });
  }
});

// POST /api/stories/:id/reset - Reset story to beginning
router.post('/:id/reset', async (req, res) => {
  try {
    const { id } = req.params;
    const resetStory = await storyService.resetStory(id);
    
    if (!resetStory) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ 
      story: storyService.getPlayerView(id),
      message: 'Story reset successfully'
    });
  } catch (error) {
    console.error('Error resetting story:', error);
    res.status(500).json({ error: 'Failed to reset story' });
  }
});

// POST /api/stories/:id/archive - Archive story
router.post('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const archivedStory = await storyService.archiveStory(id);
    
    if (!archivedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ 
      story: storyService.getPlayerView(id),
      message: 'Story archived successfully'
    });
  } catch (error) {
    console.error('Error archiving story:', error);
    res.status(500).json({ error: 'Failed to archive story' });
  }
});

// GET /api/stories/:id/export - Export story data
router.get('/:id/export', (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    const exportData = storyService.exportStory(id, format as 'json' | 'text');
    
    if (!exportData) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const story = storyService.getStory(id);
    const filename = `${story?.title.replace(/[^a-zA-Z0-9]/g, '_')}_export.${format}`;
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
    } else {
      res.setHeader('Content-Type', 'text/plain');
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  } catch (error) {
    console.error('Error exporting story:', error);
    res.status(500).json({ error: 'Failed to export story' });
  }
});

// DELETE /api/stories/:id - Delete story
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await storyService.deleteStory(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

// ADMIN ROUTES (should be protected in production)

// GET /api/stories/:id/admin - Get full story data (admin view)
router.get('/:id/admin', (req, res) => {
  try {
    const { id } = req.params;
    const adminView = storyService.getAdminView(id);
    
    if (!adminView) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ story: adminView });
  } catch (error) {
    console.error('Error fetching admin story view:', error);
    res.status(500).json({ error: 'Failed to fetch admin story view' });
  }
});

// PUT /api/stories/:id/admin - Update story (admin only)
router.put('/:id/admin', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedStory = await storyService.updateStory(id, updates);
    
    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    res.json({ 
      story: updatedStory,
      message: 'Story updated successfully'
    });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

// GRANULAR ADMIN ENDPOINTS FOR STORY COMPONENTS

// Characters
router.post('/:id/admin/characters', async (req, res) => {
  try {
    const { id } = req.params;
    const character = req.body;
    
    // Validation
    if (!character.name || !character.name.trim()) {
      return res.status(400).json({ error: 'Character name is required' });
    }
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    // Check for duplicate names
    if (story.characters.some(char => char.name.toLowerCase() === character.name.toLowerCase())) {
      return res.status(400).json({ error: 'Character with this name already exists' });
    }
    
    const newCharacter = {
      id: Math.random().toString(36).substr(2, 9),
      knownToPlayer: false,
      attributes: {},
      relationships: {},
      secrets: [],
      ...character
    };
    
    const updatedStory = await storyService.updateStory(id, {
      characters: [...story.characters, newCharacter]
    });
    
    res.json({ character: newCharacter, story: updatedStory });
  } catch (error) {
    console.error('Error adding character:', error);
    res.status(500).json({ error: 'Failed to add character' });
  }
});

router.put('/:id/admin/characters/:characterId', async (req, res) => {
  try {
    const { id, characterId } = req.params;
    const updates = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const characters = story.characters.map(char => 
      char.id === characterId ? { ...char, ...updates } : char
    );
    
    const updatedStory = await storyService.updateStory(id, { characters });
    
    res.json({ message: 'Character updated successfully', story: updatedStory });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

router.delete('/:id/admin/characters/:characterId', async (req, res) => {
  try {
    const { id, characterId } = req.params;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const characters = story.characters.filter(char => char.id !== characterId);
    const updatedStory = await storyService.updateStory(id, { characters });
    
    res.json({ message: 'Character deleted successfully', story: updatedStory });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// Inventory Items
router.post('/:id/admin/inventory', async (req, res) => {
  try {
    const { id } = req.params;
    const item = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...item
    };
    
    const updatedStory = await storyService.updateStory(id, {
      inventory: [...story.inventory, newItem]
    });
    
    res.json({ item: newItem, story: updatedStory });
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ error: 'Failed to add inventory item' });
  }
});

router.put('/:id/admin/inventory/:itemId', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const updates = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const inventory = story.inventory.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    
    const updatedStory = await storyService.updateStory(id, { inventory });
    
    res.json({ message: 'Inventory item updated successfully', story: updatedStory });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

router.delete('/:id/admin/inventory/:itemId', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const inventory = story.inventory.filter(item => item.id !== itemId);
    const updatedStory = await storyService.updateStory(id, { inventory });
    
    res.json({ message: 'Inventory item deleted successfully', story: updatedStory });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

// Goals
router.post('/:id/admin/goals', async (req, res) => {
  try {
    const { id } = req.params;
    const goal = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const newGoal = {
      id: Math.random().toString(36).substr(2, 9),
      ...goal
    };
    
    const updatedStory = await storyService.updateStory(id, {
      goals: [...story.goals, newGoal]
    });
    
    res.json({ goal: newGoal, story: updatedStory });
  } catch (error) {
    console.error('Error adding goal:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

router.put('/:id/admin/goals/:goalId', async (req, res) => {
  try {
    const { id, goalId } = req.params;
    const updates = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const goals = story.goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    );
    
    const updatedStory = await storyService.updateStory(id, { goals });
    
    res.json({ message: 'Goal updated successfully', story: updatedStory });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

router.delete('/:id/admin/goals/:goalId', async (req, res) => {
  try {
    const { id, goalId } = req.params;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const goals = story.goals.filter(goal => goal.id !== goalId);
    const updatedStory = await storyService.updateStory(id, { goals });
    
    res.json({ message: 'Goal deleted successfully', story: updatedStory });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Story Beats
router.post('/:id/admin/beats', async (req, res) => {
  try {
    const { id } = req.params;
    const beat = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const newBeat = {
      id: Math.random().toString(36).substr(2, 9),
      order: story.beats.length + 1,
      ...beat
    };
    
    const updatedStory = await storyService.updateStory(id, {
      beats: [...story.beats, newBeat]
    });
    
    res.json({ beat: newBeat, story: updatedStory });
  } catch (error) {
    console.error('Error adding story beat:', error);
    res.status(500).json({ error: 'Failed to add story beat' });
  }
});

router.put('/:id/admin/beats/:beatId', async (req, res) => {
  try {
    const { id, beatId } = req.params;
    const updates = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const beats = story.beats.map(beat => 
      beat.id === beatId ? { ...beat, ...updates } : beat
    );
    
    const updatedStory = await storyService.updateStory(id, { beats });
    
    res.json({ message: 'Story beat updated successfully', story: updatedStory });
  } catch (error) {
    console.error('Error updating story beat:', error);
    res.status(500).json({ error: 'Failed to update story beat' });
  }
});

router.delete('/:id/admin/beats/:beatId', async (req, res) => {
  try {
    const { id, beatId } = req.params;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const beats = story.beats.filter(beat => beat.id !== beatId);
    const updatedStory = await storyService.updateStory(id, { beats });
    
    res.json({ message: 'Story beat deleted successfully', story: updatedStory });
  } catch (error) {
    console.error('Error deleting story beat:', error);
    res.status(500).json({ error: 'Failed to delete story beat' });
  }
});

// World State
router.put('/:id/admin/state', async (req, res) => {
  try {
    const { id } = req.params;
    const stateUpdates = req.body;
    
    const story = storyService.getStory(id);
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const updatedState = {
      ...story.state,
      ...stateUpdates,
      lastUpdateTimestamp: new Date().toISOString()
    };
    
    const updatedStory = await storyService.updateStory(id, { state: updatedState });
    
    res.json({ message: 'World state updated successfully', story: updatedStory });
  } catch (error) {
    console.error('Error updating world state:', error);
    res.status(500).json({ error: 'Failed to update world state' });
  }
});

export default router;