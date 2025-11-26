import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Form, Input, Button, Select, SelectItem } from "@heroui/react";
import { useAuth } from "../auth/AuthContext";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import isPhoneValid from "../utils/validatePhoneNumber";
import { createWhapiContact } from "../utils/createWhapiContact";

export default function Onboarding() {
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

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
    age: "",
  });

  const isValid = isPhoneValid(profile.phone);

  if (loading) return null;

  if (hasOnboarded && hasOnboarded !== null) return <Navigate to="/home" />;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center gap-4 p-8 bg-cover bg-center bg-no-repeat bg-[url('/images/playa-del-carmen.avif')] md:bg-[url('/images/riviera-maya.jpg')]">
      <Form
        className="w-full max-w-xs flex flex-col gap-4 bg-white p-6 rounded-xl shadow-md"
        onSubmit={async (e) => {
          e.preventDefault();

          const whapi_id = await createWhapiContact({
            phone: profile.phone,
            name: `${profile.firstName} ${profile.lastName}`,
          });

          if (!whapi_id) {
            console.error("Error creating WhatsApp contact:", contactError);
          }

          const { error } = await supabase
            .from("users")
            .update({
              firstName: profile.firstName,
              lastName: profile.lastName,
              phone: profile.phone,
              gender: profile.gender,
              age: parseInt(profile.age),
              finishedOnboarding: true,
              whapi_id: whapi_id || null,
            })
            .eq("auth_id", user.id);
          if (error) {
            console.error("Error updating profile:", error);
          } else {
            window.location.href = "/home";
          }
        }}
        onChange={(e) => {
          setProfile({
            ...profile,
            [e.target.name]: e.target.value,
          });
        }}
      >
        <Input
          isRequired
          label="First Name"
          labelPlacement="outside"
          name="firstName"
          placeholder="Enter your first name"
          type="text"
        />

        <Input
          isRequired
          errorMessage="Please enter a valid last name"
          label="Last Name"
          labelPlacement="outside"
          name="lastName"
          placeholder="Enter your last name"
          type="text"
        />

        <label htmlFor="phone">Phone Number</label>
        <PhoneInput name="phone" defaultCountry="mx" value={profile.phone} />
        {!isValid && profile.phone.length > 0 && (
          <p className="text-red-500 text-sm">
            Please enter a valid phone number
          </p>
        )}

        <Select
          isRequired
          label="Gender"
          labelPlacement="outside"
          name="gender"
          placeholder="Select your gender"
          selectedKeys={[profile.gender]}
          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
        >
          <SelectItem key="MALE">Male</SelectItem>
          <SelectItem key="FEMALE">Female</SelectItem>
          <SelectItem key="OTHER">Other</SelectItem>
        </Select>

        <Input
          isRequired
          label="Age"
          labelPlacement="outside"
          name="age"
          placeholder="Enter your age"
          type="number"
        />

        <div className="flex gap-2">
          <Button color="primary" type="submit" disabled={!isValid}>
            Submit
          </Button>
          <Button type="reset" variant="flat">
            Reset
          </Button>
        </div>
      </Form>

      <Button color="danger" onPress={logout}>
        Logout
      </Button>
    </div>
  );
}
