import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { t } = useTranslation();
  usePageTitle(t('auth.loginTitle'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  function validateField(name, value) {
    if (name === 'email') {
      if (!value) return t('auth.emailRequired');
      if (!EMAIL_REGEX.test(value)) return t('auth.emailInvalid');
    }
    if (name === 'password') {
      if (!value) return t('auth.passwordRequired');
    }
    return '';
  }

  function handleBlur(name, value) {
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }
    setGlobalError('');
    setLoading(true);
    try {
      await login(email, password);
      addToast('Connexion réussie !', 'success');
      navigate('/');
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit} className={styles.form} aria-label="Formulaire de connexion" noValidate>
        <h1>{t('auth.loginTitle')}</h1>
        {globalError && <p className={styles.error} role="alert">{globalError}</p>}
        <label>
          {t('auth.email')}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={e => handleBlur('email', e.target.value)}
            autoComplete="email"
            aria-label={t('auth.email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </label>
        <label>
          {t('auth.password')}
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={e => handleBlur('password', e.target.value)}
            autoComplete="current-password"
            aria-label={t('auth.password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
        </label>
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? t('auth.loggingIn') : t('auth.loginBtn')}
        </button>
        <p className={styles.link}>
          {t('auth.noAccount')} <Link to="/register">{t('auth.register')}</Link>
        </p>
      </form>
    </div>
  );
}
