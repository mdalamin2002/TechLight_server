const express = require('express');
const { createPayment, paymentSuccess, paymentFail, paymentCancel } = require('../../controllers/paymentController/paymentController');
const paymentRouter = express.Router();


// POST /api/payments/order

paymentRouter.post('/order', createPayment);

paymentRouter.get('/order', paymentSuccess);
paymentRouter.get('/order', paymentFail);
paymentRouter.get('/order', paymentCancel);



module.exports = paymentRouter;