import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import FilmCard from '../components/FilmCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import styles from './Home.module.css';

export default function Home() {
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get('search') || '';
	const category = searchParams.get('category') || '';
	const sort = searchParams.get('sort') || 'createdAt';
	const page = parseInt(searchParams.get('page') || '1');

	function updateParam(key, value) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (value) next.set(key, value);
			else next.delete(key);
			if (key !== 'page') next.delete('page');
			return next;
		});
	}

	const params = new URLSearchParams();
	if (search) params.set('search', search);
	if (category) params.set('category', category);
	params.set('sort', sort);
	params.set('page', page);
	params.set('limit', 12);

	const { data, isLoading, isError } = useQuery({
		queryKey: ['films', search, category, sort, page],
		queryFn: () => api.get(`/films?${params}`),
	});

	const { data: categories } = useQuery({
		queryKey: ['categories'],
		queryFn: () => api.get('/categories'),
	});

	const totalPages = data ? Math.ceil(data.total / 12) : 1;

	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<h1>Bienvenue sur mon FilmFinder :3</h1>
				<p>Découvrez, notez et sauvegardez vos films préférés </p>
			</section>

			<div className={styles.filters}>
				<input
					type="search"
					placeholder="Rechercher un film ou réalisateur..."
					value={search}
					onChange={(e) => updateParam('search', e.target.value)}
					className={styles.searchInput}
					aria-label="Rechercher"
				/>
				<select
					value={category}
					onChange={(e) => updateParam('category', e.target.value)}
					className={styles.select}
					aria-label="Filtrer par catégorie"
				>
					<option value="">Toutes les catégories</option>
					{categories ? (
						categories.map((cat) => (
							<option
								key={cat.id}
								value={cat.slug}
							>
								{cat.name}
							</option>
						))
					) : (
						<>
							<option value="action">Action</option>
							<option value="comedie">Comédie</option>
							<option value="drame">Drame</option>
							<option value="sci-fi">Sci-Fi</option>
							<option value="thriller">Thriller</option>
						</>
					)}
				</select>
				<select
					value={sort}
					onChange={(e) => updateParam('sort', e.target.value)}
					className={styles.select}
					aria-label="Trier par"
				>
					<option value="createdAt">Plus récents</option>
					<option value="avgRating">Mieux notés</option>
					<option value="title">Titre A-Z</option>
					<option value="releaseYear">Année</option>
				</select>
			</div>

			{isLoading && <Loader />}
			{isError && (
				<p className={styles.status}>Erreur lors du chargement des films.</p>
			)}

			{data && (
				<>
					{data.films.length === 0 ? (
						<EmptyState
							icon="🎬"
							message="Aucun film trouvé pour cette recherche."
						/>
					) : (
						<div className={styles.grid}>
							{data.films.map((film) => (
								<FilmCard
									key={film.id}
									film={film}
								/>
							))}
						</div>
					)}

					{totalPages > 1 && (
						<div className={styles.pagination}>
							<button
								onClick={() =>
									updateParam('page', String(Math.max(1, page - 1)))
								}
								disabled={page === 1}
								aria-label="Page précédente"
							>
								←
							</button>
							<span>
								Page {page} / {totalPages}
							</span>
							<button
								onClick={() =>
									updateParam('page', String(Math.min(totalPages, page + 1)))
								}
								disabled={page === totalPages}
								aria-label="Page suivante"
							>
								→
							</button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
