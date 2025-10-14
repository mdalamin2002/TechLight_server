const express = require("express");
const userSupportRouter = express.Router();
const { createTicket, getUserTickets, UserAllTickets, updateTicket } = require("../../controllers/userSupportController/userSupportController");

// Route: GET /support/user -> get all tickets
userSupportRouter.get("/", getUserTickets);

// Route: POST /support/user -> create a ticket
userSupportRouter.post("/", createTicket);
// all tickets
userSupportRouter.get("/", UserAllTickets )

// update ticket
userSupportRouter.patch("/:id", updateTicket);

module.exports = userSupportRouter;
