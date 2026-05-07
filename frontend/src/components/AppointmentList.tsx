import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppointmentListItem, updateAppointment } from '../services/appointmentService';
import { useToast } from '../context/ToastContext';
import styles from './AppointmentList.module.scss';

interface AppointmentListProps {
  appointments: AppointmentListItem[];
  onUpdate?: () => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, onUpdate }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return styles.statusScheduled;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      case 'no-show':
        return styles.statusNoShow;
      default:
        return styles.statusScheduled;
    }
  };

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    setUpdatingId(appointmentId);
    try {
      await updateAppointment(appointmentId, { status: newStatus });
      
      // Show success message
      showToast(`Appointment marked as ${newStatus}`, 'success');
      
      // Refresh list
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update appointment', 'error');
    } finally {
      setUpdatingId(null);
      setShowCancelConfirm(null);
    }
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  const handleStartConsultation = (appointmentId: string, patientId: string) => {
    // Navigate to consultation page with appointment ID in state
    navigate(`/consultation/${patientId}`, { 
      state: { appointmentId } 
    });
  };

  const handleCancelClick = (appointmentId: string) => {
    setShowCancelConfirm(appointmentId);
  };

  const handleCancelConfirm = (appointmentId: string) => {
    handleUpdateStatus(appointmentId, 'Cancelled');
  };

  const handleCancelCancel = () => {
    setShowCancelConfirm(null);
  };

  if (appointments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No appointments scheduled for today</p>
      </div>
    );
  }

  return (
    <div className={styles.appointmentListContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Age/Gender</th>
              <th>Phone</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <React.Fragment key={appointment.id}>
                <tr className={styles.appointmentRow}>
                  <td className={styles.timeCell}>
                    {formatTime(appointment.scheduledTime)}
                  </td>
                  <td className={styles.patientCell}>
                    <button
                      className={styles.patientLink}
                      onClick={() => handleViewPatient(appointment.patientId)}
                    >
                      {appointment.patientName}
                    </button>
                  </td>
                  <td>—</td>
                  <td>{appointment.phone}</td>
                  <td className={styles.reasonCell}>{appointment.reason}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    {appointment.status === 'Scheduled' && (
                      <>
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleStartConsultation(appointment.id, appointment.patientId)}
                          disabled={updatingId === appointment.id}
                          title="Start Consultation"
                        >
                          Consult
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.successBtn}`}
                          onClick={() => handleUpdateStatus(appointment.id, 'Completed')}
                          disabled={updatingId === appointment.id}
                          title="Mark as Completed"
                        >
                          Complete
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.warningBtn}`}
                          onClick={() => handleUpdateStatus(appointment.id, 'No-show')}
                          disabled={updatingId === appointment.id}
                          title="Mark as No-show"
                        >
                          No-show
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.dangerBtn}`}
                          onClick={() => handleCancelClick(appointment.id)}
                          disabled={updatingId === appointment.id}
                          title="Cancel Appointment"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {appointment.status === 'Completed' && appointment.consultationSaved && (
                      <span className={styles.savedIndicator}>✓ Consultation Saved</span>
                    )}
                  </td>
                </tr>

                {/* Cancel Confirmation Dialog */}
                {showCancelConfirm === appointment.id && (
                  <tr>
                    <td colSpan={7} className={styles.confirmDialog}>
                      <div className={styles.confirmContent}>
                        <p>Are you sure you want to cancel this appointment?</p>
                        <div className={styles.confirmActions}>
                          <button
                            className={styles.confirmBtn}
                            onClick={() => handleCancelConfirm(appointment.id)}
                          >
                            Yes, Cancel
                          </button>
                          <button
                            className={styles.cancelConfirmBtn}
                            onClick={handleCancelCancel}
                          >
                            No, Keep It
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
