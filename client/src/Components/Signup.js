import React, { useState } from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
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
      passwordConfirm:
        password !== passwordConfirm || passwordConfirm.trim() === "",
    };
    const errorMessages = {
      email: "Please enter a valid email address",
      password:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (!, @, #, $, %, ^, &, *).",
      passwordConfirm: "Passwords do not match",
    };

    setFormErrors({
      email: updatedErrors.email ? errorMessages.email : "",
      password: updatedErrors.password ? errorMessages.password : "",
      passwordConfirm: updatedErrors.passwordConfirm
        ? errorMessages.passwordConfirm
        : "",
    });

    return Object.values(updatedErrors).every((error) => !error);
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    const isFormValid = validateForm();

    if (!isFormValid) {
      return;
    }
    try {
      const response = await fetch(`${api}/user/signup`, {
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
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to the authenticated home page
      navigator("/main");
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="signup">
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
        <label htmlFor="confirm-password">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        {formErrors.passwordConfirm !== "" && (
          <p className="error-message">{formErrors.passwordConfirm}</p>
        )}
        <button onClick={handleSignup}>Signup</button>
        {error && <p className="error-message">{error}</p>}
        <p>
          Do you have an account?
          <span>
            {" "}
            <Link to="/login">Login</Link>
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;
