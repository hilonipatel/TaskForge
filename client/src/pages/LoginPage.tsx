import { useState } from "react";
import { loginUser } from "../services/api";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
    const { setUser, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (submitting) {
            return;
        }

        setError("");
        setSubmitting(true);

        try {
            const data = await loginUser(
                email.trim(),
                password
            );

            localStorage.setItem("token", data.token);

            setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                created_at: data.created_at,
            });

            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Unable to sign in. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="auth-loading-spinner" />
                <span>Loading TaskForge...</span>
            </div>
        );
    }

    return (
        <main className="auth-page">
            <section className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        TF
                    </div>

                    <p className="auth-eyebrow">
                        TaskForge
                    </p>

                    <h1>Welcome back</h1>

                    <p className="auth-subtitle">
                        Sign in to manage your projects and tasks.
                    </p>
                </div>

                {error && (
                    <div
                        className="auth-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="auth-field">
                        <label htmlFor="email">
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="button-spinner" />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Don't have an account?</span>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={() => navigate("/register")}
                    >
                        Create an account
                    </button>
                </div>
            </section>
        </main>
    );
}

export default LoginPage;
