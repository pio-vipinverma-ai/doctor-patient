import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from '../useFetch';
import axios from 'axios';

jest.mock('axios');

describe('useFetch hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useFetch<any>('/api/test'));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: '1', name: 'Test' };
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useFetch<any>('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Network error');
    (axios.get as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useFetch<any>('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should refetch data when called', async () => {
    const mockData1 = { id: '1', name: 'Test 1' };
    const mockData2 = { id: '2', name: 'Test 2' };

    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: mockData1 })
      .mockResolvedValueOnce({ data: mockData2 });

    const { result } = renderHook(() => useFetch<any>('/api/test'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    // Refetch
    await waitFor(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});
