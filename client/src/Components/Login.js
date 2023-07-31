import React, { useState } from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });

  const navigator = useNavigate();

  const api = process.env.REACT_APP_API_BASE_URL;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const validateForm = () => {
    const updatedErrors = {
      email: !emailRegex.test(email),
      password: !passwordRegex.test(password),
    };

    const errorMessages = {
      email: "Please enter a valid email address",
      password:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!, @, #, $, %, ^, &, *).",
    };

    setFormErrors({
      email: updatedErrors.email ? errorMessages.email : "",
      password: updatedErrors.password ? errorMessages.password : "",
    });

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
        body: JSON.stringify({ email, password }),
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
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to the authenticated home page
      navigator("/main");
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="login">
      <form>
        <h1>Welcome to Odin Book</h1>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {formErrors.email !== "" && (
          <p className="error-message">{formErrors.email}</p>
        )}
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {formErrors.password !== "" && (
          <p className="error-message">{formErrors.password}</p>
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
