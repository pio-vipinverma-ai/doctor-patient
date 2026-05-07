import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.mainContainer}>
        <Sidebar />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
};
