import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/patients/search',
      label: 'Patients',
      icon: '👥'
    },
    {
      path: '/appointments',
      label: 'Appointments',
      icon: '📅'
    },
    {
      path: '/consultations',
      label: 'Consultations',
      icon: '🩺'
    },
    {
      path: '/export',
      label: 'Export Data',
      icon: '📥'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '📋'
    }
  ];

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    onClose();
  };

  return (
    <aside 
      className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav className={styles.nav} aria-label="Primary">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={handleLinkClick}
            className={`${styles.navItem} ${location.pathname === item.path || location.pathname.startsWith(item.path.split('?')[0]) ? styles.active : ''}`}
            aria-current={location.pathname === item.path ? 'page' : undefined}
          >
            <span className={styles.icon} aria-hidden="true">{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
