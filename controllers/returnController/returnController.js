const { client } = require("./../../config/mongoDB");
const { ObjectId } = require("mongodb");
const db = client.db("techLight");
const returnCollection = db.collection("returns");

 const getAllReturns = async (req, res ,next) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build query
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      const returns = await returnCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray();

      const totalCount = await returnCollection.countDocuments(query);

      res.status(200).json({
        success: true,
        data: returns,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  };

  const createReturn = async (req, res, next) => {
    try {
      const returnData = {
        ...req.body,
        status: req.body.status || 'Pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await returnCollection.insertOne(returnData);
      res.status(201).json({ 
        success: true,
        message: "Return created", 
        returnId: result.insertedId 
      });
    } catch (error) {
      next(error);
    }
  };

  const updateReturn = async (req, res, next) => {
    try {
      const { id } = req.params;
      const returnData = {
        ...req.body,
        updatedAt: new Date()
      };
      const result = await returnCollection.updateOne(
        { _id: new ObjectId(id) }, 
        { $set: returnData }
      );
      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Return not found" });
      }
      res.status(200).json({ 
        success: true,
        message: "Return updated" 
      });
    } catch (error) {
      next(error);
    }
  };

 const deleteReturn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await returnCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Return not found" });
    }
    res.status(200).json({ 
      success: true,
      message: "Return deleted" 
    });
  } catch (error) {
    next(error);
  }
};

// Get return statistics
const getReturnStats = async (req, res, next) => {
  try {
    const totalReturns = await returnCollection.countDocuments();
    const pendingReturns = await returnCollection.countDocuments({ status: 'Pending' });
    const approvedReturns = await returnCollection.countDocuments({ status: 'Approved' });
    const rejectedReturns = await returnCollection.countDocuments({ status: 'Rejected' });

    // Calculate total refund amount (only approved)
    const refundResult = await returnCollection.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
    ]).toArray();
    const totalRefundAmount = refundResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalReturns,
        pendingReturns,
        approvedReturns,
        rejectedReturns,
        totalRefundAmount
      }
    });
  } catch (error) {
    next(error);
  }
};


  module.exports = { getAllReturns, createReturn, updateReturn, deleteReturn, getReturnStats };