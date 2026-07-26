import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, validate the stored token
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('eyeluxe_token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser({ email: data.email, token });
                } else {
                    localStorage.removeItem('eyeluxe_token');
                }
            } catch {
                localStorage.removeItem('eyeluxe_token');
            } finally {
                setLoading(false);
            }
        };
        validateToken();
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('eyeluxe_token', data.token);
        setUser({ email: data.email, token: data.token });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('eyeluxe_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};
