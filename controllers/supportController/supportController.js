const { client } = require("../../config/mongoDB");
const { ObjectId } = require("mongodb");

const db = client.db("techLight");
const supportCollections = db.collection("support");

//  Support Tickets 
const getAllTickets = async (req, res, next) => {
  try {
    const tickets = await supportCollections.find().toArray();
    res.status(200).json(tickets);
  } catch (error) {
    next(error)
  }
};

//  ticket 
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await supportCollections.findOne({ _id: new ObjectId(id) });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json(ticket);
  } catch (error) {
   next(error)
  }
};

// 
const createTicket = async (req, res, next) => {
  try {
    const ticketData = req.body;
    const result = await supportCollections.insertOne(ticketData);
    res.status(201).json({ message: "Ticket created", ticketId: result.insertedId });
  } catch (error) {
    next(error)
  }
};

// ticket update
const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await supportCollections.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket updated" });
  } catch (error) {
   next(error)
  }
};

// ticket delete
const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await supportCollections.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket deleted" });
  } catch (error) {
    next(error)
  }
};

module.exports = {
  getAllTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket
};
