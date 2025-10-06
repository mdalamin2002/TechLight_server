const express = require("express");
// const routerAnnouncement = express.Router();
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../../controllers/announcementController/announcementController");

const routerAnnouncement = express.Router();
// GET all announcements
routerAnnouncement.get("/", getAnnouncements);

// POST new announcement
routerAnnouncement.post("/", createAnnouncement);

// PUT update announcement
routerAnnouncement.put("/:id", updateAnnouncement);

// DELETE announcement
routerAnnouncement.delete("/:id", deleteAnnouncement);

module.exports = routerAnnouncement;
