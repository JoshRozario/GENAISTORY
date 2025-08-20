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
router.post('/:id/reset', (req, res) => {
  try {
    const { id } = req.params;
    const resetStory = storyService.resetStory(id);
    
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
router.post('/:id/archive', (req, res) => {
  try {
    const { id } = req.params;
    const archivedStory = storyService.archiveStory(id);
    
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
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = storyService.deleteStory(id);
    
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
router.put('/:id/admin', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedStory = storyService.updateStory(id, updates);
    
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

export default router;