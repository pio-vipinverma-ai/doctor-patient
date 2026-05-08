import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HamburgerMenu } from './HamburgerMenu';
import styles from './Header.module.scss';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <HamburgerMenu isOpen={false} onClick={onMenuClick} />
          <div className={styles.logo}>
            <h1>Patient Management System</h1>
          </div>
        </div>
        
        <div className={styles.userSection}>
          {user ? (
            <div className={styles.userMenu}>
              <span className={styles.userName} aria-label={`Logged in as ${user.name || user.username}`}>
                Welcome, {user.name || user.username}
              </span>
              <button 
                onClick={handleLogout} 
                className={styles.logoutBtn}
                aria-label="Log out of your account"
              >
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
