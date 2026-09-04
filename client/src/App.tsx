import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import NotFoundPage from "./pages/NotFoundPage";
import OrganizationsPage from "./pages/OrganizationsPage";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <LoginPage
                            />
                        }
                    />
                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizations"
                        element={
                            <ProtectedRoute>
                                <OrganizationsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/" element={<Navigate to="/login" replace />} />
                    <Route
                        path="*" element={<NotFoundPage />} />
                    <Route
                        path="/organizations"
                        element={
                            <ProtectedRoute>
                                <OrganizationsPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
