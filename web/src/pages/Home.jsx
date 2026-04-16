import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import FilmCard from '../components/FilmCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import styles from './Home.module.css';

const LIMIT = 12;

function pageNumbers(current, total) {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const pages = [];
	pages.push(1);
	if (current > 3) pages.push('…');
	for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
		pages.push(p);
	}
	if (current < total - 2) pages.push('…');
	pages.push(total);
	return pages;
}

export default function Home() {
	const { t } = useTranslation();
	const { user, token } = useAuth();
	usePageTitle('Catalogue');
	const [searchParams, setSearchParams] = useSearchParams();

	const search = searchParams.get('search') || '';
	const category = searchParams.get('category') || '';
	const sort = searchParams.get('sort') || 'createdAt';
	const minRating = searchParams.get('minRating') || '';
	const page = parseInt(searchParams.get('page') || '1', 10);

	function updateParam(key, value) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (value) next.set(key, value);
			else next.delete(key);
			if (key !== 'page') next.set('page', '1');
			return next;
		});
	}

	function goToPage(p) {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set('page', p);
			return next;
		});
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	const { data, isLoading, isError } = useQuery({
		queryKey: ['films', search, category, sort, minRating, page],
		queryFn: () => {
			const params = new URLSearchParams();
			if (search) params.set('search', search);
			if (category) params.set('category', category);
			if (minRating) params.set('minRating', minRating);
			params.set('sort', sort);
			params.set('page', page);
			params.set('limit', LIMIT);
			return api.get(`/films?${params}`);
		},
		placeholderData: (prev) => prev,
	});

	const { data: categories } = useQuery({
		queryKey: ['categories'],
		queryFn: () => api.get('/categories'),
	});

	const { data: recommendations } = useQuery({
		queryKey: ['recommendations'],
		queryFn: () => api.get('/me/recommendations', token),
		enabled: !!user && !!token,
		staleTime: 1000 * 60 * 5,
	});

	const films = data?.films || [];
	const total = data?.total || 0;
	const totalPages = Math.ceil(total / LIMIT);

	return (
		<div className={styles.page}>
			<section className={styles.hero}>
				<h1>{t('home.title')}</h1>
				<p>{t('home.subtitle')}</p>
			</section>

			<div className={styles.filters}>
				<input
					type="search"
					placeholder={t('home.search')}
					value={search}
					onChange={(e) => updateParam('search', e.target.value)}
					className={styles.searchInput}
					aria-label={t('home.search')}
				/>
				<select
					value={category}
					onChange={(e) => updateParam('category', e.target.value)}
					className={styles.select}
					aria-label={t('home.allCategories')}
				>
					<option value="">{t('home.allCategories')}</option>
					{categories?.map((cat) => (
						<option key={cat.id} value={cat.slug}>{cat.name}</option>
					))}
				</select>
				<select
					value={sort}
					onChange={(e) => updateParam('sort', e.target.value)}
					className={styles.select}
					aria-label="Trier par"
				>
					<option value="createdAt">{t('home.sortNewest')}</option>
					<option value="avgRating">{t('home.sortRating')}</option>
					<option value="title">{t('home.sortTitle')}</option>
					<option value="releaseYear">{t('home.sortYear')}</option>
				</select>
				<select
					value={minRating}
					onChange={(e) => updateParam('minRating', e.target.value)}
					className={styles.select}
					aria-label={t('home.minRating')}
				>
					<option value="">{t('home.anyRating')}</option>
					<option value="1">★ 1+</option>
					<option value="2">★★ 2+</option>
					<option value="3">★★★ 3+</option>
					<option value="4">★★★★ 4+</option>
				</select>
			</div>

			{user && recommendations && recommendations.length > 0 && (
				<section className={styles.recommendationsSection}>
					<div className={styles.recommendationsHeader}>
						<h2>{t('home.recommendations')}</h2>
						<span className={styles.recommendationsSubtitle}>
							{t('home.recommendationsSubtitle')}
						</span>
					</div>
					<div className={styles.recommendationsGrid}>
						{recommendations.map((film) => (
							<FilmCard key={film.id} film={film} />
						))}
					</div>
				</section>
			)}

			{isLoading && <Loader />}
			{isError && <p className={styles.error}>{t('home.error')}</p>}

			{data && (
				<>
					{films.length === 0 ? (
						<EmptyState icon="🎬" message={t('home.noFilms')} />
					) : (
						<div className={styles.grid}>
							{films.map((film) => (
								<FilmCard key={film.id} film={film} />
							))}
						</div>
					)}

					{totalPages > 1 && (
						<nav className={styles.pagination} aria-label="Pagination">
							<button
								onClick={() => goToPage(page - 1)}
								disabled={page === 1}
								aria-label="Page précédente"
							>
								‹
							</button>

							{pageNumbers(page, totalPages).map((p, i) =>
								p === '…' ? (
									<span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
								) : (
									<button
										key={p}
										onClick={() => goToPage(p)}
										className={p === page ? styles.pageActive : undefined}
										aria-label={`Page ${p}`}
										aria-current={p === page ? 'page' : undefined}
									>
										{p}
									</button>
								)
							)}

							<button
								onClick={() => goToPage(page + 1)}
								disabled={page === totalPages}
								aria-label="Page suivante"
							>
								›
							</button>
						</nav>
					)}
				</>
			)}
		</div>
	);
}
