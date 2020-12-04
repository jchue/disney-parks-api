import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  description: {
    type: String,
  },
  trunk: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  predecessor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
});

/*
 * Find branches by searching for events that reference the current event as the trunk
 */
eventSchema.methods.findBranches = async function findBranches() {
  const branches = await mongoose.model('Event').find(
    {
      trunk: this,
    },
    ['name', 'startDate', 'endDate'],
  )
    .sort({ startDate: 1 });

  return branches;
};

/*
 * Find successor by searching for event that reference the current event as the predecessor
 */
eventSchema.methods.findSuccessor = async function findSuccessor() {
  const successor = await mongoose.model('Event').findOne(
    {
      predecessor: this,
    },
    ['name', 'startDate', 'endDate'],
  );

  return successor;
};

/*
 * Find the heir (last successor) by recursively finding successors
 */
eventSchema.methods.getHeir = async function getHeir() {
  const successor = await this.findSuccessor();

  // Exit condition: when there are no successors of the current node
  if (!successor) {
    return {
      _id: this._id,
      name: this.name,
      startDate: this.startDate,
      endDate: this.endDate || undefined,
    };
  }

  // Recursion
  return successor.getHeir();
};

/*
 * Build en entire subtree by recursively finding branches
 */
eventSchema.methods.getSubtree = async function getSubtree() {
  const branches = await this.findBranches();

  // Exit condition: when there are no branches of the current node
  if (branches.length === 0) {
    return;
  }

  const subtree = await Promise.all(branches.map(async (branch) => {
    const subbranches = await branch.getSubtree(); // Recursion
    const heir = await branch.getHeir();

    // Convert document to plain object in order to add properties
    branch = branch.toObject();
    return {
      ...branch,
      branches: subbranches,
      heir,
    };
  }));

  return subtree;
};

const Event = mongoose.model('Event', eventSchema, 'events');

export default Event;
