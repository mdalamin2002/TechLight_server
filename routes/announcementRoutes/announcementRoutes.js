const express = require('express');
const { createAnnouncement } = require('../../controllers/announcementControllers/announcementControllers');
const verifyToken = require('../../middlewares/auth');
const verifyAdmin = require('../../middlewares/admin');
const announcementRouter = express.Router();

//Create a Announcement
announcementRouter.post("/",verifyToken,verifyAdmin, createAnnouncement);

module.exports = announcementRouter;
