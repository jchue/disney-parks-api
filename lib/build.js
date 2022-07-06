import { flush, parseFiles, writeFile } from './io';
import Node from '../models/node';

// Delete build directory, but proceed despite error (e.g., directory does not exist)
try {
  flush();
} catch (error) {
  console.error(error);
}

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
