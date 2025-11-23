import React from "react";
import TripCard from "./TripCard.jsx";
import { Divider, Button } from "@heroui/react";

export default function TripDashboard() {
  return (
    <div className="bg-white shadow-md rounded-t-4xl p-4 w-full min-h-screen flex items-center flex-col bg-gradient-to-tr from-slate-50 to-sky-50">
      <div className="h-1/2 w-full mb-4">
        <h4 className="font-bold text-gray-700">Active</h4>
        <Divider className="my-2" />
        <div className="flex flex-col gap-4 items-center">
          <TripCard />
          <TripCard />
          <Button className="mt-2 w-25" size="md">
            Show All
          </Button>
        </div>
      </div>
      <div className="h-1/2 w-full mt-4">
        <h4 className="font-bold text-gray-700">Inactive</h4>
        <Divider className="my-2" />
        <div className="flex flex-col gap-4 items-center">
          <TripCard />
          <TripCard />
          <Button className="mt-2 w-25" size="md">
            Show All
          </Button>
        </div>
      </div>
    </div>
  );
}
