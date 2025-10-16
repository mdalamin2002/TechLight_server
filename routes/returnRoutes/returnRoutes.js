const express = require("express");
const returnRouter = express.Router();

const {
    getAllReturns,
    createReturn,
    updateReturn,
    deleteReturn,
} = require("../../controllers/returnController/returnController");

returnRouter.get("/", getAllReturns);
returnRouter.post("/", createReturn);
returnRouter.put("/:id", updateReturn);
returnRouter.delete("/:id", deleteReturn);

module.exports = returnRouter;