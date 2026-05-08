import React, { useState } from 'react';
import styles from './DateRangeFilter.module.scss';

interface DateRangeFilterProps {
  fromDate: string;
  toDate: string;
  onApply: (from: string, to: string) => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  fromDate,
  toDate,
  onApply,
  onReset,
  isLoading = false
}) => {
  const [localFromDate, setLocalFromDate] = useState(fromDate);
  const [localToDate, setLocalToDate] = useState(toDate);

  const handleApply = () => {
    // Validate dates
    if (localFromDate && localToDate && localFromDate > localToDate) {
      alert('From date cannot be after To date');
      return;
    }
    onApply(localFromDate, localToDate);
  };

  const handleReset = () => {
    onReset();
    // Reset will update the parent's state, which will flow back down as props
  };

  // Update local state when props change (e.g., after reset)
  React.useEffect(() => {
    setLocalFromDate(fromDate);
    setLocalToDate(toDate);
  }, [fromDate, toDate]);

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="fromDate">From Date</label>
          <input
            type="date"
            id="fromDate"
            value={localFromDate}
            onChange={(e) => setLocalFromDate(e.target.value)}
            disabled={isLoading}
            max={localToDate}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="toDate">To Date</label>
          <input
            type="date"
            id="toDate"
            value={localToDate}
            onChange={(e) => setLocalToDate(e.target.value)}
            disabled={isLoading}
            min={localFromDate}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.applyButton}
            onClick={handleApply}
            disabled={isLoading}
          >
            {isLoading ? 'Filtering...' : 'Apply Filter'}
          </button>
          
          <button
            className={styles.resetButton}
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </div>

      <div className={styles.info}>
        <span>Showing consultations from <strong>{new Date(fromDate).toLocaleDateString()}</strong> to <strong>{new Date(toDate).toLocaleDateString()}</strong></span>
      </div>
    </div>
  );
};
