import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { HotelDetails } from "../models/hotel.model.js";
import { BookingDetails } from "../models/booking.model.js";
import { User } from "../models/user.model.js";

const editHotelDetails = asyncHandler(async (req, res) => {
    // get edit parameters from request body
    // find hotel by hotelId
    // update hotel details
    // return response
    const { address, description,
        roomCount, pricePerNight, contactNo, email, facilities } = req.body;
    const hotel = await HotelDetails.findOne({ email: email });
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }

    const updatedHotel = await HotelDetails.findByIdAndUpdate(hotel._id, {
        address,
        description,
        roomCount,
        pricePerNight,
        contactNo,
        facilities
    }, { new: true, runValidators: true });

    if (!updatedHotel) {
        throw new ApiError(500, "Couldn't update hotel details");
    }

    res.status(200).json(new ApiResponse(200, { hotel: updatedHotel }, "Hotel details updated successfully"));
});

const hotelDetails = asyncHandler(async (req, res) => {
    // get hotel details by email of a manager
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const hotel = await HotelDetails.findOne({ email });
    if (!hotel) {
        throw new ApiError(404, "Hotel not found");
    }
    return res.status(200).json(new ApiResponse(200, hotel, "Hotel details fetched successfully"));
});

const getBookings = asyncHandler(async (req, res) => {
    const hotelId = req.params.hotelId;

     try {
        const Bookings = await BookingDetails.find({ hotelId });

        // console.log(Bookings);
         
        let Users = [];
        for (const Booking of Bookings) {
            const userId = Booking.userId;
             
            // fetching require fields
            const user = await User.findById(userId).select("first_name last_name e_mail mobile_number");
            const booking = await BookingDetails.findById(Booking._id).select("checkInDate checkOutDate roomCount totalCost");

            if (user && booking) {
                const User = {
                    name: `${user.first_name} ${user.last_name}`,
                    email: user.e_mail,
                    contactNo: user.mobile_number,
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    bookedRooms: booking.roomCount,
                    totalCost: booking.totalCost,
                };

                // console.log(User);
                Users.push(User);
            }
        }

        // console.log("--->",Users);
        return res
            .status(200)
            .json(new ApiResponse(200, Users, "Booking Details return successfully"));

    } catch (error) {
        throw new ApiError(500, "An error occurred while retrieving booking.");
    }

});

export { editHotelDetails, hotelDetails,getBookings };