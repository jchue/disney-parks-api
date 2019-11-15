import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  const events = await req.context.models.event.find();
  return res.send(events);
});

router.get('/stack', async (req, res) => {
  const eventStack = await req.context.models.event.stack();
  return res.send(eventStack);
});

router.get('/:eventId', async (req, res) => {
  try {
    const event = await req.context.models.event.findById(req.params.eventId);
    return res.send(event);
  } catch (error) {
    return res.status(404).send(error.message);
  }
});

export default router;
