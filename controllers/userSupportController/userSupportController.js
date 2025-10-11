const { client } = require("../config/mongoDB"); // তোমার mongoDB config
const { ObjectId } = require("mongodb");

const db = client.db("techLight");
const supportCollection = db.collection("support");

// 📝 Create a new ticket
const createTicket = async (req, res) => {
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
    console.error("❌ Error creating ticket:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 📝 Get all tickets for a user (filtering can be added later)
const getUserTickets = async (req, res) => {
  try {
    const tickets = await supportCollection.find({}).sort({ createdAt: -1 }).toArray();
    res.status(200).json(tickets);
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
};
