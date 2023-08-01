import React from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import { faBook } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigator = useNavigate();

  const signout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigator("/");
  };

  return isAuthenticated ? (
    <div className="header responsive">
      <h1>
        <FontAwesomeIcon icon={faBook} /> Odin Book
      </h1>
      <div className="menu-buttons responsive">
        <Link to="/main">
          <FontAwesomeIcon icon={faHouse} />
        </Link>
        <Link to="/friends">
          <FontAwesomeIcon icon={faUserGroup} />
        </Link>
        <Link to="/profile">
          <FontAwesomeIcon icon={faIdCard} />
        </Link>
      </div>
      <button onClick={signout}>Logout</button>
    </div>
  ) : null;
}

export default Header;
