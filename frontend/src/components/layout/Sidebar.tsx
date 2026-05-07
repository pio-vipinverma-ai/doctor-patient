import { Link, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.scss';

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '??'
    },
    {
      path: '/patients/search',
      label: 'Patients',
      icon: '??'
    },
    {
      path: '/appointments',
      label: 'Appointments',
      icon: '??'
    },
    {
      path: '/consultations',
      label: 'Consultations',
      icon: '??'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: '??'
    }
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${location.pathname === item.path || location.pathname.startsWith(item.path.split('?')[0]) ? styles.active : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};
