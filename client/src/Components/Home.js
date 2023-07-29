import React from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";

function Home() {
  const { isAuthenticated } = useAuth();
  const navigator = useNavigate();

  const checkAuth = () => {
    isAuthenticated ? navigator("/main") : navigator("/login");
  };

  return (
    <div className="home">
      <h1>Welcome to My App</h1>
      <button onClick={() => checkAuth()}>Start</button>
    </div>
  );
}

export default Home;
