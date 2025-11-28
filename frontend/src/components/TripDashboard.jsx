import React from "react";
import TripCard from "./TripCard.jsx";
import { useState } from "react";
import { Divider, Button, Spinner, useDisclosure } from "@heroui/react";
import { useAuth } from "../auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import TripModal from "./TripModal.jsx";
import TripListModal from "./TripListModal.jsx";

export default function TripDashboard() {
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isListOpen,
    onOpen: onListOpen,
    onOpenChange: onListOpenChange,
  } = useDisclosure();

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedTripType, setSelectedTripType] = useState(null);

  //Fetch the active trips from the backend or cache
  const {
    isPending: isPendingActiveTrips,
    error: errorActiveTrips,
    data: activeTrips,
  } = useQuery({
    queryKey: ["active-trips"],
    queryFn: () =>
      fetch(
        "http://localhost:3001/trip/get-active-trips-by-user/" + user?.id
      ).then((res) => res.json()),
  });

  const {
    isPending: isPendingInactiveTrips,
    error: errorInactiveTrips,
    data: inactiveTrips,
  } = useQuery({
    queryKey: ["inactive-trips"],
    queryFn: () =>
      fetch(
        "http://localhost:3001/trip/get-inactive-trips-by-user/" + user?.id
      ).then((res) => res.json()),
  });

  return (
    <>
      <div className="bg-white shadow-md rounded-t-4xl p-4 w-full min-h-screen flex items-center flex-col bg-gradient-to-tr from-slate-50 to-sky-50">
        <div className="h-1/2 w-full mb-4">
          <h4 className="font-bold text-gray-700">Active</h4>
          <Divider className="my-2" />
          <div className="flex flex-col gap-4 items-center">
            {isPendingActiveTrips && <Spinner />}
            {errorActiveTrips && (
              <div className="text-red-500">Error loading active trips</div>
            )}
            {activeTrips && activeTrips.length === 0 && (
              <div className="text-gray-500">No active trips found</div>
            )}
            {activeTrips &&
              activeTrips.slice(0, 2).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => {
                    setSelectedTrip(trip);
                    onOpen();
                  }}
                />
              ))}
            {activeTrips && activeTrips.length > 2 && (
              <Button
                className="mt-2 w-25 bg-gradient-to-r from-blue-800 to-indigo-900 text-white"
                size="md"
                onPress={() => {
                  setSelectedTripType("ACTIVE");
                  onListOpen();
                }}
              >
                Show All
              </Button>
            )}
          </div>
        </div>
        <div className="h-1/2 w-full mt-4">
          <h4 className="font-bold text-gray-700">Inactive</h4>
          <Divider className="my-2" />
          <div className="flex flex-col gap-4 items-center">
            {isPendingInactiveTrips && <Spinner />}
            {errorInactiveTrips && (
              <div className="text-red-500">Error loading inactive trips</div>
            )}
            {inactiveTrips && inactiveTrips.length === 0 && (
              <div className="text-gray-500">No inactive trips found</div>
            )}
            {inactiveTrips &&
              inactiveTrips.slice(0, 2).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => {
                    setSelectedTrip(trip);
                    onOpen();
                  }}
                />
              ))}
            {inactiveTrips && inactiveTrips.length > 2 && (
              <Button
                className="mt-2 w-25 bg-gradient-to-r from-blue-800 to-indigo-900 text-white"
                size="md"
                onPress={() => {
                  setSelectedTripType("INACTIVE");
                  onListOpen();
                }}
              >
                Show All
              </Button>
            )}
          </div>
        </div>
      </div>
      <TripModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        trip={selectedTrip}
      />
      <TripListModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        setSelectedTrip={setSelectedTrip}
        isListOpen={isListOpen}
        onListOpenChange={onListOpenChange}
        trips={selectedTripType === "ACTIVE" ? activeTrips : inactiveTrips}
      />
    </>
  );
}
