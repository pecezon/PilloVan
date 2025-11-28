import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableCell,
  TableRow,
  Chip,
} from "@heroui/react";
import { useState } from "react";

export default function TripListModal({
  trips,
  isOpen,
  onOpenChange,
  isListOpen,
  onListOpenChange,
  setSelectedTrip,
}) {
  return (
    <Modal
      isOpen={isListOpen}
      placement="center"
      onOpenChange={onListOpenChange}
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">All Trips</ModalHeader>
            <ModalBody>
              <Table
                aria-label="Example static collection table"
                selectionMode="single"
              >
                <TableHeader>
                  <TableColumn>Tour</TableColumn>
                  <TableColumn>Date</TableColumn>
                  <TableColumn>Status</TableColumn>
                </TableHeader>
                <TableBody>
                  {trips?.map((trip) => (
                    <TableRow
                      key={trip.id}
                      onPress={() => {
                        setSelectedTrip(trip);
                        onOpenChange();
                      }}
                    >
                      <TableCell>{trip.tour?.name}</TableCell>
                      <TableCell>
                        {new Date(trip.pickup_time).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={
                            trip.status === "PENDING"
                              ? "warning"
                              : trip.status === "IN_PROGRESS"
                              ? "primary"
                              : trip.status === "COMPLETED"
                              ? "success"
                              : "danger"
                          }
                          size="sm"
                        >
                          {trip.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
