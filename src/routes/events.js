import express from 'express';
import Event from '../models/event';

const router = express.Router();

router.get('/', async (req, res) => {
  const events = await req.context.models.event.find();
  return res.send(events);
});

router.get('/stack', async (req, res) => {
  const eventStack = await req.context.models.event.stack();
  return res.send(eventStack);
});

router.get('/:eventId', async (req, res, next) => {
  try {
    const event = await req.context.models.event.findById(req.params.eventId);

    return res.send(event);
  } catch (error) {
    error.statusCode = 404;
    error.message = `Requested event ${req.params.eventId} not found`;

    next(error);
  }
});

export default router;
