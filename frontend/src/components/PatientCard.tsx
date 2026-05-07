import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientSearchResult } from '../services/patientService';
import styles from './PatientCard.module.scss';

interface PatientCardProps {
  patient: PatientSearchResult;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/patients/${patient.id}`);
  };

  const formatLastVisit = (lastVisit: string | null): string => {
    if (!lastVisit) return 'No visits yet';
    const date = new Date(lastVisit);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.patientCard} onClick={handleClick}>
      <div className={styles.header}>
        <h3 className={styles.name}>{patient.name}</h3>
        <span className={styles.badge}>{patient.gender}</span>
      </div>
      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Age:</span>
          <span className={styles.value}>{patient.age} years</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Phone:</span>
          <span className={styles.value}>{patient.phone}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Last Visit:</span>
          <span className={styles.value}>{formatLastVisit(patient.lastVisit)}</span>
        </div>
      </div>
    </div>
  );
};
