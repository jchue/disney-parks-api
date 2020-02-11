import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  parentId: {
    type: mongoose.ObjectId,
    ref: 'Event',
  },
  predecessorId: {
    type: mongoose.ObjectId,
    ref: 'Event',
  },
  groupId: {
    type: String,
  },
  groupName: {
    type: String,
  },
  children: {
    type: ['eventSchema'],
  },
});

eventSchema.statics.findById = async function (id) {
  try {
    const event = await this.findOne({
      _id: id,
    });
    return event;
  } catch (error) {
    throw new Error(`The requested event ${error.value} could not be found.`);
  }
};

eventSchema.statics.stack = async function () {
  // Temporary buffer
  const resultsTemp = await this.find();

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

  for (let i = 0; i < resultsTemp.length; i++) {
    resultsTemp[i].groupId = assignGroup(resultsTemp[i], resultsTemp).groupId;
    resultsTemp[i].groupName = assignGroup(resultsTemp[i], resultsTemp).groupName;
  }

  // Build response
  const events = [];

  // Add top-level events to response
  for (let i = 0; i < resultsTemp.length; i++) {
    if (resultsTemp[i].parentId == null) {
      events.push(resultsTemp[i]);
      events[events.length - 1].children = [];

      // Remove loaded event from buffer
      resultsTemp.splice(i, 1);
      i -= 1;
    }
  }

  // Add child hierarchy
  function buildChildren(mainArray, bufferArray) {
    const constructed = mainArray;
    for (let i = 0; i < constructed.length; i++) {
      for (let j = 0; j < bufferArray.length; j++) {
        if (JSON.stringify(bufferArray[j].parentId) === JSON.stringify(constructed[i]._id)) {
          constructed[i].children.push(bufferArray[j]);
          // constructed[i].children[bufferArray[i].children.length - 1].children = [];

          // Remove loaded event from buffer
          bufferArray.splice(j, 1);
          j -= 1;

          buildChildren(constructed[i].children, bufferArray);
        }
      }
    }

    return constructed;
  }

  return { stack: buildChildren(events, resultsTemp) };
};

const Event = mongoose.model('Event', eventSchema, 'event');

export default Event;
