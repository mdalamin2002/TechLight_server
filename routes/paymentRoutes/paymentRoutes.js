const express = require('express');
const { createPayment, paymentSuccess, paymentFail, paymentCancel } = require('../../controllers/paymentController/paymentController');
const paymentRouter = express.Router();


// POST /api/payments/order

paymentRouter.post("/order", createPayment);
paymentRouter.post("/success/:tranId", paymentSuccess);
paymentRouter.post("/fail/:tranId", paymentFail);
paymentRouter.post("/cancel/:tranId", paymentCancel);


module.exports = paymentRouter;