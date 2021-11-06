import { parseFiles } from '../lib/io';

class Event {
  constructor(
    slug,
    name,
    startDate,
    endDate,
    trunk,
    predecessor,
    content,
  ) {
    this.slug = slug;
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
    this.trunk = trunk;
    this.predecessor = predecessor;
    this.content = content;
  }

  static findBySlug(slug) {
    const events = parseFiles();
    const event = events.filter((curr) => curr.slug === slug)[0];

    if (event) {
      return new Event(
        event.slug,
        event.name,
        event.startDate,
        event.endDate,
        event.trunk,
        event.predecessor,
        event.content,
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
   * Find successor by searching for event that references the current event as the predecessor
   * @returns {Event} - Immediate successor of the current event
   */
  calcSuccessors() {
    // Context will be used to prefix the predecessor, which does not include the full path
    const { context } = Event.splitSlug(this.slug);

    const events = parseFiles();
    const successors = events.filter((curr) => `${context}/${curr.predecessor}` === this.slug);

    if (successors.length) {
      return successors.map((successor) => new Event(
        successor.slug,
        successor.name,
        successor.startDate,
        successor.endDate,
        successor.trunk,
        successor.predecessor,
        successor.content,
      ));
    }
    return null;
  }

  /**
   * Find predecessor by returning the event listed as the predecessor of the current event
   * @returns {Event} - Immediate predecessor of the current event
   */
  calcPredecessor() {
    // Context will be used to prefix the predecessor, which does not include the full path
    const { context } = Event.splitSlug(this.slug);

    return this.predecessor ? Event.findBySlug(`${context}/${this.predecessor}`) : null;
  }

  /**
   * Find the forebear (first predecessor) by recursively finding predecessors
   * @returns {Event} - The very first predecessor in the chain from the from the current event
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
   * Get all the branches of the current event
   * @returns {Array} - The branches of the current event
   */
  calcBranches() {
    const events = parseFiles();

    // Filter based on current context and create new Event for each
    const branches = events.filter((curr) => {
      const { context } = Event.splitSlug(curr.slug);

      return context === this.slug;
    })
      .map((curr) => new Event(
        curr.slug,
        curr.name,
        curr.startDate,
        curr.endDate,
        curr.trunk,
        curr.predecessor,
        curr.content,
      ));

    return branches;
  }

  /**
   * Compiles the clumps of the current event along with their respective branches
   * @returns {Object}
   */
  calcClumps() {
    const branches = this.calcBranches();

    // Get clumps
    const clumps = Object.create(null);
    branches.forEach((curr) => {
      // Get forebear of branch
      const forebear = curr.calcForebear().slug;

      // Create clump for the forebear if nonexistent
      clumps[forebear] = clumps[forebear] || [];

      // Add reduced branch to clump
      const truncated = curr.truncate(['slug', 'name', 'startDate', 'endDate']);
      clumps[forebear].push(truncated);
    });

    return Object.keys(clumps).map((key) => ({
      name: key,
      branches: clumps[key],
    }));
  }

  /**
   * Reduce the number of fields
   * @param {Array} fields - The fields to keep
   * @returns {Event} - A new Event with only the specified fields
   */
  truncate(fields = ['slug']) {
    return new Event(
      fields.includes('slug') ? this.slug : undefined,
      fields.includes('name') ? this.name : undefined,
      fields.includes('startDate') ? this.startDate : undefined,
      fields.includes('endDate') ? this.endDate : undefined,
      fields.includes('trunk') ? this.trunk : undefined,
      fields.includes('predecessor') ? this.predecessor : undefined,
      fields.includes('content') ? this.content : undefined,
    );
  }
}

export default Event;
