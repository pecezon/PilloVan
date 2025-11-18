const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get all trips
router.get('/get-trips', async (req, res) => {
    try {
        const trips = await prisma.trip.findMany();
        
        return res.status(200).json(trips);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
});

// get all trips for a certain tour
router.get('/get-trips-by-tour/:tourId', async (req, res) => {

    try {
        const tourId = parseInt(req.params.tourId);
        const tripList = await prisma.trip.findMany({
            where: {
                tourId : tourId
            },
        });

        if(tripList.length === 0 ){
            return res.status(404).json({ error: "No trips found for this tour" });
        }

        return res.status(200).json(tripList);

    } catch (error) {
        return res.status(500).json({
            error: "Internal server error retriving trips for the specified tour.",
            details: error.message,
        });
    }
});

// get trip by id
router.get('/get-trip/:id', async (req, res) => {

    try {
        const tripId = parseInt(req.params.id);

        const trip = await prisma.trip.findUnique({
            where: {
                id : tripId,
            },
        });

        if (!trip){
            return res.status(404).json({error: "Trip not found."})
        }

        return res.status(200).json(trip);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error retriving the specified trip.",
            details: error.message,
        });
    }
})

// create new trip
router.post('/create-trip', async (req, res) => {
    
    try {
        const {touristId, companyId, driverId, salesmanId, transportCompanyId, tourId, pickup_time, whatsApp_group_link, party_size, pickup_location, dropoff_location, status} = req.body;
    
        const newTrip = await prisma.trip.create({
            data: {
                touristId,
                companyId,
                driverId,
                salesmanId,
                transportCompanyId,
                tourId,
                pickup_time,
                whatsApp_group_link,
                party_size,
                pickup_location,
                dropoff_location,
                status: status || "PENDING",
            },
        });

        return res.status(201).json(newTrip);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error during trip registration.",
            details: error.message,
        });
    }
});

// update trip
router.put('/update-trip/:id', async (req, res) => {

    try {
        const tripId = parseInt(req.params.id);

        const updatedTrip = await prisma.trip.update({
            where: {
                id: tripId,
            },
            data: 
                req.body,
        });

        return res.status(200).json(updatedTrip);
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error updating trip.",
            details: error.message,
        });
    }
})

// delete trip by id
router.delete('/delete-trip/:id', async (req, res) => {

    try {
        const tripId = parseInt(req.params.id);

        const deletedTrip = await prisma.trip.delete({
            where: {
                id : tripId,
            },
        });

        return res.status(204).json({message: 'Trip deleted correctly'});
    } catch (error) {
        return res.status(500).json({
            error: "Internal server error deleting specified trip",
            details: error.message,
        });
    }
});

module.exports = router;