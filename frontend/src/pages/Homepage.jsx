import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function Homepage() {
  const { user, loading, logout } = useAuth();

  if (loading) return null;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
