const express = require("express");
const userSupportRouter = express.Router();
const { createTicket, getUserTickets, UserAllTickets, updateTicket } = require("../../controllers/userSupportController/userSupportController");

// Route: GET /support/user -> get all tickets
userSupportRouter.get("/", getUserTickets);

// Route: POST /support/user -> create a ticket
userSupportRouter.post("/", createTicket);

// Route: GET /support/user/all -> get all tickets (for moderators)
userSupportRouter.get("/all", UserAllTickets);

// update ticket
userSupportRouter.patch("/:id", updateTicket);

module.exports = userSupportRouter;
