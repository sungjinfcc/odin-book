import React, { useEffect } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";

function Main() {
  const { user, isAuthenticated } = useAuth();
  const navigator = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigator("/");
    }
  });

  return (
    <div className="main">
      <h1>Welcome {user?.email}</h1>
    </div>
  );
}

export default Main;
