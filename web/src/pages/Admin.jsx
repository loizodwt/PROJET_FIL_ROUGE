import { useState, useRef } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Admin.module.css';

export default function Admin() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  usePageTitle('Administration');

  const [form, setForm] = useState({ title: '', synopsis: '', releaseYear: '', director: '', categoryId: '', photoUrl: '' });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const photoRef = useRef(null);

  // Category form state
  const [catName, setCatName] = useState('');
  const [catError, setCatError] = useState('');

  const { data } = useQuery({
    queryKey: ['films', 'admin'],
    queryFn: () => api.get('/films?limit=100'),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (photoFile) {
        const formData = new FormData();
        formData.append('title', form.title);
        if (form.synopsis) formData.append('synopsis', form.synopsis);
        if (form.releaseYear) formData.append('releaseYear', form.releaseYear);
        if (form.director) formData.append('director', form.director);
        if (form.categoryId) formData.append('categoryId', form.categoryId);
        formData.append('photo', photoFile);
        if (editId) {
          return api.putForm(`/films/${editId}`, formData, token);
        }
        return api.postForm('/films', formData, token);
      } else {
        const body = {
          title: form.title,
          synopsis: form.synopsis || undefined,
          releaseYear: form.releaseYear ? parseInt(form.releaseYear) : undefined,
          director: form.director || undefined,
          categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
          photoUrl: form.photoUrl || undefined,
        };
        if (editId) {
          return api.put(`/films/${editId}`, body, token);
        }
        return api.post('/films', body, token);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['films'] });
      setForm({ title: '', synopsis: '', releaseYear: '', director: '', categoryId: '', photoUrl: '' });
      setEditId(null);
      setError('');
      setPhotoFile(null);
      if (photoRef.current) photoRef.current.value = '';
      addToast(editId ? 'Film modifié avec succès !' : 'Film ajouté avec succès !', 'success');
    },
    onError: err => {
      setError(err.message);
      addToast('Erreur lors de la sauvegarde.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: id => api.delete(`/films/${id}`, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['films'] });
      addToast('Film supprimé.', 'info');
    },
    onError: () => addToast('Erreur lors de la suppression.', 'error'),
  });

  const createCatMutation = useMutation({
    mutationFn: () => {
      const slug = catName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return api.post('/categories', { name: catName, slug }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCatName('');
      setCatError('');
      addToast('Catégorie créée !', 'success');
    },
    onError: err => {
      setCatError(err.message);
      addToast('Erreur lors de la création de la catégorie.', 'error');
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: id => api.delete(`/categories/${id}`, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      addToast('Catégorie supprimée.', 'info');
    },
  });

  function startEdit(film) {
    setEditId(film.id);
    setPhotoFile(null);
    if (photoRef.current) photoRef.current.value = '';
    setForm({
      title: film.title,
      synopsis: film.synopsis || '',
      releaseYear: film.releaseYear || '',
      director: film.director || '',
      categoryId: film.categoryId || '',
      photoUrl: film.photoUrl || '',
    });
  }

  function handleCreateCategory(e) {
    e.preventDefault();
    if (!catName.trim()) {
      setCatError('Le nom est requis');
      return;
    }
    createCatMutation.mutate();
  }

  return (
    <div className={styles.page}>
      <h1>Administration</h1>

      {/* Film form */}
      <section className={styles.section}>
        <h2>{editId ? 'Modifier le film' : 'Ajouter un film'}</h2>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.formGrid}>
          <input
            placeholder="Titre *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={styles.input}
            aria-label="Titre"
          />
          <input
            placeholder="Réalisateur"
            value={form.director}
            onChange={e => setForm(f => ({ ...f, director: e.target.value }))}
            className={styles.input}
            aria-label="Réalisateur"
          />
          <input
            placeholder="Année de sortie"
            type="number"
            value={form.releaseYear}
            onChange={e => setForm(f => ({ ...f, releaseYear: e.target.value }))}
            className={styles.input}
            aria-label="Année"
          />
          <select
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            className={styles.input}
            aria-label="Catégorie"
          >
            <option value="">Catégorie</option>
            {categories
              ? categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))
              : (
                <>
                  <option value="1">Action</option>
                  <option value="2">Comédie</option>
                  <option value="3">Drame</option>
                  <option value="4">Science-Fiction</option>
                  <option value="5">Thriller</option>
                </>
              )
            }
          </select>
          <textarea
            placeholder="Synopsis"
            value={form.synopsis}
            onChange={e => setForm(f => ({ ...f, synopsis: e.target.value }))}
            className={styles.textarea}
            rows={3}
            aria-label="Synopsis"
          />
          <div className={styles.photoField}>
            <input
              placeholder="URL de l'image (ex: https://...)"
              value={form.photoUrl}
              onChange={e => {
                setForm(f => ({ ...f, photoUrl: e.target.value }));
                if (e.target.value) {
                  setPhotoFile(null);
                  if (photoRef.current) photoRef.current.value = '';
                }
              }}
              className={styles.input}
              aria-label="URL de l'image"
              disabled={!!photoFile}
            />
            <span className={styles.photoOr}>ou</span>
            <label className={styles.fileLabel}>
              <input
                type="file"
                accept="image/*"
                ref={photoRef}
                onChange={e => {
                  setPhotoFile(e.target.files[0] || null);
                  if (e.target.files[0]) setForm(f => ({ ...f, photoUrl: '' }));
                }}
                className={styles.fileInput}
                aria-label="Importer une photo"
              />
            </label>
            {photoFile && <p className={styles.fileName}>{photoFile.name}</p>}
            {form.photoUrl && !photoFile && (
              <img src={form.photoUrl} alt="preview" className={styles.photoPreview} onError={e => e.target.style.display='none'} />
            )}
          </div>
        </div>
        <div className={styles.formActions}>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!form.title || saveMutation.isPending}
            className={styles.btnPrimary}
          >
            {saveMutation.isPending ? 'Sauvegarde...' : editId ? 'Modifier' : 'Ajouter'}
          </button>
          {editId && (
            <button
              onClick={() => {
                setEditId(null);
                setForm({ title: '', synopsis: '', releaseYear: '', director: '', categoryId: '' });
                setPhotoFile(null);
                if (photoRef.current) photoRef.current.value = '';
              }}
              className={styles.btn}
            >
              Annuler
            </button>
          )}
        </div>
      </section>

      {/* Category management */}
      <section className={styles.section}>
        <h2>Catégories</h2>
        {catError && <p className={styles.error} role="alert">{catError}</p>}
        <form onSubmit={handleCreateCategory} className={styles.catForm}>
          <input
            placeholder="Nom de la catégorie"
            value={catName}
            onChange={e => setCatName(e.target.value)}
            className={styles.input}
            aria-label="Nom de la catégorie"
          />
          <button
            type="submit"
            disabled={createCatMutation.isPending}
            className={styles.btnPrimary}
          >
            {createCatMutation.isPending ? 'Création...' : 'Ajouter'}
          </button>
        </form>
        <div className={styles.filmList} style={{ marginTop: '1rem' }}>
          {categories?.map(cat => (
            <div key={cat.id} className={styles.filmRow}>
              <div>
                <strong>{cat.name}</strong>
                <span className={styles.meta}> — {cat.slug}</span>
              </div>
              <button
                onClick={() => deleteCatMutation.mutate(cat.id)}
                disabled={deleteCatMutation.isPending}
                className={styles.deleteBtn}
                aria-label={`Supprimer la catégorie ${cat.name}`}
              >
                Supprimer
              </button>
            </div>
          ))}
          {categories?.length === 0 && (
            <p className={styles.meta}>Aucune catégorie.</p>
          )}
        </div>
      </section>

      {/* Film list */}
      <section className={styles.section}>
        <h2>Films ({data?.total || 0})</h2>
        <div className={styles.filmList}>
          {data?.films.map(film => (
            <div key={film.id} className={styles.filmRow}>
              <div>
                <strong>{film.title}</strong>
                <span className={styles.meta}>{film.releaseYear} · {film.category?.name}</span>
              </div>
              <div className={styles.rowActions}>
                <button onClick={() => startEdit(film)} className={styles.editBtn} aria-label={`Modifier ${film.title}`}>Modifier</button>
                <button
                  onClick={() => deleteMutation.mutate(film.id)}
                  className={styles.deleteBtn}
                  aria-label={`Supprimer ${film.title}`}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
