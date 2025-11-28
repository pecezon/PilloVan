import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
  Chip,
  Button,
  addToast,
  Select,
  Spinner,
  SelectItem,
} from "@heroui/react";
import { supabase } from "../supabaseClient";
import { getTimeFromDate } from "../utils/getTimeFromDate";
import { getDayFromDate } from "../utils/getDayFromDate";
import { useUpdateTripStatus } from "../api/trips";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

export default function TripModal({ trip, isOpen, onOpenChange }) {
  //Status select items
  const items = [
    { key: "PENDING", color: "warning" },
    { key: "IN_PROGRESS", color: "primary" },
    { key: "COMPLETED", color: "success" },
    { key: "CANCELLED", color: "danger" },
  ];
  const { mutate: updateTripStatus } = useUpdateTripStatus();

  //Local state to hold selected status
  const [selectedStatus, setSelectedStatus] = useState(trip?.status);
  useEffect(() => {
    if (trip?.status) {
      setSelectedStatus(trip.status);
    }
  }, [trip?.status]);

  // Handle status change
  const handleStatusChange = (newStatus) => {
    updateTripStatus(
      { tripId: trip.id, status: newStatus },
      {
        onSuccess: () => {
          addToast({
            title: "Trip Updated",
            description: "The trip status has been successfully updated.",
            timeout: 3000,
            shouldShowTimeoutProgress: true,
            color: "success",
          });
          setSelectedStatus(newStatus);
        },
      }
    );
  };

  //User role fetch
  const { user, loading } = useAuth();

  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user.id)
        .single();

      setRole(data?.role);
    };

    fetchProfile();
  }, [user]);

  if (loading || role === null) return <Spinner />;

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Trip Details
            </ModalHeader>
            <ModalBody>
              {trip ? (
                <div className="flex gap-2">
                  <h2 className="text-lg text-gray-800 font-bold">Tour: </h2>
                  <h2 className="text-lg text-gray-800">{trip.tour?.name}</h2>
                </div>
              ) : (
                <p>No trip selected</p>
              )}
              <Divider />

              <p>
                <span className="font-semibold">Tourists: </span>
                {trip?.users
                  ?.filter((u) => u.user?.role === "TOURIST")
                  .map((u) => u.user?.firstName + " " + u.user?.lastName)
                  .join(", ")}
              </p>
              <p>
                <span className="font-semibold">Pickup Location: </span>
                {trip?.pickup_location}
              </p>
              <p>
                <span className="font-semibold">Dropoff Location: </span>
                {trip?.dropoff_location}
              </p>
              <p>
                <span className="font-semibold">Pickup Time: </span>
                {getDayFromDate(trip?.pickup_time) +
                  " at " +
                  getTimeFromDate(trip?.pickup_time)}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status: </span>
                {role === "ADMIN" || role === "COMPANY" ? (
                  <Select
                    className="w-40"
                    items={items}
                    selectedKeys={[selectedStatus]}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0];
                      setSelectedStatus(value);
                      handleStatusChange(value);
                    }}
                    renderValue={(items) =>
                      items.map((item) => (
                        <Chip key={item.key} color={item.data.color} size="sm">
                          {item.key}
                        </Chip>
                      ))
                    }
                  >
                    {(item) => (
                      <SelectItem key={item.key}>
                        <Chip color={item.color} size="sm">
                          {item.key}
                        </Chip>
                      </SelectItem>
                    )}
                  </Select>
                ) : (
                  <Chip
                    color={
                      items.find((item) => item.key === selectedStatus)?.color
                    }
                    size="sm"
                  >
                    {selectedStatus}
                  </Chip>
                )}
              </div>
              <p>
                <span className="font-semibold">Party Size: </span>
                {trip?.party_size}
              </p>
            </ModalBody>
            <ModalFooter>
              <div className="flex justify-between">
                <a href={trip?.whatsApp_group_link}>
                  <Button
                    isIconOnly
                    aria-label="WhatsApp Group"
                    color="success"
                    className="transition-transform rounded-full h-12 w-12"
                  >
                    <i className="fa-brands fa-whatsapp text-2xl text-white"></i>
                  </Button>
                </a>
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
