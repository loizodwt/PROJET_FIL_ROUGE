import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import styles from './Profile.module.css';

const TABS = ['Mon Profil', 'Favoris', 'Watchlist', 'Historique'];

export default function Profile() {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('Mon Profil');
  const [editName, setEditName] = useState(user?.name || '');
  const [editError, setEditError] = useState('');

  // Favorites
  const { data: favorites, isLoading: favLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/me/favorites', token),
    enabled: activeTab === 'Favoris',
  });

  // Watchlist
  const { data: watchlist, isLoading: watchLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/me/watchlist', token),
    enabled: activeTab === 'Watchlist',
  });

  // History
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => api.get('/me/history', token),
    enabled: activeTab === 'Historique',
  });

  // Update name mutation
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

  // Remove favorite mutation
  const removeFavMutation = useMutation({
    mutationFn: (filmId) => api.post(`/me/favorites/${filmId}`, {}, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      addToast('Retiré des favoris.', 'info');
    },
  });

  // Toggle watchlist mutation
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
      setEditError('Le nom doit contenir au moins 2 caractères');
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
      <h1>Mon espace</h1>

      <div className={styles.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Mon Profil' && (
        <>
          <section className={styles.section}>
            <h2>Informations</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Nom</span>
              <span>{user?.name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span>{user?.email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Rôle</span>
              <span>{user?.role}</span>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Modifier le nom</h2>
            {editError && <p className={styles.error}>{editError}</p>}
            <form onSubmit={handleUpdateProfile} className={styles.editForm}>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className={styles.input}
                placeholder="Votre nom"
                aria-label="Nouveau nom"
              />
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className={styles.btnPrimary}
              >
                {updateMutation.isPending ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </form>
          </section>
        </>
      )}

      {activeTab === 'Favoris' && (
        <section className={styles.section}>
          <h2>Mes favoris</h2>
          {favLoading && <Loader />}
          {favorites && favorites.length === 0 && (
            <EmptyState icon="♥" message="Aucun film en favoris." />
          )}
          {favorites && favorites.length > 0 && (
            <div className={styles.filmList}>
              {favorites.map(({ film }) => (
                <div key={film.id} className={styles.filmRow}>
                  <div className={styles.filmInfo}>
                    {film.photoUrl ? (
                      <img
                        src={`/api${film.photoUrl}`}
                        alt={film.title}
                        className={styles.filmThumb}
                      />
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
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'Watchlist' && (
        <section className={styles.section}>
          <h2>Ma watchlist</h2>
          {watchLoading && <Loader />}
          {watchlist && watchlist.length === 0 && (
            <EmptyState icon="+" message="Aucun film dans la watchlist." />
          )}
          {watchlist && watchlist.length > 0 && (
            <div className={styles.filmList}>
              {watchlist.map(({ film }) => (
                <div key={film.id} className={styles.filmRow}>
                  <div className={styles.filmInfo}>
                    {film.photoUrl ? (
                      <img
                        src={`/api${film.photoUrl}`}
                        alt={film.title}
                        className={styles.filmThumb}
                      />
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
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'Historique' && (
        <section className={styles.section}>
          <h2>Historique de visionnage</h2>
          {historyLoading && <Loader />}
          {history && history.length === 0 && (
            <EmptyState icon="📖" message="Aucun historique de visionnage." />
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
