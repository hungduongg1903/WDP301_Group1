const mongoose = require("mongoose");
const db = require('../models');
const Court = db.court;
const PayOS = require('@payos/node')

function getRandomNumber() {
    return Math.floor(Math.random() * 9007199254740991);
  }
  

const createPayment = async (req, res, next) => {

    /////////////init varible///////////////////////
    //Lấy Timestamp hiện tại + 10 phút 
    const timestamp = Math.floor(Date.now() / 1000)+600; // Chia 1000 để lấy giây
    console.log("Unix Timestamp hiện tại:", timestamp);

    const data = req.body
    console.log(req.body)
    // const payos = new PayOS("client_id", "api-key", "checksum-key")
    const payos = new PayOS(
        "02b2d39e-1d67-41ca-b1ae-039a07a45707", 
        "e057c61d-2dec-4167-bc19-204753a0a3ea", 
        "979184336c54f1b798529b6db93eb49d2af2c520376febf1a19bbf2f1c46ff78"
    )
    const YOUR_DOMAIN = "http://localhost:3000"

    const order = {
        amount: data.price,
        description: `${data.courtId}`,
        buyerName: data.name,
        buyerEmail: data.email,
        buyerPhone: data.phone,
        // orderCode: getRandomNumber(),
        orderCode: 18,
        items: [{name: data.courtName, price: data.price, quantity: 1}],
        returnUrl: `${YOUR_DOMAIN}/courts/67acf595ef48a5c21fd83bce`,
        cancelUrl: `${YOUR_DOMAIN}/courts/67acf595ef48a5c21fd83bce`,
        expiredAt: timestamp,
    }
    try {
        console.log("check:")
        console.log(await payos.getPaymentLinkInformation(1))
        console.log(await payos.getListBank())
        const paymentLink = await payos.createPaymentLink(order);
        console.log(paymentLink)
        // res.redirect(303, paymentLink.checkoutUrl)
        return res.status(200).json({
            success: true,
            link: paymentLink.checkoutUrl,
          });
    } catch (error) {
        console.error(error.message)
        console.error(error)
        res.status(error.code || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};


const paymentController = {
    createPayment,
};

module.exports = paymentController;
