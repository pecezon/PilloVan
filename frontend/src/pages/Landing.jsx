import React from "react";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useAuth } from "../auth/AuthContext";
import { Navigate } from "react-router-dom";

export default function Landing() {
  const { user, loading, loginWithGoogle } = useAuth();

  const [hasOnboarded, setHasOnboarded] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

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

  if (loading) return null;

  if (!hasOnboarded && hasOnboarded !== null)
    return <Navigate to="/onboarding" />;

  if (hasOnboarded && hasOnboarded !== null) return <Navigate to="/home" />;

  return (
    <div className="w-full h-screen bg-cover bg-center bg-no-repeat bg-[url('/images/playa-del-carmen.avif')] md:bg-[url('/images/riviera-maya.jpg')]">
      <div
        className="w-full h-screen bg-cover bg-center bg-no-repeat flex pt-8 items-center flex-col gap-4 text-center text-white md:pt-16"
        style={{ backgroundImage: "url('/images/wavy-top.svg')" }}
      >
        <h1 className="text-4xl font-bold">Welcome to PilloVan</h1>
        <h3>“Tu aventura empieza con nosotros.”</h3>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Button
          color="primary"
          endContent={<i className="fa-solid fa-bus-simple" />}
          onPress={loginWithGoogle}
        >
          Comienza tu viaje
        </Button>
      </div>
    </div>
  );
}
