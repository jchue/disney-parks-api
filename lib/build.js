import { parseFiles, writeFile } from './io';
import Event from '../models/event';

const events = parseFiles();

events.forEach((curr) => {
  const event = Event.findBySlug(curr.slug);
  const clumps = event.calcClumps();
  const predecessor = event.calcPredecessor() ? event.calcPredecessor().truncate(['slug', 'name']) : null;
  const successor = event.calcSuccessor() ? event.calcSuccessor().truncate(['slug', 'name']) : null;

  const fileData = JSON.stringify({
    data: {
      ...event,
      predecessor,
      successor,
      clumps,
    },
  }, null, 2);

  writeFile(curr.slug, fileData);
});
