import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
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
      if (!value) return 'Email requis';
      if (!EMAIL_REGEX.test(value)) return 'Email invalide';
    }
    if (name === 'password') {
      if (!value) return 'Mot de passe requis';
    }
    return '';
  }

  function handleBlur(name, value) {
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
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
        <h1>Connexion</h1>
        {globalError && <p className={styles.error} role="alert">{globalError}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={e => handleBlur('email', e.target.value)}
            autoComplete="email"
            aria-label="Email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
        </label>
        <label>
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={e => handleBlur('password', e.target.value)}
            autoComplete="current-password"
            aria-label="Mot de passe"
            aria-invalid={!!errors.password}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
        </label>
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <p className={styles.link}>
          Pas encore de compte ? <Link to="/register">Inscription</Link>
        </p>
      </form>
    </div>
  );
}
