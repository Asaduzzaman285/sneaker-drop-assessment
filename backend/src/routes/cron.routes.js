const express = require('express');
const expireReservations = require('../workers/expireReservations');
const router = express.Router();

// This endpoint is intended to be called by Vercel Cron Jobs
router.post('/expire-reservations', async (req, res) => {
  // Secure the endpoint with a secret token
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    // Log the failed attempt for security monitoring
    console.warn(`Unauthorized attempt to access cron endpoint from IP: ${req.ip}`);
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('Cron job received: Expiring reservations...');
    await expireReservations();
    res.status(200).json({ message: 'Expired reservations processed successfully.' });
  } catch (error) {
    console.error('Cron job execution failed:', error);
    res.status(500).json({ message: 'Internal Server Error during cron execution' });
  }
});

module.exports = router;
