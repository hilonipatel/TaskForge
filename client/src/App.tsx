import LoginPage from "./pages/LoginPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./services/AuthContext";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import NotFoundPage from "./pages/NotFoundPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import TasksPage from "./pages/TaskPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage"

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
                        path="/projects"
                        element={
                            <ProtectedRoute>
                                <ProjectsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects/:projectId"
                        element={
                            <ProtectedRoute>
                                <ProjectDetailsPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/" element={<Navigate to="/login" replace />} />
                    <Route
                        path="*" element={<NotFoundPage />} />
                    
                    <Route
                        path="/tasks"
                        element={
                            <ProtectedRoute>
                                <TasksPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
