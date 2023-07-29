import React, { useState } from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: false,
    password: false,
  });
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigator = useNavigate();

  const api = process.env.REACT_APP_API_BASE_URL;

  const validateForm = () => {
    const updatedErrors = {
      username: username.trim() === "",
      password: password.trim() === "",
    };

    setFormErrors(updatedErrors);

    return Object.values(updatedErrors).every((error) => !error);
  };
  const handleLogin = async (event) => {
    event.preventDefault();

    const isFormValid = validateForm();

    if (!isFormValid) {
      return;
    }

    try {
      const response = await fetch(`${api}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.message);
        return;
      }

      const data = await response.json();

      login(data.token, data.user);

      // Save the token and user info in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", data.user);

      // Redirect to the authenticated home page
      navigator("/main");
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="login">
      <form>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {formErrors.username && (
          <p className="error-message">This field is required</p>
        )}
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {formErrors.password && (
          <p className="error-message">This field is required</p>
        )}
        <button onClick={handleLogin}>Login</button>
        {error && <p className="error-message">{error}</p>}
        <p>
          Are you new?
          <span>
            {" "}
            <Link to="/signup">Signup</Link>
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
