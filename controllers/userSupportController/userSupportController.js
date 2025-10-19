
const { ObjectId } = require("mongodb");
const { client } = require("../../config/mongoDB");

const db = client.db("techLight");
const supportCollection = db.collection("support");

//  Create a new ticket
const createTicket = async (req, res, next) => {
  try {
    const { subject, category, description, contact, priority, attachment } = req.body;

    // Generate a simple ticketId
    const ticketId = "TICK" + Math.floor(1000 + Math.random() * 9000);

    const ticket = {
      ticketId,
      subject,
      category,
      description,
      contact,
      priority: priority || "Normal",
      status: "Open",
      attachment: attachment || null,
      createdAt: new Date(),
    };

    const result = await supportCollection.insertOne(ticket);

    res.status(201).json({ success: true, ticket });
  } catch (error) {
   next(error)
  }
};

// all tikcket

const UserAllTickets  = async(req, res, next) => {
  try {
    const tickets = await supportCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(tickets);
  } catch (error) {
    next(error);
  }
}

// update ticket 

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const result = await supportCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    res.status(200).json({ message: "Ticket updated" });
  } catch (error) {
    next(error);
  }

}

//  Get all tickets for a user (filtering can be added later)
const getUserTickets = async (req, res, next) => {
  try {
    const tickets = await supportCollection.find({}).sort({ createdAt: -1 }).toArray();
    // Ensure tickets is always an array
    const safeTickets = Array.isArray(tickets) ? tickets : [];
    res.status(200).json(safeTickets);
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    // Return empty array on error to prevent frontend crashes
    res.status(200).json([]);
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  UserAllTickets,
  updateTicket
};
