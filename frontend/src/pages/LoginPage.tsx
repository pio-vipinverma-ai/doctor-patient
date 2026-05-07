import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.scss';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      // Call login
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <h1>Patient Management System</h1>
            <p>Doctor Login</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.hint}>Test credentials: doctor / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
