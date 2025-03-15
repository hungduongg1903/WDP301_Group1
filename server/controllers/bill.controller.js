const mongoose = require("mongoose");
const db = require('../models');
const Bill = db.bill;
const User = db.User;
const { parse, addHours, format, isBefore, isAfter } =  require("date-fns");


const getBill = async (req, res, next) => {
  try {
    const billId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    const bill = await Bill.findById(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      bill,
    });
  } catch (err) {
    console.error(err); 
    return next(err);
  }
};

const getAllBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({}).populate("court_id","court_name").populate("user_id", ["email", "phone", "name"]);
    // const bills = await Bill.find({});
    if (!bills.length) {
      return res.status(404).json({
        success: false,
        message: "No bills found"
      });
    }

    return res.status(200).json({
      success: true,
      billsList: bills
    });
  } catch (err) {
    console.error(err); 

    return res.status(err.code || 400).json({
      success: false,
      message: err.message,
      error: err
    });
  }
};

const getAllBillsByCourtId = async (req, res, next) => {
  try {
    const courtId = req.params.courtId;
    const bills = await Bill.find({court_id: courtId}).populate("court_id","court_name").populate("user_id", ["email", "phone", "name"]);
    // const bills = await Bill.find({});
    if (!bills.length) {
      return res.status(200).json({
        success: true,
        message: "No bills found",
        // error: "No bills found"
      });
    }

    return res.status(200).json({
      success: true,
      billsList: bills
    });
  } catch (err) {
    console.error(err); 

    return res.status(err.code || 400).json({
      success: false,
      message: err.message,
      error: err
    });
  }
};


const getAllBillsByCourtIdAndCurrentDate = async (req, res, next) => {
  try {
    const courtId = req.params.courtId;
    const currentDate = new Date()

    //lấy list bill
    const bills = await Bill.find({court_id: courtId}).populate("court_id","court_name").populate("user_id", ["email", "phone", "name"]);
    // const bills = await Bill.find({});
    if (!bills.length) {
      return res.status(200).json({
        success: true,
        billList: [],
        message: "Bills empty"
      });
    }

    //chọn những bill có thời gian thuê sau thời gian thực 
    const newBills = bills.filter( bill => {
      const timeRental = parse(bill.time_rental, "dd/MM/yyyy HH:mm:ss", new Date());
      return isBefore(currentDate, timeRental)
    })
    console.log("newBills: ", newBills)

    return res.status(200).json({
      success: true,
      billList: newBills
    });
  } catch (err) {
    console.error(err); 

    return res.status(err.code || 400).json({
      success: false,
      message: err.message,
      error: err
    });
  }
};


const addBill = async (req, res, next) => {
  const newBillData = {
    retal_price : req.body.rentalPrice,
    time_rental: req.body.timeRental,
    court_id: req.body.courtId,
    user_id: req.body.userId,
    counter_account_name: req.body.counterAccountName,
    counter_account_number: req.body.counterAccountNumber,
    order_code_pay_os: req.body.orderCodePayOs,
    status: req.body.status || 'pending', // Default to pending if not provided
    transaction_date_time: req.body.transactionDateTime,
    reference_bank: req.body.referenceBank,
  };
  console.log("err")
  console.log(newBillData);
  
  try {
    const newBill = new Bill(newBillData);
    console.log(newBill)
    const savedBill = await newBill.save();

    return res.status(200).json({
      success: true,
      newBill: savedBill,
    });
  } catch (err) {
    console.error(err); 

    return res.status(err.code || 400).json({
      success: false,
      message: err.message,
      error: err
    });
  }
};


const updateBill = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const updatedBill = req.body;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    const bill = await Bill.findByIdAndUpdate(billId, updatedBill, { new: true, runValidators: true });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      updatedBill: bill,
    });
  } catch (err) {
    console.error(err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: err.message,
      });
    }
    return next(err);
  }
};

// New function specifically for updating booking status
const updateBookingStatus = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    // Validate the status value
    const validStatuses = ['pending', 'success', 'cancel', 'paid'];
    if (!validStatuses.includes(status?.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Status must be one of: pending, success, cancel, paid",
      });
    }

    // Get the current bill to check status transitions
    const currentBill = await Bill.findById(billId);
    
    if (!currentBill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    // Prevent certain status transitions
    if (currentBill.status?.toLowerCase() === 'cancel' && status !== 'cancel') {
      return res.status(400).json({
        success: false,
        message: "Cannot change status from 'cancel' to another status",
      });
    }

    if ((currentBill.status?.toLowerCase() === 'success' || currentBill.status?.toLowerCase() === 'paid') && status === 'pending') {
      return res.status(400).json({
        success: false,
        message: "Cannot change status from 'success' to 'pending'",
      });
    }

    // Check if the booking time has already passed
    if (currentBill.time_rental) {
      try {
        const timeRental = parse(currentBill.time_rental, "dd/MM/yyyy HH:mm:ss", new Date());
        const currentDate = new Date();
        
        if (isAfter(currentDate, timeRental) && status === 'cancel') {
          return res.status(400).json({
            success: false,
            message: "Cannot cancel a booking after its scheduled time",
          });
        }
      } catch (parseErr) {
        console.error('Error parsing date:', parseErr);
      }
    }

    // Update the bill status
    const updatedBill = await Bill.findByIdAndUpdate(
      billId, 
      { status }, 
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}' successfully`,
      updatedBill,
    });
  } catch (err) {
    console.error(err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: err.message,
      });
    }
    return next(err);
  }
};

