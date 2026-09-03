import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { AuthProvider, useAuth } from "./services/AuthContext";

function AppContent() {
    const [showRegister, setShowRegister] = useState(false);
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>
    }

    if (user) {
        return <DashboardPage />;
    }

    return (
        <>
            {showRegister ? (
                <RegisterPage
                    onRegisterSuccess={() => setShowRegister(false)}
                    onLoginClick={() => setShowRegister(false)}
                />
            ) : (
                <LoginPage
                    onRegisterClick={() => setShowRegister(true)}
                />
            )}
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;