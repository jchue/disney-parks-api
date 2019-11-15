# Disney Parks Project API

## Description

This is a personal project that I'm using to learn about creating a RESTful API with Express and Mongoose as an ODM for MongoDB (a "MEN" stack, if you will).

The concept is a hierarchical timeline of the Disney parks and the attractions contained within as sub-entities. The data describes both the parent-child relationships between entities (e.g., Space Mountain is contained within Tomorrowland, which is contained within Disneyland, which is contained within Disneyland Resort.) as well as the predecessor-successor relationships (e.g., Star Tours replaced Adventure Thru Inner Space, which replaced the Monsanto House of Chemistry.)

Granted, the latter relationships may pose a more difficult problem, since succession is not always straightforward. In other words, it can be defined as the replacement of an attraction within a physical space or a more conceptual/spiritual replacement. Additionally, when dealing with physical succession, a predecessor may be larger and may be replaced by multiple successors, and vice-versa. These issues are going to need to be analyzed further before a suitable data model is finalized.

The end result of all this will be a front end web app that visualizes this hierarchical timeline (most likely housed in a separate repository).

## Prerequisites

- Node.js
- MongoDB

## Install and Run Development API

Download this repository.

Create an .env file with the following properties specified:

```
PORT=<port on localhost for the API- e.g., 3000>
DBURL=<location of MongoDB database>
```

Install dependencies

```
npm install
```

Start the development server

```
npm run start
```

You should be able to make requests to the following endpoints:

- localhost:3000/api/events
- localhost:3000/api/events/stack
- localhost:3000/api/events/:eventId

Further instructions about configuring and loading the database to come.

## Disclaimer

This project is in no way associated with The Walt Disney Company or its affiliated/subsidiary entities.
