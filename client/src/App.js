import React, { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Components/Home";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import Main from "./Components/Main";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import { useAuth } from "./authContext";

function App() {
  const { login, logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token) {
      login(token, user);
    } else {
      logout();
    }
  }, []);

  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/main" element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Footer />
    </HashRouter>
  );
}

export default App;
