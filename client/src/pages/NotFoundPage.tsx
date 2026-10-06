import { useNavigate } from "react-router-dom";
import "./NotFoundPage.css";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <main className="not-found-page">
            <div className="not-found-card">
                <div className="not-found-logo">
                    TF
                </div>

                <p className="not-found-eyebrow">
                    TaskForge
                </p>

                <div className="not-found-code">
                    404
                </div>

                <h1>Page not found</h1>

                <p className="not-found-description">
                    The page you're looking for doesn't exist
                    or may have been moved.
                </p>

                <button
                    className="not-found-button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to dashboard
                </button>
            </div>
        </main>
    );
}

export default NotFoundPage;
