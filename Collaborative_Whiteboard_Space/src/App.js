import React from "react";
import { Routes, Route, redirect, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Join from "./pages/join/join";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Session from "./pages/session/session";
import Dashboard from "./pages/dashboard/dashboard";

const App = () => {
  const { user } = useSelector((state) => state.user);

  let routes = "";

  if (!user) {
    console.log("base route");
    routes = (
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  if (user && user.type == "auth") {
    console.log("auth route");
    routes = (
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/session" element={<Session />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    );
  }

  if (user && user.type == "guest") {
    console.log("guest route");
    routes = (
      <Routes>
        <Route path="/session" element={<Session />} />
        <Route path="*" element={<Navigate to="/session" />} />
      </Routes>
    );
  }

  return <div>{routes}</div>;
};

export default App;
