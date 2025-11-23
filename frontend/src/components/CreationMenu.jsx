import React from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@heroui/react";
import NewTourModal from "./NewTourModal";

export default function CreationMenu() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Button
            isBordered
            isIconOnly
            aria-label="Like"
            color="success"
            className="transition-transform fixed bottom-4 right-4 z-50 rounded-full h-14 w-14"
          >
            <i className="fa-solid fa-plus text-2xl"></i>
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Profile Actions"
          variant="faded"
          disabledKeys={["profile"]}
        >
          <DropdownItem key="profile" className="h-10 gap-2">
            <p className="font-semibold">Create New:</p>
          </DropdownItem>
          <DropdownItem key="trip" startContent>
            <i className="fa-solid fa-bus pr-2 text-gray-500"></i>
            Trip
          </DropdownItem>
          <DropdownItem key="tour" startContent onPress={onOpen}>
            <i className="fa-solid fa-map pr-2 text-gray-500"></i>
            Tour
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <NewTourModal
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
      />
    </>
  );
}
