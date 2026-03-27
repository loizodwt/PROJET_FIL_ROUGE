import styles from './Loader.module.css';

export default function Loader() {
  return (
    <div className={styles.wrapper} aria-label="Chargement en cours">
      <div className={styles.spinner} role="status" />
    </div>
  );
}
