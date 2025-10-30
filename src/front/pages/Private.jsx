import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/appContext";
import { useNavigate } from "react-router-dom";

export const Private = () => {
    const { store, actions } = useContext(Context);
    const navigate = useNavigate();
    const [privateData, setPrivateData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // Verificar si hay token
            if (!store.token) {
                navigate("/login");
                return;
            }

            // Validar el token
            const isValid = await actions.validateToken();
            
            if (!isValid) {
                navigate("/login");
                return;
            }

            // Obtener datos privados
            const result = await actions.getPrivateData();
            
            if (result.success) {
                setPrivateData(result.data);
            }
            
            setLoading(false);
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">
                                🔒 Página Privada
                            </h2>
                            
                            <div className="alert alert-success" role="alert">
                                <h4 className="alert-heading">¡Bienvenido!</h4>
                                <p>Has accedido exitosamente a una ruta privada.</p>
                                <hr />
                                <p className="mb-0">
                                    Esta página solo es visible para usuarios autenticados.
                                </p>
                            </div>

                            {store.user && (
                                <div className="card mt-3">
                                    <div className="card-header">
                                        Información del Usuario
                                    </div>
                                    <div className="card-body">
                                        <p><strong>ID:</strong> {store.user.id}</p>
                                        <p><strong>Email:</strong> {store.user.email}</p>
                                    </div>
                                </div>
                            )}

                            {privateData && (
                                <div className="card mt-3">
                                    <div className="card-header">
                                        Datos Privados
                                    </div>
                                    <div className="card-body">
                                        <pre>{JSON.stringify(privateData, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};