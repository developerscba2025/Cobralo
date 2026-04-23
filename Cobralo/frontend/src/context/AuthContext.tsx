import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    name: string;
    bizName?: string;
    bizAlias?: string;
    businessCategory?: string;
    phoneNumber?: string;
    reminderTemplate?: string;
    defaultPrice?: number;
    defaultService?: string;
    defaultSurcharge?: number;
    currency?: string;
    receiptFooter?: string;
    isPro: boolean;
    plan: string;
    subscriptionExpiry?: string | null;
    calendarToken?: string;
    ratingToken?: string;
    ratingTokenExpires?: string | null;
    isAdmin?: boolean;
    paymentAccounts?: {
        id: number;
        name: string;
        alias: string;
        isDefault: boolean;
    }[];
    mpAccessToken?: string;
    mpPublicKey?: string;
    workStartHour?: number;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string, bizName?: string, businessCategory?: string, phoneNumber?: string, services?: any[], paymentAlias?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    isPro: boolean;
    isAdmin: boolean;
    updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            // Handle token passed in URL (e.g. Google OAuth redirect to /app/dashboard?token=...)
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            // Only grab URL token if it's on the dashboard path (not on login page, which handles it separately)
            if (urlToken && !window.location.pathname.includes('/app/login')) {
                localStorage.setItem('token', urlToken);
                // Clean the token from URL to avoid leaking it
                urlParams.delete('token');
                const newSearch = urlParams.toString();
                const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
                window.history.replaceState({}, '', newUrl);
            }

            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                try {
                    const res = await fetch(`${API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${storedToken}` }
                    });
                    if (res.ok) {
                        const userData = await res.json();
                        setUser(userData);
                        setToken(storedToken);
                    } else {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                } catch {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };
        validateToken();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch {
            return { success: false, error: 'Error de conexión' };
        }
    };

    const register = async (name: string, email: string, password: string, bizName?: string, businessCategory?: string, phoneNumber?: string, services?: any[], paymentAlias?: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, bizName, businessCategory, phoneNumber, services, paymentAlias })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setUser(data.user);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch {
            return { success: false, error: 'Error de conexión' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updatedUser });
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isLoading,
            login,
            register,
            logout,
            isAuthenticated: !!token && !!user,
            isPro: user?.plan === 'PRO',
            isAdmin: user?.isAdmin === true,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
