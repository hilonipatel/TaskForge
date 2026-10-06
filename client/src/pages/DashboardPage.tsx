import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import "./DashboardPage.css";

function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <PageLayout title="Dashboard">
            <div className="dashboard-page">
                <div className="dashboard-header">
                    <div className="dashboard-header-content">
                        <div>
                            <p className="page-eyebrow">
                                Workspace
                            </p>

                            <h2>Dashboard</h2>

                            <p className="page-subtitle">
                                Manage your organizations, projects, and tasks
                                from one place.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="logout-button"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {user && (
                    <>
                        <div className="welcome-card">
                            <div className="welcome-content">
                                <p className="welcome-label">
                                    Welcome back
                                </p>

                                <h3>{user.name}</h3>

                                <p>{user.email}</p>
                            </div>
                        </div>

                        <div className="dashboard-section">
                            <div className="section-heading">
                                <div>
                                    <h3>Workspace</h3>

                                    <p>
                                        Choose where you want to work.
                                    </p>
                                </div>
                            </div>

                            <div className="dashboard-actions">
                                <button
                                    type="button"
                                    className="dashboard-action"
                                    onClick={() =>
                                        navigate("/organizations")
                                    }
                                >
                                    <span className="action-title">
                                        Organizations
                                    </span>

                                    <span className="action-description">
                                        Manage your organizations
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className="dashboard-action"
                                    onClick={() =>
                                        navigate("/projects")
                                    }
                                >
                                    <span className="action-title">
                                        Projects
                                    </span>

                                    <span className="action-description">
                                        View and manage projects
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    className="dashboard-action"
                                    onClick={() =>
                                        navigate("/tasks")
                                    }
                                >
                                    <span className="action-title">
                                        Tasks
                                    </span>

                                    <span className="action-description">
                                        Create and track tasks
                                    </span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PageLayout>
    );
}

export default DashboardPage;
