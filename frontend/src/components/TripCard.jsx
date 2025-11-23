import React from "react";

export default function TripCard() {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full flex">
      <div className="flex flex-col justify-between w-5/8">
        <h2 className="text-lg font-bold text-gray-800">
          Riviera Maya Bla Bla Bla
        </h2>
        <p className="text-gray-600">Tourist: Diego Lopez</p>
      </div>
      <div className="flex flex-col items-end w-3/8 text-right justify-between">
        <p className="text-gray-400">Saturday Jan 30</p>
        <p className="text-gray-400">9:00 AM</p>
      </div>
    </div>
  );
}
