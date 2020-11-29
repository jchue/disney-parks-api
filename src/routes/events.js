import express from 'express';
import Event from '../models/event';

const router = express.Router();

router.get('/', async (req, res, next) => {
  const eventStack = await Event.stack();

  res.data = eventStack;

  next(); // Pass data to middleware
});

router.get('/:eventId', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    res.data = event;

    next(); // Pass data to middleware
  } catch (error) {
    error.statusCode = 404;
    error.detail = `Requested event ${req.params.eventId} not found`;

    next(error); // Pass error to middleware
  }
});

export default router;
