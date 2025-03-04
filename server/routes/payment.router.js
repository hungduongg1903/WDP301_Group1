const express = require("express")
const router = express.Router();
const { paymentController } = require("../controllers/index");
// const validate = require("../middleware/validateUser.middleware")

router.post("/create-payment-link", paymentController.createPayment)   




module.exports = router;