// New function for changing booking details (time or court)
const changeBooking = async (req, res, next) => {
  try {
    const billId = req.params.id;
    const { time_rental, court_id, end_time_rental, retal_price } = req.body;

    console.log('Received change request:', { billId, time_rental, court_id, end_time_rental, retal_price });

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    // Get the current bill
    const currentBill = await Bill.findById(billId);
    if (!currentBill) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Prevent changes to cancelled or completed bookings
    if (currentBill.status?.toLowerCase() === 'cancel') {
      return res.status(400).json({
        success: false,
        message: "Cannot modify a cancelled booking",
      });
    }

    // Check if the booking time has already passed
    if (currentBill.time_rental) {
      try {
        const timeRental = parse(currentBill.time_rental, "dd/MM/yyyy HH:mm:ss", new Date());
        const currentDate = new Date();
        
        if (isAfter(currentDate, timeRental)) {
          return res.status(400).json({
            success: false,
            message: "Cannot modify a booking after its scheduled time",
          });
        }
      } catch (parseErr) {
        console.error('Error parsing date:', parseErr);
      }
    }

    // Build update object based on what needs to be changed
    const updateData = {};
    
    // Add all provided fields to update data
    if (time_rental) updateData.time_rental = time_rental;
    if (end_time_rental) updateData.end_time_rental = end_time_rental;
    if (court_id) updateData.court_id = court_id;
    if (retal_price) updateData.retal_price = retal_price;
    
    console.log('Update data:', updateData);
    
    // Check and validate time change
    if (time_rental) {
      try {
        // Validate the new time is in the future
        const newTimeRental = parse(time_rental, "dd/MM/yyyy HH:mm:ss", new Date());
        const currentDate = new Date();
        
        if (isAfter(currentDate, newTimeRental)) {
          return res.status(400).json({
            success: false,
            message: "New booking time must be in the future",
          });
        }
      } catch (parseErr) {
        console.error('Error parsing time_rental:', parseErr);
        return res.status(400).json({
          success: false,
          message: "Invalid time format. Expected dd/MM/yyyy HH:mm:ss",
        });
      }
    }
    
    // Check and validate court change
    if (court_id) {
      // Validate court exists
      if (!mongoose.Types.ObjectId.isValid(court_id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid court ID",
        });
      }
      
      // Skip court validation for now
      // Just check if it's a valid ObjectId, which we did above
    }
    
    // If no changes requested
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No changes requested",
      });
    }
    
    // Update the bill
    const updatedBill = await Bill.findByIdAndUpdate(
      billId, 
      updateData, 
      { new: true, runValidators: true }
    ).populate("court_id", "court_name").populate("user_id", ["email", "phone", "name"]);
    
    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      updatedBill,
    });
    
  } catch (err) {
    console.error('Error in changeBooking:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: err.message,
      });
    }
    return next(err);
  }
};

const updateBillByOrderCodePayOS = async (req, res, next) => {
  try {
    
    const orderCode = req.params.orderCode;
    const updatedBill = {
      user_id: req.body.userId,
      court_id: req.body.courtId,
    };
    console.log(updatedBill)
    // const billCheck = await Bill.findOne({ order_code_pay_os: orderCode })

    console.log(123)

    const bill = await Bill.findOneAndUpdate({ order_code_pay_os: orderCode }, updatedBill, { new: true, runValidators: true });
    console.log(123)
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found. Wait few second and reset page",
      });
    }

    return res.status(200).json({
      success: true,
      updatedBill: bill,
    });
  } catch (err) {
    console.error(err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: err.message,
      });
    }
    return next(err);
  }
};


const deleteBill = async (req, res, next) => {
  try {
    const billId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(billId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    const bill = await Bill.findByIdAndDelete(billId);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "Bill not found",
      });
    }

    return res.status(200).json({
      success: true,
      deletedBill: bill,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const getAllBillsByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const bills = await Bill.find({user_id: userId})
                           .populate("court_id","court_name")
                           .populate("user_id", ["email", "phone", "name"])
                           .sort({createdAt: -1}); // Sắp xếp theo thời gian tạo mới nhất
    
    if (!bills.length) {
      return res.status(200).json({
        success: true,
        message: "No bills found for this user",
        billsList: []
      });
    }

    return res.status(200).json({
      success: true,
      billsList: bills
    });
  } catch (err) {
    console.error(err); 

    return res.status(err.code || 400).json({
      success: false,
      message: err.message,
      error: err
    });
  }
};

const billController = {
  getBill,
  getAllBills,
  addBill,
  updateBill,
  updateBookingStatus,
  changeBooking,
  updateBillByOrderCodePayOS,
  getAllBillsByCourtId,
  getAllBillsByCourtIdAndCurrentDate,
  deleteBill,
  getAllBillsByUserId
};

module.exports = billController;