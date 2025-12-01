import React from "react";
import { getDayFromDate } from "../utils/getDayFromDate";
import { getTimeFromDate } from "../utils/getTimeFromDate";

export default function TripCard({ trip, onClick }) {
  return (
    <div
      className="bg-white shadow-md rounded-lg p-4 w-full flex cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex flex-col justify-between w-5/8">
        <h2 className="text-lg font-bold text-gray-800">{trip?.tour?.name}</h2>
        <p className="text-gray-600">
          Tourists:{" "}
          {trip?.users
            ?.filter((u) => u.user?.role === "TOURIST")
            .map((u) => u.user?.firstName)
            .join(", ")
            .slice(0, 27)}
        </p>
      </div>
      <div className="flex flex-col items-end w-3/8 text-right justify-between">
        <p className="text-gray-400">{getDayFromDate(trip?.pickup_time)}</p>
        <p className="text-gray-400">{getTimeFromDate(trip?.pickup_time)}</p>
      </div>
    </div>
  );
}
