const authRouter = require("./auth.router.js");
const courtRouter = require("./court.router.js");
const userRoutes = require("./user.router.js")
const feedbackRoutes = require("./feedback.router.js")
const paymentRouter = require("./payment.router");

module.exports = { 
    authRouter,
    courtRouter, 
    userRoutes,
    paymentRouter,
    feedbackRoutes,
};
