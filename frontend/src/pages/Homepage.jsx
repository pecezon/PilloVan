import React from "react";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function Homepage() {
  const { user, loading, logout } = useAuth();

  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("finishedOnboarding")
        .eq("auth_id", user.id)
        .single();

      console.log("Onboarding status:", data);
      console.log("user:", user);

      setHasOnboarded(data?.finishedOnboarding);
    };

    fetchProfile();
  }, [user]);

  if (loading) return null;

  if (!hasOnboarded && hasOnboarded !== null)
    return <Navigate to="/onboarding" />;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
