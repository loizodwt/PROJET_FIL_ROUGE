import styles from './EmptyState.module.css';

export default function EmptyState({ icon = '📭', message = 'Aucun résultat.' }) {
  return (
    <div className={styles.wrapper} role="status">
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
