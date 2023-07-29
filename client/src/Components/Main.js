import React from "react";
import { useAuth } from "../authContext";

function Main() {
  const { user } = useAuth();

  return (
    <div className="main">
      <h1>Welcome {user?.username}</h1>
    </div>
  );
}

export default Main;
