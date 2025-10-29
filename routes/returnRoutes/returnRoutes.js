const express = require("express");
const returnRouter = express.Router();
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');

const {
    getAllReturns,
    createReturn,
    updateReturn,
    deleteReturn,
    getReturnStats,
} = require("../../controllers/returnController/returnController");

returnRouter.get("/", verifyToken, verifyAdmin, getAllReturns);
returnRouter.post("/", verifyToken, createReturn);
returnRouter.put("/:id", verifyToken, verifyAdmin, updateReturn);
returnRouter.delete("/:id", verifyToken, verifyAdmin, deleteReturn);
returnRouter.get("/admin/stats", verifyToken, verifyAdmin, getReturnStats);

module.exports = returnRouter;