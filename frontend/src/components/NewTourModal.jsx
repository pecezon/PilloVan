import { useState } from "react";
import { useCreateTour } from "../api/tours";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  addToast,
} from "@heroui/react";
import { useAuth } from "../auth/AuthContext";

export default function NewTourModal({ isOpen, onOpen, onOpenChange }) {
  const { mutate } = useCreateTour();
  const { user } = useAuth();
  const [tourData, setTourData] = useState({
    name: "",
    place: "",
    occupancy: 1,
    description: "",
    companyId: user?.id || "",
  });
  const handleCreateTour = () => {
    mutate(tourData, {
      onSuccess: () => {
        setTourData({
          name: "",
          place: "",
          occupancy: 1,
          description: "",
          companyId: user?.id || "",
        });
        onOpenChange(false);
        addToast({
          title: "Tour Created",
          description: "The new tour has been successfully created.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "success",
        });
      },
      onError: (error) => {
        addToast({
          title: "Error",
          description: "There was an error creating the tour.",
          timeout: 3000,
          shouldShowTimeoutProgress: true,
          color: "danger",
        });
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Create New Tour
            </ModalHeader>
            <ModalBody>
              <Input
                label="Tour Name"
                placeholder="Enter tour name"
                variant="bordered"
                isRequired
                value={tourData.name}
                onChange={(e) =>
                  setTourData({ ...tourData, name: e.target.value })
                }
              />
              <Input
                label="Place"
                placeholder="Enter place"
                variant="bordered"
                isRequired
                value={tourData.place}
                onChange={(e) =>
                  setTourData({ ...tourData, place: e.target.value })
                }
              />
              <Input
                label="Occupancy"
                placeholder="Enter occupancy"
                variant="bordered"
                type="number"
                isRequired
                value={tourData.occupancy}
                onChange={(e) =>
                  setTourData({
                    ...tourData,
                    occupancy: parseInt(e.target.value),
                  })
                }
              />
              <Input
                label="Description"
                placeholder="Enter description"
                variant="bordered"
                value={tourData.description}
                onChange={(e) =>
                  setTourData({ ...tourData, description: e.target.value })
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="success"
                variant="flat"
                onPress={handleCreateTour}
                className="border-green-500"
              >
                Create Tour
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
