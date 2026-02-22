import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import * as api from '../services/dataService';

interface AuthContextType {
    user: User | null;
    login: (e: string, p: string) => Promise<void>;
    register: (n: string, e: string, p: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('eventflow_session');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse session", e);
                localStorage.removeItem('eventflow_session');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, pass: string) => {
        const res = await api.login(email, pass);
        setUser(res.user);
        localStorage.setItem('eventflow_session', JSON.stringify(res.user));
        // Also store token if needed by dataService (dataService uses eventflow_token, but original App.tsx used eventflow_session for user)
        // dataService.ts: const token = localStorage.getItem('eventflow_token');
        // Wait, original App.tsx didn't seem to set 'eventflow_token'.
        // Let's check dataService.ts again.
        // It uses 'eventflow_token'.
        // The original App.tsx might have been incomplete or I missed where it sets the token.
        // Ah, api.login returns { user, token }.
        if (res.token) localStorage.setItem('eventflow_token', res.token);
    };

    const register = async (name: string, email: string, pass: string) => {
        const res = await api.register(name, email, pass);
        setUser(res.user);
        localStorage.setItem('eventflow_session', JSON.stringify(res.user));
        if (res.token) localStorage.setItem('eventflow_token', res.token);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('eventflow_session');
        localStorage.removeItem('eventflow_token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
