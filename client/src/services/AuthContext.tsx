import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types/auth";
import { getToken } from "./api";

type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    useEffect(() => {
        const token = getToken();
        
        if (!token) {
            setLoading(false);
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
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout}}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(){
    const auth = useContext(AuthContext);

    if (!auth) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return auth;
}

export default AuthContext;
