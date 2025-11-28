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
} from "@heroui/react";
import { getTimeFromDate } from "../utils/getTimeFromDate";
import { getDayFromDate } from "../utils/getDayFromDate";

export default function TripModal({ trip, isOpen, onOpenChange }) {
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
              <div>
                <span className="font-semibold">Status: </span>
                <Chip
                  size="sm"
                  color={trip?.status === "COMPLETED" ? "success" : "primary"}
                >
                  {trip?.status}
                </Chip>
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
