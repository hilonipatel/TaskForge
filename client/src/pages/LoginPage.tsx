import { useState } from "react";
import { loginUser } from "../services/api";
import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {

    const { setUser, loading } = useAuth(); 
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try{
            const data = await loginUser(email, password);
            
            localStorage.setItem("token", data.token);

            setUser({
                id: data.id,
                name: data.name,
                email: data.email,
                created_at: data.created_at,
            });
            
            navigate("/dashboard");
            
            console.log("Login successful:", data);
        
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1>TaskForge</h1>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
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
                    Login
                </button>
            </form>

            <button type="button" onClick={() => navigate("/register")}>
                Create an account
            </button>

        </div>
    );
}

export default LoginPage;
