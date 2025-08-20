// Custom hook for admin panel actions
import { useState, useCallback } from 'react';
import { adminApi } from '../../services/api/adminApi';

export function useAdminActions(selectedStoryId: string | null, onUpdate: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(async (componentType: string, componentId: string | undefined, formData: any): Promise<boolean> => {
    if (!selectedStoryId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await adminApi.updateStoryComponent(selectedStoryId, componentType, componentId, formData);
      onUpdate();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoryId, onUpdate]);

  const handleDelete = useCallback(async (componentType: string, componentId: string): Promise<boolean> => {
    if (!selectedStoryId || !confirm(`Are you sure you want to delete this ${componentType}?`)) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminApi.deleteStoryComponent(selectedStoryId, componentType, componentId);
      onUpdate();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoryId, onUpdate]);

  const handleExport = useCallback(async (format: 'json' | 'text'): Promise<boolean> => {
    if (!selectedStoryId) return false;

    setIsLoading(true);
    setError(null);

    try {
      await adminApi.exportStory(selectedStoryId, format);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Export failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoryId]);

  const handleReset = useCallback(async (): Promise<boolean> => {
    if (!selectedStoryId || !confirm('Are you sure you want to reset this story? This will delete all progress.')) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminApi.resetStory(selectedStoryId);
      onUpdate();
      alert('Story reset successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Reset failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoryId, onUpdate]);

  const handleDeleteStory = useCallback(async (): Promise<boolean> => {
    if (!selectedStoryId || !confirm('Are you sure you want to delete this entire story? This cannot be undone.')) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminApi.deleteStory(selectedStoryId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete story failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedStoryId]);

  return {
    isLoading,
    error,
    handleSave,
    handleDelete,
    handleExport,
    handleReset,
    handleDeleteStory,
  };
}