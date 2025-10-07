const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const announcementsCollection = db.collection("announcements");

//Create a announcement 
const createAnnouncement = async (req, res, next) => {
    try {
        const announcementData = req.body;
        const result = await announcementsCollection.insertOne(announcementData);
        res.status(201).send(result);
    } catch (error) {
        next(error)
    }
}
module.exports = {createAnnouncement}