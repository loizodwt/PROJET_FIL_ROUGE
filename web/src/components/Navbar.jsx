import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { t, i18n } = useTranslation();

	function handleLogout() {
		logout();
		navigate('/');
	}

	function toggleLanguage() {
		i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
	}

	return (
		<nav className={styles.nav} aria-label="Navigation principale">
			<Link to="/" className={styles.brand}>
				CuteFilmFinder
			</Link>
			<div className={styles.links}>
				<button
					onClick={toggleLanguage}
					className={styles.langBtn}
					aria-label="Changer de langue"
					title={i18n.language === 'fr' ? 'Switch to English' : 'Passer en français'}
				>
					{i18n.language === 'fr' ? 'EN' : 'FR'}
				</button>

				{user ? (
					<>
						<span className={styles.username}>{user.name}</span>
						<Link to="/profil">{t('nav.myProfile')}</Link>
						{user.role === 'ADMIN' && <Link to="/admin">{t('nav.admin')}</Link>}
						<button onClick={handleLogout} className={styles.btn}>
							{t('nav.logout')}
						</button>
					</>
				) : (
					<>
						<Link to="/login">{t('nav.login')}</Link>
						<Link to="/register" className={styles.btnPrimary}>
							{t('nav.register')}
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
