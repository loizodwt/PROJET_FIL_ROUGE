import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	function handleLogout() {
		logout();
		navigate('/');
	}

	return (
		<nav
			className={styles.nav}
			aria-label="Navigation principale"
		>
			<Link
				to="/"
				className={styles.brand}
			>
				CuteFilmFinder
			</Link>
			<div className={styles.links}>
				{user ? (
					<>
						<span className={styles.username}>{user.name}</span>
						<Link to="/profil">Mon profil</Link>
						{user.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
						<button
							onClick={handleLogout}
							className={styles.btn}
						>
							Déconnexion
						</button>
					</>
				) : (
					<>
						<Link to="/login">Connexion</Link>
						<Link
							to="/register"
							className={styles.btnPrimary}
						>
							Inscription
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
