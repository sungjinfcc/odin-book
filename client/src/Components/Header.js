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

  return isAuthenticated ? (
    <div className="header">
      <h1>OdinBook</h1>
      <div className="menu-buttons">
        <Link to="/main">Home</Link>
        <Link to="/friends">Friends</Link>
        <Link to="/profile">Profile</Link>
      </div>
      <button onClick={signout}>Logout</button>
    </div>
  ) : null;
}

export default Header;
