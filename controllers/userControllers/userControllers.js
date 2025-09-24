const { client } = require("./../../config/mongoDB");
const db = client.db('techLight');
const usersCollections = db.createCollection('users');

const postUsers = (req,res) => {
    const data = req.body;
    console.log(data);
    res.send({message: "This is working"})
}


module.exports = { postUsers }