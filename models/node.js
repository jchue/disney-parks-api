import { parseFiles } from '../lib/io';

class Node {
  constructor(
    slug,
    name,
    startDate,
    endDate,
    predecessor,
    content,
  ) {
    this.slug = slug;
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.predecessor = predecessor;
    this.content = content;
  }

  static findBySlug(slug) {
    const nodes = parseFiles();
    const node = nodes.filter((curr) => curr.slug === slug)[0];

    if (node) {
      return new Node(
        node.slug,
        node.name,
        node.startDate,
        node.endDate,
        node.predecessor,
        node.content,
      );
    }

    return null;
  }

  static splitSlug(slug) {
    const slugArray = slug.split('/');
    const contextArray = slugArray.slice(0, slugArray.length - 1);
    const nodeArray = slugArray.slice(slugArray.length - 1);

    return {
      context: contextArray.join('/'),
      nodeName: nodeArray.join('/'),
    };
  }

  /**
   * Find successor by searching for node that references the current node as the predecessor
   * @returns {Node} - Immediate successor of the current node
   */
  calcSuccessors() {
    // Context will be used to prefix the predecessor, which does not include the full path
    const { context } = Node.splitSlug(this.slug);

    const nodes = parseFiles();
    const successors = nodes.filter((curr) => `${context}/${curr.predecessor}` === this.slug);

    if (successors.length) {
      return successors.map((successor) => new Node(
        successor.slug,
        successor.name,
        successor.startDate,
        successor.endDate,
        successor.predecessor,
        successor.content,
      ));
    }
    return null;
  }

  /**
   * Find predecessor by returning the node listed as the predecessor of the current node
   * @returns {Node} - Immediate predecessor of the current node
   */
  calcPredecessor() {
    // Context will be used to prefix the predecessor, which does not include the full path
    const { context } = Node.splitSlug(this.slug);

    return this.predecessor ? Node.findBySlug(`${context}/${this.predecessor}`) : null;
  }

  /**
   * Find the forebear (first predecessor) by recursively finding predecessors
   * @returns {Node} - The very first predecessor in the chain from the from the current node
   */
  calcForebear() {
    const predecessor = this.calcPredecessor();

    // Exit condition: when there are no successors of the current node
    if (!predecessor) {
      return this;
    }

    // Recursion
    return predecessor.calcForebear();
  }

  /**
   * Get all the subnodes of the current node
   * @returns {Array} - The subnodes of the current node
   */
  calcSubnodes() {
    const nodes = parseFiles();

    // Filter based on current context and create new Node for each
    const subnodes = nodes.filter((curr) => {
      const { context } = Node.splitSlug(curr.slug);

      return context === this.slug;
    })
      .map((curr) => new Node(
        curr.slug,
        curr.name,
        curr.startDate,
        curr.endDate,
        curr.predecessor,
        curr.content,
      ));

    return subnodes;
  }

  /**
   * Compiles the subgroups of the current node along with their respective subnodes
   * @returns {Object}
   */
  calcSubgroups() {
    const subnodes = this.calcSubnodes();

    // Get subgroups
    const subgroups = Object.create(null);
    subnodes.forEach((curr) => {
      // Get forebear of subnode
      const forebear = curr.calcForebear().slug;

      // Create subgroup for the forebear if nonexistent
      subgroups[forebear] = subgroups[forebear] || [];

      // Add reduced subnode to subgroup
      const truncated = curr.truncate(['slug', 'name', 'startDate', 'endDate']);
      subgroups[forebear].push(truncated);
    });

    return Object.keys(subgroups).map((key) => ({
      name: key,
      subnodes: subgroups[key],
    }));
  }

  /**
   * Reduce the number of fields
   * @param {Array} fields - The fields to keep
   * @returns {Node} - A new Node with only the specified fields
   */
  truncate(fields = ['slug']) {
    return new Node(
      fields.includes('slug') ? this.slug : undefined,
      fields.includes('name') ? this.name : undefined,
      fields.includes('startDate') ? this.startDate : undefined,
      fields.includes('endDate') ? this.endDate : undefined,
      fields.includes('predecessor') ? this.predecessor : undefined,
      fields.includes('content') ? this.content : undefined,
    );
  }
}

export default Node;
