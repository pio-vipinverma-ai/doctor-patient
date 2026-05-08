import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { ToastProvider, useToast } from '../ToastContext';

describe('ToastContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it('should provide toast context', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.toasts).toEqual([]);
    expect(result.current.showToast).toBeInstanceOf(Function);
    expect(result.current.removeToast).toBeInstanceOf(Function);
  });

  it('should throw error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');

    console.error = originalError;
  });

  it('should add toast when showToast is called', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Test message', 'success');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Test message');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('should add toast with default type', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.toasts[0].type).toBe('info');
  });

  it('should add multiple toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('First', 'success');
      result.current.showToast('Second', 'error');
      result.current.showToast('Third', 'warning');
    });

    expect(result.current.toasts).toHaveLength(3);
    expect(result.current.toasts[0].message).toBe('First');
    expect(result.current.toasts[1].message).toBe('Second');
    expect(result.current.toasts[2].message).toBe('Third');
  });

  it('should remove toast when removeToast is called', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Test message', 'success');
    });

    const toastId = result.current.toasts[0].id;

    act(() => {
      result.current.removeToast(toastId);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('should auto-remove toast after duration', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Test message', 'success', 1000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.toasts).toHaveLength(0);
    });

    jest.useRealTimers();
  });

  it('should not auto-remove toast with duration 0', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Test message', 'success', 0);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Toast should still be there
    expect(result.current.toasts).toHaveLength(1);

    jest.useRealTimers();
  });

  it('should generate unique IDs for each toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('First');
      result.current.showToast('Second');
      result.current.showToast('Third');
    });

    const ids = result.current.toasts.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it('should handle different toast types', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Success', 'success');
      result.current.showToast('Error', 'error');
      result.current.showToast('Warning', 'warning');
      result.current.showToast('Info', 'info');
    });

    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[1].type).toBe('error');
    expect(result.current.toasts[2].type).toBe('warning');
    expect(result.current.toasts[3].type).toBe('info');
  });

  it('should remove specific toast without affecting others', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('First');
      result.current.showToast('Second');
      result.current.showToast('Third');
    });

    const secondToastId = result.current.toasts[1].id;

    act(() => {
      result.current.removeToast(secondToastId);
    });

    expect(result.current.toasts).toHaveLength(2);
    expect(result.current.toasts[0].message).toBe('First');
    expect(result.current.toasts[1].message).toBe('Third');
  });
});
