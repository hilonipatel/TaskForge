import { useAuth } from "../services/AuthContext";

function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div>
            <h1>TaskForge</h1>
            <h2>Dashboard</h2>

            {user && (
                <div>
                    <p>Welcome, {user.name}</p>
                    <p>Email: {user.email}</p>

                    <button type="button" onClick={logout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default DashboardPage;