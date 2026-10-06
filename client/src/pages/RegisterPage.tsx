import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
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
            await registerUser(
                name.trim(),
                email.trim(),
                password
            );

            setName("");
            setEmail("");
            setPassword("");

            navigate("/login");
        } catch (error) {
            console.error("Registration failed:", error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "Unable to create your account. Please try again."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

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

                    <h1>Create your account</h1>

                    <p className="auth-subtitle">
                        Create your TaskForge account and start
                        organizing your work.
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
                        <label htmlFor="name">
                            Full name
                        </label>

                        <input
                            id="name"
                            type="text"
                            value={name}
                            placeholder="Enter your name"
                            autoComplete="name"
                            required
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                        />
                    </div>

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
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                        />
                    </div>

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="button-spinner" />
                                Creating account...
                            </>
                        ) : (
                            "Create account"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account?</span>

                    <button
                        type="button"
                        className="auth-link"
                        onClick={() => navigate("/login")}
                    >
                        Sign in
                    </button>
                </div>
            </section>
        </main>
    );
}

export default RegisterPage;
