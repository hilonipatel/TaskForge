/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { User } from "../types/auth";
import { getToken } from "./api";

type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    logout: () => void;
};

const AuthContext =
    createContext<AuthContextType | null>(null);

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = getToken();

    const [user, setUser] = useState<User | null>(null);

    const [loading, setLoading] = useState(
        () => Boolean(token)
    );

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
    };

    useEffect(() => {
        if (!token) {
            return;
        }

        fetch("http://localhost:5050/api/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    localStorage.removeItem("token");
                    return null;
                }

                return response.json();
            })
            .then((data) => {
                setUser(data);
            })
            .catch((error) => {
                console.error(
                    "Failed to restore authentication:",
                    error
                );

                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return auth;
}

export default AuthContext;
