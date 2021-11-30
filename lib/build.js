import { flush, parseFiles, writeFile } from './io';
import Node from '../models/node';

flush();

const nodes = parseFiles();

nodes.forEach((curr) => {
  const node = Node.findBySlug(curr.slug);
  const subgroups = node.calcSubgroups();
  const predecessor = node.calcPredecessor() ? node.calcPredecessor().truncate(['slug', 'name']) : undefined;

  // Truncate each successor
  let successors;
  if (node.calcSuccessors()) {
    successors = node.calcSuccessors().map((successor) => successor.truncate(['slug', 'name']));
  }

  const fileData = JSON.stringify({
    data: {
      ...node,
      fileName: curr.fileName,
      predecessor,
      successors,
      subgroups,
    },
  }, null, 2);

  writeFile(curr.slug, curr.fileName, fileData);
});
