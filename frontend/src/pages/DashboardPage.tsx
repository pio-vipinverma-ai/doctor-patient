import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { AppointmentList } from '../components/AppointmentList';
import { ScheduleAppointmentForm } from '../components/ScheduleAppointmentForm';
import { getTodaysAppointments, AppointmentListItem } from '../services/appointmentService';
import styles from './DashboardPage.module.scss';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTodaysAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments');
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleScheduleSuccess = () => {
    setShowScheduleForm(false);
    loadAppointments(); // Refresh appointments list
  };

  const handleScheduleCancel = () => {
    setShowScheduleForm(false);
  };

  // Calculate stats
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
  const pendingAppointments = appointments.filter(a => a.status === 'Scheduled').length;
  const noShowAppointments = appointments.filter(a => a.status === 'No-show').length;

  // Get today's date formatted
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Layout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <div>
            <h1>Today's Schedule</h1>
            <p className={styles.subtitle}>{getTodayFormatted()}</p>
          </div>
          <button 
            className={styles.newAppointmentBtn}
            onClick={() => setShowScheduleForm(true)}
          >
            + New Appointment
          </button>
        </div>

        {/* Quick Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalAppointments}</div>
            <div className={styles.statLabel}>Total Appointments</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statValue} ${styles.completed}`}>{completedAppointments}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statValue} ${styles.pending}`}>{pendingAppointments}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statValue} ${styles.noShow}`}>{noShowAppointments}</div>
            <div className={styles.statLabel}>No-show</div>
          </div>
        </div>

        {/* Schedule Appointment Form Modal */}
        {showScheduleForm && (
          <div className={styles.modalOverlay} onClick={handleScheduleCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <ScheduleAppointmentForm
                onSuccess={handleScheduleSuccess}
                onCancel={handleScheduleCancel}
              />
            </div>
          </div>
        )}

        {/* Appointments List */}
        <div className={styles.section}>
          <h2>Appointments</h2>
          {isLoading && <div className={styles.loading}>Loading appointments...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!isLoading && !error && (
            <AppointmentList 
              appointments={appointments} 
              onUpdate={loadAppointments}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className={styles.section}>
          <h2>Quick Actions</h2>
          <div className={styles.buttons}>
            <button 
              className={styles.actionBtn}
              onClick={() => navigate('/patients/search')}
            >
              Search Patient
            </button>
            <button 
              className={styles.actionBtn}
              onClick={() => setShowScheduleForm(true)}
            >
              Schedule Appointment
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
