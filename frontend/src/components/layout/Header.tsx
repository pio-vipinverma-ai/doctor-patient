import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1>Patient Management System</h1>
        </div>
        
        <div className={styles.userSection}>
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userName}>Welcome, {user.name || user.username}</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <span className={styles.guestText}>Guest</span>
          )}
        </div>
      </div>
    </header>
  );
};
