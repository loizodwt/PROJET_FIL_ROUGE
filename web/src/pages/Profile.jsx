import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { imageUrl } from '../lib/imageUrl';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { t } = useTranslation();
  usePageTitle(t('profile.title'));
  const [activeTab, setActiveTab] = useState('profile');
  const [editName, setEditName] = useState(user?.name || '');
  const [editError, setEditError] = useState('');

  const TABS = [
    { key: 'profile', label: t('profile.tabProfile') },
    { key: 'stats', label: t('profile.tabStats') },
    { key: 'favorites', label: t('profile.tabFavorites') },
    { key: 'watchlist', label: t('profile.tabWatchlist') },
    { key: 'history', label: t('profile.tabHistory') },
  ];

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/me/stats', token),
    enabled: activeTab === 'stats',
  });

  const { data: favorites, isLoading: favLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/me/favorites', token),
    enabled: activeTab === 'favorites',
  });

  const { data: watchlist, isLoading: watchLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/me/watchlist', token),
    enabled: activeTab === 'watchlist',
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => api.get('/me/history', token),
    enabled: activeTab === 'history',
  });

  const updateMutation = useMutation({
    mutationFn: () => api.put('/auth/me', { name: editName }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      addToast('Profil mis à jour !', 'success');
      setEditError('');
    },
    onError: err => {
      setEditError(err.message);
      addToast('Erreur lors de la mise à jour.', 'error');
    },
  });

  const removeFavMutation = useMutation({
    mutationFn: (filmId) => api.post(`/me/favorites/${filmId}`, {}, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      addToast('Retiré des favoris.', 'info');
    },
  });

  const toggleWatchMutation = useMutation({
    mutationFn: (filmId) => api.post(`/me/watchlist/${filmId}`, {}, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
      addToast('Watchlist mise à jour.', 'info');
    },
  });

  function handleUpdateProfile(e) {
    e.preventDefault();
    if (!editName || editName.trim().length < 2) {
      setEditError(t('auth.nameTooShort'));
      return;
    }
    updateMutation.mutate();
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  return (
    <div className={styles.page}>
      <h1>{t('profile.title')}</h1>

      <div className={styles.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <>
          <section className={styles.section}>
            <h2>{t('profile.info')}</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.nameLabel')}</span>
              <span>{user?.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>{t('profile.emailLabel')}</span>
              <span>{user?.email}</span>
            </div>
          </section>

          <section className={styles.section}>
            <h2>{t('profile.editName')}</h2>
            {editError && <p className={styles.error}>{editError}</p>}
            <form onSubmit={handleUpdateProfile} className={styles.editForm}>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className={styles.input}
                placeholder={t('profile.yourName')}
                aria-label={t('profile.yourName')}
              />
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className={styles.btnPrimary}
              >
                {updateMutation.isPending ? t('profile.saving') : t('profile.save')}
              </button>
            </form>
          </section>
        </>
      )}

      {activeTab === 'stats' && (
        <section className={styles.section}>
          <h2>{t('profile.statsTitle')}</h2>
          {statsLoading && <Loader />}
          {stats && (
            <div className={styles.statsGrid}>

              {/* Niveau cinéphile */}
              {(() => {
                const levels = [
                  { min: 0,  label: 'Novice',    icon: '🎬', next: 1  },
                  { min: 1,  label: 'Amateur',   icon: '⭐', next: 5  },
                  { min: 5,  label: 'Cinéphile', icon: '🎭', next: 10 },
                  { min: 10, label: 'Critique',  icon: '🏆', next: 20 },
                  { min: 20, label: 'Expert',    icon: '✨', next: null },
                ];
                const lvl = [...levels].reverse().find(l => stats.totalRatings >= l.min);
                const pct = lvl.next
                  ? Math.min(100, Math.round(((stats.totalRatings - lvl.min) / (lvl.next - lvl.min)) * 100))
                  : 100;
                return (
                  <div className={styles.levelCard}>
                    <div className={styles.levelLeft}>
                      <span className={styles.levelIcon}>{lvl.icon}</span>
                      <div>
                        <span className={styles.levelName}>{lvl.label}</span>
                        <span className={styles.levelSub}>
                          {lvl.next
                            ? `${stats.totalRatings} / ${lvl.next} films notés`
                            : `${stats.totalRatings} films notés — niveau max !`}
                        </span>
                      </div>
                    </div>
                    <div className={styles.levelBarWrap}>
                      <div className={styles.levelBar} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}

              {/* Compteurs */}
              <div className={styles.statsCounters}>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>★</span>
                  <span className={styles.statNumber}>{stats.totalRatings}</span>
                  <span className={styles.statLabel}>{t('profile.statsFilmsRated')}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>♥</span>
                  <span className={styles.statNumber}>{stats.totalFavorites}</span>
                  <span className={styles.statLabel}>{t('profile.statsFavorites')}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>◎</span>
                  <span className={styles.statNumber}>{stats.totalWatchlist}</span>
                  <span className={styles.statLabel}>{t('profile.statsWatchlist')}</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>◉</span>
                  <span className={styles.statNumber}>{stats.totalHistory}</span>
                  <span className={styles.statLabel}>{t('profile.statsViews')}</span>
                </div>
              </div>

              {/* Insights : moyenne + catégorie + film */}
              {stats.totalRatings > 0 && (
                <div className={styles.insightsRow}>
                  <div className={styles.insightCard}>
                    <span className={styles.insightValue}>★ {stats.avgRatingGiven}</span>
                    <span className={styles.insightLabel}>{t('profile.statsAvgGiven')}</span>
                  </div>
                  {stats.topCategory && (
                    <div className={styles.insightCard}>
                      <span className={styles.insightValue}>{stats.topCategory.name}</span>
                      <span className={styles.insightLabel}>
                        {t('profile.statsTopCategory')} · {stats.topCategory.count} films
                      </span>
                    </div>
                  )}
                  {stats.topRatedFilm && (
                    <div className={styles.insightCard}>
                      <span className={styles.insightValue}>{stats.topRatedFilm.title}</span>
                      <span className={styles.insightLabel}>
                        {t('profile.statsTopFilm')} · {'★'.repeat(stats.topRatedFilm.score)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Distribution des notes */}
              {stats.totalRatings > 0 && (
                <div className={styles.ratingDistribution}>
                  <h3 className={styles.distTitle}>{t('profile.statsDistribution')}</h3>
                  {[5, 4, 3, 2, 1].map(score => {
                    const count = stats.ratingDistribution[score] || 0;
                    const pct = Math.round((count / stats.totalRatings) * 100);
                    return (
                      <div key={score} className={styles.distRow}>
                        <span className={styles.distLabel} aria-hidden="true">{'★'.repeat(score)}</span>
                        <span className="sr-only">{score} étoile{score > 1 ? 's' : ''}</span>
                        <div className={styles.distBarWrap} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${score} étoiles : ${pct}%`}>
                          <div className={styles.distBar} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={styles.distCount}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {stats.totalRatings === 0 && (
                <EmptyState icon="📊" message={t('profile.statsEmpty')} />
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === 'favorites' && (
        <section className={styles.section}>
          <h2>{t('profile.favoritesTitle')}</h2>
          {favLoading && <Loader />}
          {favorites && favorites.length === 0 && (
            <EmptyState icon="♥" message={t('profile.noFavorites')} />
          )}
          {favorites && favorites.length > 0 && (
            <div className={styles.filmList}>
              {favorites.map(({ film }) => (
                <div key={film.id} className={styles.filmRow}>
                  <div className={styles.filmInfo}>
                    {film.photoUrl ? (
                      <img src={imageUrl(film.photoUrl)} alt={film.title} className={styles.filmThumb} />
                    ) : (
                      <div className={styles.filmThumbPlaceholder}>🎬</div>
                    )}
                    <div>
                      <Link to={`/films/${film.id}`}>
                        <div className={styles.filmTitle}>{film.title}</div>
                      </Link>
                      {film.category && (
                        <div className={styles.filmMeta}>{film.category.name}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavMutation.mutate(film.id)}
                    disabled={removeFavMutation.isPending}
                    className={styles.removeBtn}
                    aria-label={`Retirer ${film.title} des favoris`}
                  >
                    {t('profile.remove')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'watchlist' && (
        <section className={styles.section}>
          <h2>{t('profile.watchlistTitle')}</h2>
          {watchLoading && <Loader />}
          {watchlist && watchlist.length === 0 && (
            <EmptyState icon="+" message={t('profile.noWatchlist')} />
          )}
          {watchlist && watchlist.length > 0 && (
            <div className={styles.filmList}>
              {watchlist.map(({ film }) => (
                <div key={film.id} className={styles.filmRow}>
                  <div className={styles.filmInfo}>
                    {film.photoUrl ? (
                      <img src={imageUrl(film.photoUrl)} alt={film.title} className={styles.filmThumb} />
                    ) : (
                      <div className={styles.filmThumbPlaceholder}>🎬</div>
                    )}
                    <div>
                      <Link to={`/films/${film.id}`}>
                        <div className={styles.filmTitle}>{film.title}</div>
                      </Link>
                      {film.category && (
                        <div className={styles.filmMeta}>{film.category.name}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWatchMutation.mutate(film.id)}
                    disabled={toggleWatchMutation.isPending}
                    className={styles.removeBtn}
                    aria-label={`Retirer ${film.title} de la watchlist`}
                  >
                    {t('profile.remove')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className={styles.section}>
          <h2>{t('profile.historyTitle')}</h2>
          {historyLoading && <Loader />}
          {history && history.length === 0 && (
            <EmptyState icon="📖" message={t('profile.noHistory')} />
          )}
          {history && history.length > 0 && (
            <div className={styles.filmList}>
              {history.slice(0, 20).map((entry, i) => (
                <div key={`${entry.film?.id}-${i}`} className={styles.historyRow}>
                  <Link to={`/films/${entry.film?.id}`}>
                    <span className={styles.filmTitle}>{entry.film?.title}</span>
                  </Link>
                  <span className={styles.historyDate}>
                    {formatDate(entry.viewedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
