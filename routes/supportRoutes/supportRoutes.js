const express = require("express");
const {
  getAllTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketById
} = require("../../controllers/supportController/supportController"); 


const supportRouter = express.Router();

//  support ticket 
supportRouter.post("/",  createTicket);

//  ticket 
supportRouter.get("/",  getAllTickets);

// ticket
supportRouter.get("/:id",  getTicketById);

// ticket update 
supportRouter.put("/:id",  updateTicket);

// ticket delete 
supportRouter.delete("/:id", deleteTicket);

module.exports = supportRouter;
