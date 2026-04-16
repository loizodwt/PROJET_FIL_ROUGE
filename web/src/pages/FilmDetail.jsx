import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { api } from '../lib/api';
import { imageUrl } from '../lib/imageUrl';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import styles from './FilmDetail.module.css';

export default function FilmDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const { data: film, isLoading, isError } = useQuery({
    queryKey: ['film', id],
    queryFn: () => api.get(`/films/${id}`, token),
  });

  usePageTitle(film?.title);

  const favMutation = useMutation({
    mutationFn: () => api.post(`/me/favorites/${id}`, {}, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['film', id] });
      addToast(data.action === 'added' ? 'Ajouté aux favoris !' : 'Retiré des favoris.', 'success');
    },
    onError: () => addToast('Erreur lors de la mise à jour des favoris.', 'error'),
  });

  const watchMutation = useMutation({
    mutationFn: () => api.post(`/me/watchlist/${id}`, {}, token),
    onSuccess: (data) => {
      addToast(data.action === 'added' ? 'Ajouté à la watchlist !' : 'Retiré de la watchlist.', 'success');
    },
    onError: () => addToast('Erreur lors de la mise à jour de la watchlist.', 'error'),
  });

  const rateMutation = useMutation({
    mutationFn: () => api.post(`/me/ratings/${id}`, { score: ratingScore, comment: ratingComment }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['film', id] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      setRatingComment('');
      addToast('Votre note a été enregistrée !', 'success');
    },
    onError: () => addToast("Erreur lors de l'envoi de la note.", 'error'),
  });

  if (isLoading) return <Loader />;
  if (isError) return <EmptyState icon="🎬" message={t('film.notFound')} />;
  if (!film) return <EmptyState icon="🎬" message={t('film.notFound')} />;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        {film.photoUrl ? (
          <img src={imageUrl(film.photoUrl)} alt={film.title} className={styles.poster} />
        ) : (
          <div className={styles.posterPlaceholder} aria-hidden="true">🎬</div>
        )}
        <div className={styles.info}>
          <h1>{film.title}</h1>
          <div className={styles.meta}>
            {film.category && <span className={styles.badge}>{film.category.name}</span>}
            {film.releaseYear && <span>{film.releaseYear}</span>}
            {film.director && <span>{t('film.directedBy')} {film.director}</span>}
            {film.avgRating > 0 && (
              <span className={styles.rating}>★ {film.avgRating.toFixed(1)} / 5</span>
            )}
          </div>
          {film.synopsis && <p className={styles.synopsis}>{film.synopsis}</p>}

          {user && (
            <div className={styles.actions}>
              <button
                onClick={() => favMutation.mutate()}
                disabled={favMutation.isPending}
                className={styles.actionBtn}
                aria-label="Ajouter aux favoris"
              >
                {t('film.favorites')}
              </button>
              <button
                onClick={() => watchMutation.mutate()}
                disabled={watchMutation.isPending}
                className={styles.actionBtn}
                aria-label="Ajouter à la watchlist"
              >
                {t('film.watchlist')}
              </button>
            </div>
          )}
        </div>
      </div>

      {user && (
        <section className={styles.rateSection}>
          <h2>{t('film.yourRating')}</h2>
          <div className={styles.rateForm}>
            <label>
              {t('film.ratingLabel')}
              <select
                value={ratingScore}
                onChange={e => setRatingScore(Number(e.target.value))}
                className={styles.select}
                aria-label="Note de 1 à 5"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} ★</option>
                ))}
              </select>
            </label>
            <textarea
              placeholder={t('film.commentPlaceholder')}
              value={ratingComment}
              onChange={e => setRatingComment(e.target.value)}
              className={styles.textarea}
              rows={3}
              aria-label="Commentaire"
            />
            <button
              onClick={() => rateMutation.mutate()}
              disabled={rateMutation.isPending}
              className={styles.submitBtn}
            >
              {rateMutation.isPending ? t('film.submitting') : t('film.submit')}
            </button>
          </div>
        </section>
      )}

      {film.ratings?.length > 0 && (
        <section className={styles.reviews}>
          <h2>{t('film.reviews')} ({film.ratings.length})</h2>
          {film.ratings.map(r => (
            <div key={r.id} className={styles.review}>
              <div className={styles.reviewHeader}>
                <strong>{r.user.name}</strong>
                <span className={styles.reviewStars} aria-hidden="true">
                  {'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}
                </span>
                <span className="sr-only">{r.score} étoiles sur 5</span>
              </div>
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
