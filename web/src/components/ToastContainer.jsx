import { useToast } from '../context/ToastContext';
import styles from './ToastContainer.module.css';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type] || styles.info}`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            className={styles.closeBtn}
            onClick={() => removeToast(toast.id)}
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
