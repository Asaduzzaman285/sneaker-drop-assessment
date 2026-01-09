const express = require("express");
const router = express.Router();

const { reserveItemController } = require("../controllers/reservation.controller");

router.post("/drops/:id/reserve", reserveItemController);

module.exports = router;
