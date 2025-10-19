const express = require('express');
const {
    createPayment,
    paymentSuccess,
    paymentFail,
    paymentCancel,
    testPayment,
    getPaymentDetails,
    checkProducts,
} = require('../../controllers/paymentController/paymentController');

const paymentRouter = express.Router();

paymentRouter.post("/order", createPayment);
paymentRouter.post("/test", testPayment);
paymentRouter.post("/check-products", checkProducts);

paymentRouter.get("/success/:tranId", paymentSuccess);
paymentRouter.post("/success/:tranId", paymentSuccess);
paymentRouter.get("/fail/:tranId", paymentFail);
paymentRouter.post("/fail/:tranId", paymentFail);
paymentRouter.get("/cancel/:tranId", paymentCancel);
paymentRouter.post("/cancel/:tranId", paymentCancel);

paymentRouter.get("/details/:tranId", getPaymentDetails);

module.exports = paymentRouter;
