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

eventSchema.statics.stack = async function stack() {
  // Temporary buffer
  const eventBuffer = await this.find();

  // Assign a group to each event
  function assignGroup(event, eventArray) {
    function findLastSuccessor(incarnation, incarnationArray) {
      let currentIncarnation = incarnation;

      for (let i = 0; i < incarnationArray.length; i++) {
        if (JSON.stringify(currentIncarnation._id) === JSON.stringify(incarnationArray[i].predecessorId)) {
          currentIncarnation = incarnationArray[i];
          findLastSuccessor(incarnationArray[i], incarnationArray);
        }
      }

      return {
        _id: currentIncarnation._id,
        name: currentIncarnation.name,
      };
    }

    // The group is the most recent incarnation of the event
    const groupId = findLastSuccessor(event, eventArray)._id;
    const groupName = findLastSuccessor(event, eventArray).name;

    return { groupId, groupName };
  }

  function findSuccessor(ancestor, haystack) {
    haystack.forEach((element) => {
      if (String(element.predecessorId) === String(ancestor._id)) {
        return element;
      }
    });
  }

  for (let i = 0; i < eventBuffer.length; i++) {
    eventBuffer[i].groupId = assignGroup(eventBuffer[i], eventBuffer).groupId;
    eventBuffer[i].groupName = assignGroup(eventBuffer[i], eventBuffer).groupName;
  }

  // Build response
  const events = [];

  // Add top-level events to response
  for (let i = eventBuffer.length - 1; i > -1; i -= 1) {
    if (eventBuffer[i].parentId == null) {
      events.push((eventBuffer[i]));

      // Remove loaded event from buffer
      eventBuffer.splice(i, 1);
    }
  }

  // Find immediate children and return them in an array
  function findChildren(parent, haystack) {
    const haystackBuffer = haystack;
    const children = [];

    for (let i = haystackBuffer.length - 1; i > -1; i -= 1) {
      if (String(eventBuffer[i].parentId) === String(parent._id)) {
        children.push(eventBuffer[i]);

        // Remove matched child to improve performance next loop
        haystackBuffer.splice(i, 1);
      }
    };

    return children;
  }

  // Build descendant tree for a single event
  function buildDescendants(parent, haystack) {
    parent.children = findChildren(parent, haystack);

    parent.children.forEach((event) => {
      buildDescendants(event, haystack);
    });
  }

  function buildStack(topLevel, bufferArray) {
    topLevel.forEach((event) => {
      buildDescendants(event, bufferArray);
    });

    return topLevel;
  }

  return buildStack(events, eventBuffer);
};

const Event = mongoose.model('Event', eventSchema, 'events');

export default Event;
