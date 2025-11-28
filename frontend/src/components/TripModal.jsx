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
  // tour body example
  // "id": 22,
  // 	"tourId": 3,
  // 	"pickup_time": "2026-04-16T17:45:02.652Z",
  // 	"whatsApp_group_link": "https://chat.whatsapp.com/CjOXZTyLkLQLiCSivYoeQF",
  // 	"party_size": 1,
  // 	"pickup_location": "sdfasdfas",
  // 	"dropoff_location": "asdfasdfasf",
  // 	"status": "PENDING",
  // 	"users": [
  // 		{
  // 			"user": {
  // 				"auth_id": "8329e6ac-445e-4219-86e9-17d8198d0304",
  // 				"firstName": "Linette",
  // 				"lastName": "Acosta",
  // 				"phone": "+52 668 212 9013",
  // 				"phoneAlt": null,
  // 				"email": "linette.acosta@cetys.edu.mx",
  // 				"age": 20,
  // 				"whapi_id": "5216682129013",
  // 				"gender": "FEMALE",
  // 				"role": "TOURIST",
  // 				"finishedOnboarding": true,
  // 				"createdAt": "2025-11-23T20:15:23.609Z"
  // 			}
  // 		},
  // 		{
  // 			"user": {
  // 				"auth_id": "99af0a10-80a7-4db3-b126-d9d71c7ef8df",
  // 				"firstName": "Diego",
  // 				"lastName": "Lopez",
  // 				"phone": "+52 646 294 3298",
  // 				"phoneAlt": null,
  // 				"email": "diego.lopez171205@gmail.com",
  // 				"age": 20,
  // 				"whapi_id": null,
  // 				"gender": "MALE",
  // 				"role": "TOURIST",
  // 				"finishedOnboarding": true,
  // 				"createdAt": "2025-11-23T06:51:05.584Z"
  // 			}
  // 		}
  // 	],
  // 	"tour": {
  // 		"id": 3,
  // 		"name": "pene",
  // 		"place": "pene",
  // 		"occupancy": 1,
  // 		"description": "",
  // 		"companyId": "99af0a10-80a7-4db3-b126-d9d71c7ef8df"
  // 	}
  // }

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
