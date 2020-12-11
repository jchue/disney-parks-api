import express from 'express';
import Event from '../models/event';

const debug = require('debug')('disney-parks-api:server');

const router = express.Router();

/**
 * Root route returns all events as well as summaries of their heirs in a single-level list
 */
router.get('/', async (req, res, next) => {
  try {
    let events = await Event.find({}, ['name', 'startDate', 'endDate']).sort({ startDate: 1 });

    events = await Promise.all(events.map(async (event) => {
      const heir = await event.getHeir();

      return {
        ...event.toObject(),
        heir: heir || undefined,
      };
    }));

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

    // Get clumps
    let clumps = Object.create(null);
    await Promise.all(branches.map(async (branch) => {
      // Get heir of branch
      const clump = (await branch.getHeir()).name;

      // Create clump for the heir if nonexistent
      clumps[clump] = clumps[clump] || [];

      // Add branch to clump
      clumps[clump].push(branch);
    }));

    // Convert clumps object into array
    clumps = Object.keys(clumps).map((key) => {
      const clump = {
        name: key,
        branches: clumps[key],
      };

      return clump;
    });

    // Convert document to plain object in order to add properties
    event = event.toObject();
    event = {
      ...event,
      branches: (branches.length ? branches : undefined),
      clumps,
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
