const { client } = require("./../../config/mongoDB");
const db = client.db("techLight");
const returnCollection = db.collection("returns");

 const getAllReturns = async (req, res ,next) => {
    try {
      const returns = await returnCollection.find({}).toArray();
      res.status(200).json(returns);
    } catch (error) {
      next(error);
    }
  };

  const createReturn = async (req, res, next) => {
    try {
      const returnData = req.body;
      const result = await returnCollection.insertOne(returnData);
      res.status(201).json({ message: "Return created", returnId: result.insertedId });
    } catch (error) {
      next(error);
    }
  };

  const updateReturn = async (req, res, next) => {
    try {
      const { id } = req.params;
      const returnData = req.body;
      const result = await returnCollection.updateOne({ _id: new ObjectId(id) }, { $set: returnData });
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Return not found" });
      }
      res.status(200).json({ message: "Return updated" });
    } catch (error) {
      next(error);
    }
  };

 const deleteReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await returnCollection.deleteOne({ id: Number(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Return not found" });
    }
    res.status(200).json({ message: "Return deleted" });
  } catch (error) {
    next(error);
  }
};


  module.exports = { getAllReturns, createReturn, updateReturn, deleteReturn };