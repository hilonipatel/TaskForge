import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div>
            <h1>TaskForge</h1>
            <h2>Dashboard</h2>

            {user && (
                <div>
                    <p>Welcome, {user.name}</p>
                    <p>Email: {user.email}</p>

                    <button
                        type="button"
                        onClick={() => navigate("/organizations")}
                    >
                        Organizations
                    </button>

                    <button type="button" onClick={logout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;