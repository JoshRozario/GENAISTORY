import { renderHook, waitFor, act } from '@testing-library/react';
import { useFetch } from './useFetch';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useFetch Hook', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('returns loading state initially', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    } as Response);

    const { result } = renderHook(() => useFetch('/test-url'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for the effect to complete to avoid act warnings
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('returns data on successful fetch', async () => {
    const testData = { message: 'success' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => testData
    } as Response);

    const { result } = renderHook(() => useFetch('/test-url'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(testData);
    expect(result.current.error).toBe(null);
  });

  it('returns error on failed fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    } as Response);

    const { result } = renderHook(() => useFetch('/test-url'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Not Found');
  });

  it('handles network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useFetch('/test-url'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });
});