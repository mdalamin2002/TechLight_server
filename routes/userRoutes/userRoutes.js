const express = require('express');
const { postUsers } = require('../../controllers/userControllers/userControllers');
const router = express.Router();

router.post("/", postUsers);

module.exports = router;
