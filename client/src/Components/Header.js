import React from "react";
import { useAuth } from "../authContext";
import { Link } from "react-router-dom";

function Header() {
  const { isAuthenticated, logout } = useAuth();

  const signout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="header">
      <h1>Title</h1>
      <Link to="/login">Login</Link>
      <Link to="/signup">Signup</Link>
      <button onClick={signout}>Logout</button>
    </div>
  );
}

export default Header;
