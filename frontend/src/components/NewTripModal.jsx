import React from "react";
import { useState } from "react";
import { useCreateTrip } from "../api/trips";
import { now, getLocalTimeZone } from "@internationalized/date";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Select,
  SelectItem,
  DatePicker,
  Spinner,
  addToast,
} from "@heroui/react";
import { useAuth } from "../auth/AuthContext";
import { useQuery } from "@tanstack/react-query";

export default function NewTripModal({ isOpen, onOpen, onOpenChange }) {
  //Get mutate function from useCreateTrip hook
  const { mutate } = useCreateTrip();

  //Get user from auth context
  const { user } = useAuth();

  //State to hold trip data
  const [tripData, setTripData] = useState({
    tour_id: null,
    pickup_time: null,
    party_size: 1,
    pickup_location: "",
    dropoff_location: "",
    status: "PENDING",
    participants_emails: [],
    whatsApp_group_link: "",
    companyId: user?.id || "",
  });

  //curr email in the input
  const [emailInput, setEmailInput] = useState("");

  //Function to handle trip creation
  const handleCreateTrip = () => {
    mutate(tripData, {
      onSuccess: () => {
        //empty the form
        setTripData({
          tour_id: null,
          pickup_time: null,
          party_size: 1,
          pickup_location: "",
          dropoff_location: "",
          status: "PENDING",
          participants_emails: [],
          whatsApp_group_link: "",
          companyId: user?.id || "",
        });
        //close the modal
        onOpenChange(false);
        //Show success toast
        addToast({
          title: "Trip Created",
          description: "The new trip has been successfully created.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "success",
        });
      },
      onError: (error) => {
        console.error("Error creating trip:", error);
        addToast({
          title: "Error",
          description: "There was an error creating the trip.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "danger",
        });
      },
    });
  };

  //Fetch the tours from the backend and render the selection
  const { isPending, error, data } = useQuery({
    queryKey: ["tours"],
    queryFn: () =>
      fetch("http://localhost:3001/tour/get-tours-by-company/" + user?.id).then(
        (res) => res.json()
      ),
  });

  if (isPending) return <Spinner />;
  if (error) return "An error has occurred: " + error.message;

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
              Create New Trip
            </ModalHeader>
            <ModalBody>
              <Select
                label="Tour"
                placeholder="Select a tour"
                variant="bordered"
                isRequired
                selectedKeys={tripData.tour_id ? [tripData.tour_id] : []}
                onSelectionChange={(keys) =>
                  setTripData({
                    ...tripData,
                    tour_id: Array.from(keys)[0],
                  })
                }
              >
                {data.map((tour) => (
                  <SelectItem key={tour.id} value={tour.id}>
                    {tour.name}
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Pickup Location"
                placeholder="Enter pickup location"
                variant="bordered"
                isRequired
                value={tripData.pickup_location}
                onChange={(e) =>
                  setTripData({ ...tripData, pickup_location: e.target.value })
                }
              />
              <Input
                label="Dropoff Location"
                placeholder="Enter dropoff location"
                variant="bordered"
                isRequired
                value={tripData.dropoff_location}
                onChange={(e) =>
                  setTripData({ ...tripData, dropoff_location: e.target.value })
                }
              />
              <DatePicker
                hideTimeZone
                showMonthAndYearPickers
                defaultValue={now(getLocalTimeZone())}
                label="Pickup Time"
                placeholder="Select pickup time"
                variant="bordered"
                isRequired
                onChange={(date) =>
                  setTripData({
                    ...tripData,
                    pickup_time: date.toDate(getLocalTimeZone()).toISOString(),
                  })
                }
                minValue={now(getLocalTimeZone())}
              />
              <Input
                label="Party Size"
                placeholder="Enter party size"
                variant="bordered"
                type="number"
                isRequired
                value={tripData.party_size}
                onChange={(e) =>
                  setTripData({
                    ...tripData,
                    party_size: parseInt(e.target.value),
                  })
                }
              />
              <Input
                label="WhatsApp Group Link"
                placeholder="Enter WhatsApp group link"
                variant="bordered"
                type="text"
                isRequired
                value={tripData.whatsApp_group_link || ""}
                onChange={(e) =>
                  setTripData({
                    ...tripData,
                    whatsApp_group_link: e.target.value,
                  })
                }
              />
              <div className="flex flex-col gap-2 justify-center items-center">
                <Input
                  label="Participants Emails"
                  placeholder="Enter participant emails separated"
                  variant="bordered"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <Button
                  variant="flat"
                  size="sm"
                  color="primary"
                  className="w-25"
                  onPress={() => {
                    setTripData({
                      ...tripData,
                      participants_emails: [
                        ...tripData.participants_emails,
                        emailInput,
                      ],
                    });
                    setEmailInput("");
                  }}
                >
                  Add Email
                </Button>
                <div className="mt-2"></div>
                {tripData.participants_emails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <p>{email}</p>
                    <Button
                      variant="flat"
                      color="danger"
                      size="sm"
                      onPress={() => {
                        setTripData({
                          ...tripData,
                          participants_emails:
                            tripData.participants_emails.filter(
                              (e) => e !== email
                            ),
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="success"
                variant="flat"
                onPress={handleCreateTrip}
                className="border-green-500"
              >
                Create Trip
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
