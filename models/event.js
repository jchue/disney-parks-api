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

  /**
   * Find successor by searching for event that references the current event as the predecessor
   * @returns {Event} - Immediate successor of the current event
   */
  calcSuccessor() {
    const events = parseFiles();
    const successor = events.filter((curr) => curr.predecessor === this.slug)[0];

    if (successor) {
      return new Event(
        successor.slug,
        successor.name,
        successor.startDate,
        successor.endDate,
        successor.trunk,
        successor.predecessor,
        successor.content,
      );
    }
    return null;
  }

  /**
   * Find predecessor by returning the event listed as the predecessor of the current event
   * @returns {Event} - Immediate predecessor of the current event
   */
  calcPredecessor() {
    return this.predecessor ? Event.findBySlug(this.predecessor) : null;
  }

  /**
   * Find the heir (last successor) by recursively finding successors
   * @returns {Event} - The very last successor in the chain from the from the current event
   */
  calcHeir() {
    const successor = this.calcSuccessor();

    // Exit condition: when there are no successors of the current node
    if (!successor) {
      return this;
    }

    // Recursion
    return successor.calcHeir();
  }

  /**
   * Get all the branches of the current event
   * @returns {Array} - The branches of the current event
   */
  calcBranches() {
    const events = parseFiles();

    // Filter based on trunk and create new Event for each
    const branches = events.filter((curr) => curr.trunk === this.slug)
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
      // Get heir of branch
      const heir = curr.calcHeir().slug;

      // Create clump for the heir if nonexistent
      clumps[heir] = clumps[heir] || [];

      // Add reduced branch to clump
      const truncated = curr.truncate(['slug', 'name', 'startDate', 'endDate']);
      clumps[heir].push(truncated);
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
