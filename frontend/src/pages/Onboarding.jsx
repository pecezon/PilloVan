import React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Button } from "@heroui/react";
import { useAuth } from "../auth/AuthContext";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
  });

  if (loading) return null;
}
