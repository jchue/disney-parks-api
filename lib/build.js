import { parseFiles, writeFile } from './io';
import Event from '../models/event';

const events = parseFiles();

events.forEach((curr) => {
  const event = Event.findBySlug(curr.slug);
  const clumps = event.calcClumps();
  const predecessor = event.calcPredecessor() ? event.calcPredecessor().truncate(['slug', 'name']) : undefined;

  // Truncate each successor
  let successors;
  if (event.calcSuccessors()) {
    successors = event.calcSuccessors().map((successor) => successor.truncate(['slug', 'name']));
  }

  const fileData = JSON.stringify({
    data: {
      ...event,
      predecessor,
      successors,
      clumps,
    },
  }, null, 2);

  writeFile(curr.slug, fileData);
});
