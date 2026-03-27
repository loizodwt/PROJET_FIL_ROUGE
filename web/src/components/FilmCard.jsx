import { Link } from 'react-router-dom';
import styles from './FilmCard.module.css';

export default function FilmCard({ film }) {
  return (
    <Link to={`/films/${film.id}`} className={styles.card} aria-label={`Voir ${film.title}`}>
      <div className={styles.poster}>
        {film.photoUrl ? (
          <img src={`/api${film.photoUrl}`} alt={film.title} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true">✿</div>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{film.title}</h3>
        <div className={styles.meta}>
          {film.category && <span className={styles.category}>{film.category.name}</span>}
          {film.releaseYear && <span>{film.releaseYear}</span>}
          {film.avgRating > 0 && (
            <span className={styles.rating}>★ {film.avgRating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
