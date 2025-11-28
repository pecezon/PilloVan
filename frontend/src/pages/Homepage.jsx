import React from "react";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import UserDropdown from "../components/UserDropdown";
import CreationMenu from "../components/CreationMenu";
import TripDashboard from "../components/TripDashboard";
import { Spinner } from "@heroui/react";

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

      setHasOnboarded(data?.finishedOnboarding);
    };

    fetchProfile();
  }, [user]);

  if (loading) return <Spinner />;

  if (!hasOnboarded && hasOnboarded !== null)
    return <Navigate to="/onboarding" />;

  return (
    <div className="w-full min-h-screen flex flex-col items-center gap-4 bg-gradient-to-r from-blue-800 to-indigo-900 text-white">
      <nav className="w-full flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold">PilloVan</h1>
        <UserDropdown user={user} logout={logout} />
      </nav>
      <p className="text-center text-3xl font-bold p-4 max-w-xl my-4">
        Your Trips
      </p>
      <TripDashboard />
      <CreationMenu />
    </div>
  );
}
