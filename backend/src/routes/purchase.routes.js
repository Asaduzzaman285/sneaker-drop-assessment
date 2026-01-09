const express = require("express");
const router = express.Router();
const { purchaseController } = require("../controllers/purchase.controller");

// Purchase reserved drop
router.post("/:id", purchaseController);

module.exports = router;
