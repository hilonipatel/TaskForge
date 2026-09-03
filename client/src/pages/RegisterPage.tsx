import { useState } from "react";
import { registerUser } from "../services/api";

function RegisterPage({
    onRegisterSuccess,
    onLoginClick,
}: {
    onRegisterSuccess: () => void;
    onLoginClick: () => void;
}) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        try {
            const data = await registerUser(name, email, password);
            
            setName("");
            setEmail("");
            setPassword("");

            console.log("Registration successful", data);

            onRegisterSuccess();
        } catch (error) {
            console.error("Registration failed:", error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("Registration failed");
            }
        }
    };

    return (
        <div>
            <h1>TaskForge</h1>
            <h2>Register</h2>

            {error && <p>{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </div>

                <button type="submit">
                    Register
                </button>
            </form>

            <button type="button" onClick={onLoginClick}>
                Back to Login
            </button>
        </div>
    );
}

export default RegisterPage;