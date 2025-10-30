const getState = ({ getStore, getActions, setStore }) => {
    return {
        store: {
            token: sessionStorage.getItem("token") || null,
            user: null,
            message: null
        },
        actions: {
            // Función de registro
            signup: async (email, password) => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/signup", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        return { success: true, message: data.msg };
                    } else {
                        return { success: false, message: data.msg };
                    }
                } catch (error) {
                    console.error("Error en signup:", error);
                    return { success: false, message: "Error de conexión" };
                }
            },

            // Función de login
            login: async (email, password) => {
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        sessionStorage.setItem("token", data.token);
                        setStore({ 
                            token: data.token,
                            user: data.user 
                        });
                        return { success: true };
                    } else {
                        return { success: false, message: data.msg };
                    }
                } catch (error) {
                    console.error("Error en login:", error);
                    return { success: false, message: "Error de conexión" };
                }
            },

            // Función de logout
            logout: () => {
                sessionStorage.removeItem("token");
                setStore({ 
                    token: null,
                    user: null 
                });
            },

            // Validar token
            validateToken: async () => {
                const store = getStore();
                if (!store.token) return false;

                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/validate-token", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setStore({ user: data.user });
                        return true;
                    } else {
                        getActions().logout();
                        return false;
                    }
                } catch (error) {
                    console.error("Error validando token:", error);
                    getActions().logout();
                    return false;
                }
            },

            // Obtener datos de ruta privada
            getPrivateData: async () => {
                const store = getStore();
                
                try {
                    const response = await fetch(process.env.BACKEND_URL + "/api/private", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${store.token}`
                        }
                    });

                    const data = await response.json();

                    if (response.ok) {
                        return { success: true, data };
                    } else {
                        return { success: false, message: data.msg };
                    }
                } catch (error) {
                    console.error("Error obteniendo datos privados:", error);
                    return { success: false, message: "Error de conexión" };
                }
            }
        }
    };
};

export default getState;