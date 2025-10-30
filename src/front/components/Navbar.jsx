import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../store/appContext";

export const Navbar = () => {
	const { store, actions } = useContext(Context);
	const navigate = useNavigate();

	const handleLogout = () => {
		actions.logout();
		navigate("/login");
	};

	return (
		<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
			<div className="container">
				<Link to="/" className="navbar-brand">
					JWT Auth App
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="navbarNav">
					<ul className="navbar-nav ms-auto">
						{!store.token ? (
							<>
								<li className="nav-item">
									<Link to="/login" className="nav-link">
										Iniciar Sesión
									</Link>
								</li>
								<li className="nav-item">
									<Link to="/signup" className="nav-link">
										Registrarse
									</Link>
								</li>
							</>
						) : (
							<>
								<li className="nav-item">
									<Link to="/private" className="nav-link">
										Privado
									</Link>
								</li>
								<li className="nav-item">
									<span className="nav-link">
										👤 {store.user?.email}
									</span>
								</li>
								<li className="nav-item">
									<button
										onClick={handleLogout}
										className="btn btn-outline-light"
									>
										Cerrar Sesión
									</button>
								</li>
							</>
						)}
					</ul>
				</div>
			</div>
		</nav>
	);
};