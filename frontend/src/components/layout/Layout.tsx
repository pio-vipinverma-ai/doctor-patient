import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className={styles.layout}>
        <Header onMenuClick={toggleSidebar} />
        <div className={styles.mainContainer}>
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          {isSidebarOpen && (
            <div 
              className={styles.overlay} 
              onClick={closeSidebar} 
              aria-hidden="true"
            />
          )}
          <main id="main-content" className={styles.mainContent} role="main">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};
