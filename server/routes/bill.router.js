const express = require("express")
const router = express.Router();
const { billController } = require("../controllers/index");
// const validate = require("../middleware/validateUser.middleware")


router.get("/getAll", billController.getAllBills)   

router.get("/getAll/:courtId", billController.getAllBillsByCourtId)   

router.get("/getAll/date/:courtId", billController.getAllBillsByCourtIdAndCurrentDate)   

router.get("/get/:id", billController.getBill)

router.post("/add", billController.addBill)

router.put("/update/:id", billController.updateBill)

router.put("/update/by/:orderCode", billController.updateBillByOrderCodePayOS)

router.delete("/delete/:id", billController.deleteBill)

router.get("/getAll/user/:userId", billController.getAllBillsByUserId)

module.exports = router;
