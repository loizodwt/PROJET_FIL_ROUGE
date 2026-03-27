import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Auth.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: 'Faible' };
  if (score <= 3) return { level: 2, label: 'Moyen' };
  return { level: 3, label: 'Fort' };
}

export default function Register() {
  const { register, login, user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/');
    return null;
  }

  const strength = getPasswordStrength(password);

  function validateField(fieldName, value) {
    if (fieldName === 'name') {
      if (!value || value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
    }
    if (fieldName === 'email') {
      if (!value) return 'Email requis';
      if (!EMAIL_REGEX.test(value)) return 'Email invalide';
    }
    if (fieldName === 'password') {
      if (!value || value.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return '';
  }

  function handleBlur(fieldName, value) {
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nameErr = validateField('name', name);
    const emailErr = validateField('email', email);
    const passwordErr = validateField('password', password);
    if (nameErr || emailErr || passwordErr) {
      setErrors({ name: nameErr, email: emailErr, password: passwordErr });
      return;
    }
    setGlobalError('');
    setLoading(true);
    try {
      await register(email, password, name);
      await login(email, password);
      addToast('Compte créé avec succès !', 'success');
      navigate('/');
    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <form onSubmit={handleSubmit} className={styles.form} aria-label="Formulaire d'inscription" noValidate>
        <h1>Inscription</h1>
        {globalError && <p className={styles.error} role="alert">{globalError}</p>}
        <label>
          Nom
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={e => handleBlur('name', e.target.value)}
            autoComplete="name"
            aria-label="Nom"
            aria-invalid={!!errors.name}
          />
          {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
        </label>
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
            autoComplete="new-password"
            aria-label="Mot de passe"
            aria-invalid={!!errors.password}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          {password && (
            <div className={styles.strengthBar} aria-label={`Force du mot de passe : ${strength.label}`}>
              <div
                className={`${styles.strengthFill} ${styles[`strength${strength.level}`]}`}
                style={{ width: `${(strength.level / 3) * 100}%` }}
              />
              <span className={styles.strengthLabel}>{strength.label}</span>
            </div>
          )}
        </label>
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Création...' : 'Créer un compte'}
        </button>
        <p className={styles.link}>
          Déjà un compte ? <Link to="/login">Connexion</Link>
        </p>
      </form>
    </div>
  );
}
