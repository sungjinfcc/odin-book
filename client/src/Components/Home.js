import React, { useEffect } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import Login from "./Login";

function Home() {
  const { isAuthenticated } = useAuth();
  const navigator = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigator("/main");
    }
  });

  return (
    <div className="home">
      <Login />
    </div>
  );
}

export default Home;
