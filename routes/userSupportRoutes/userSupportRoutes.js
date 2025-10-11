const express = require("express");
const router = express.Router();
const { createTicket, getUserTickets } = require("../../controllers/userSupportController/userSupportController");

// Route: GET /support/user -> get all tickets
router.get("/user", getUserTickets);

// Route: POST /support/user -> create a ticket
router.post("/user", createTicket);

module.exports = router;
