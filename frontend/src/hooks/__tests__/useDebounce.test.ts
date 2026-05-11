import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    // Rapidly change values
    rerender({ value: 'update1', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    rerender({ value: 'update2', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    rerender({ value: 'final', delay: 500 });
    
    // Should still have initial value
    expect(result.current).toBe('initial');
    
    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Should update to final value
    expect(result.current).toBe('final');
  });

  it('should work with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    expect(result.current).toBe(0);
    
    rerender({ value: 42 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(result.current).toBe(42);
  });

  it('should work with objects', () => {
    const obj1 = { name: 'John', age: 30 };
    const obj2 = { name: 'Jane', age: 25 };
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: obj1 } }
    );

    expect(result.current).toEqual(obj1);
    
    rerender({ value: obj2 });
    
    act(() => {
      jest.advanceTimersByTime(300);
    });
    
    expect(result.current).toEqual(obj2);
  });

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'test' } }
    );

    rerender({ value: 'updated' });
    
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'update2', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    rerender({ value: 'final', delay: 500 });
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should only have the final value, previous timeouts canceled
    expect(result.current).toBe('final');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    rerender({ value: 'updated', delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should not update yet (1000ms delay)
    expect(result.current).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now should update (1000ms passed)
    expect(result.current).toBe('updated');
  });
});
