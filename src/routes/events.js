import express from 'express';
import Event from '../models/event';

const debug = require('debug')('disney-parks-api:server');

const router = express.Router();

/**
 * Root route returns all events in a single-level list
 */
router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find({}, ['name', 'startDate', 'endDate']).sort({ startDate: 1 });

    res.data = events;

    // Pass data to middleware
    next();
  } catch (error) {
    debug(error);

    // Pass error to middleware
    next(error);
  }
});

/**
 * Single-event route returns the details of the event as well as summaries of
 * its immediate branches, its predecessor, and its successor
 */
router.get('/:eventId', async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.eventId)
      .populate('predecessor', ['name', 'startDate', 'endDate'])
      .populate('trunk', ['name', 'startDate', 'endDate']);

    const branches = await event.findBranches();
    const successor = await event.findSuccessor();
    const heir = await event.getHeir();

    // Convert document to plain object in order to add properties
    event = event.toObject();
    event = {
      ...event,
      branches: (branches.length ? branches : undefined),
      successor: successor || undefined,
      heir: heir || undefined,
    };

    res.data = event;

    // Pass data to middleware
    next();
  } catch (error) {
    error.statusCode = 404;
    error.detail = `Requested event ${req.params.eventId} not found`;

    debug(error);

    // Pass error to middleware
    next(error);
  }
});

/**
 * Event subtree route returns the details of the event as well as summaries
 * of all the branches in its entire recursive subtree
 */
router.get('/:eventId/subtree', async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.eventId, ['name', 'startDate', 'endDate'])
      .populate('trunk', ['name', 'startDate', 'endDate']);

    const branches = await event.getSubtree();
    const heir = await event.getHeir();

    // Convert document to plain object in order to add properties
    event = event.toObject();
    event = {
      ...event,
      branches: branches || undefined,
      heir,
    };

    res.data = event;

    // Pass data to middleware
    next();
  } catch (error) {
    error.statusCode = 404;
    error.detail = `Requested event ${req.params.eventId} not found`;

    debug(error);

    // Pass error to middleware
    next(error);
  }
});

export default router;
