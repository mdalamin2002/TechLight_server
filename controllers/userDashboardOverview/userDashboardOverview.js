const { paymentsCollection } = require("../paymentController/paymentController");
const { usersCollections } = require("../userControllers/userControllers");


//User dashboard orders
const userDashboardOrders = async (req, res, next) => {
    const userEmail = req.params.email;
    try {
        const user = await usersCollections.findOne({ email: userEmail });
    if (!user) return res.status(404).send({ success: false, message: "User not found" });
        const orders = await paymentsCollection.find({ "customer.email": userEmail }).toArray();
    res.status(200).send(orders);
    } catch (error) {
        next(error);
    }
}

//User recent orders
const userRecentOrders = async (req, res, next) => {
    const userEmail = req.params.email;
    try {
       const user = await usersCollections.findOne({ email: userEmail });
        if (!user) return res.status(404).send({ success: false, message: "User not found" });
        const orders = await paymentsCollection.find({ "customer.email": userEmail }).sort({ createdAt: -1 }).limit(3).toArray();
        res.status(200).send(orders);
   } catch (error) {
    next(error)
   }
}

module.exports = { userDashboardOrders,userRecentOrders };