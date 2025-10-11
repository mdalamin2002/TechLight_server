const express = require("express");
const userSupportRouter = express.Router();
const { createTicket, getUserTickets } = require("../../controllers/userSupportController/userSupportController");

// Route: GET /support/user -> get all tickets
userSupportRouter.get("/", getUserTickets);

// Route: POST /support/user -> create a ticket
userSupportRouter.post("/", createTicket);

module.exports = userSupportRouter;
