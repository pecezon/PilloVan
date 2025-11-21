import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function OnboardingRoute({ children }) {
  const { user, loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .single();

      console.log("Onboarding status:", data);

      setHasOnboarded(data?.onboarded);
    };

    fetchProfile();
  }, [user]);

  if (loading || hasOnboarded === null) return null;

  return hasOnboarded ? <Navigate to="/home" /> : children;
}
