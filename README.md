# Disney Parks Project API

## Description

The concept is a hierarchical timeline of the Disney parks and the attractions contained within as sub-entities. The data describes both the parent-child relationships between entities (e.g., Space Mountain is contained within Tomorrowland, which is contained within Disneyland, which is contained within Disneyland Resort.) as well as the predecessor-successor relationships (e.g., Star Tours replaced Adventure Thru Inner Space, which replaced the Monsanto House of Chemistry.)

Granted, the latter relationships may pose a more difficult problem, since succession is not always straightforward. In other words, it can be defined as the replacement of an attraction within a physical space or a more conceptual/spiritual replacement. Additionally, when dealing with physical succession, a predecessor may be larger and may be replaced by multiple successors, and vice-versa. These issues are going to need to be analyzed further before a suitable data model is finalized.

The source data is contained in `.md` files located in the `data` directory, allowing for contributions to be easily incorporated. The build script converts them into `.json` files to be served as a static API. The end result of all this is a front end web app that visualizes this hierarchical timeline (housed in a separate repository).

## Definitions

- **node:** a tracked object (e.g., park, land, attraction, etc.)
- **predecessor:** the previous chronological iteration of a given node
- **forebear:** the very first predecessor in a given predecessor chain
- **successor:** the next chronological iteration of a given node
- **group:** a group of logical predecessors/successors
- **subgroups:** the groups that a given node "contains"
- **subnodes:** the nodes that a given node "contains" (comprising the subgroups)
- **slug:** the unique identifier of a node, comprised of the following:
  - **context:** the group path down to the node
  - **nodeName:** the name of the node itself

## Development

Clone repository
```sh
git clone https://github.com/jchue/disney-parks-api.git
```

Install dependencies
```sh
npm install
```

At this time, you should be able to make changes to the markdown files in the `data` directory as well as the source code.

Build static files
```sh
npm run build
```

Start development server
```sh
npm run dev
```

You should be able to make requests to `localhost:3000/timeline/:slug`.

## Disclaimer

This project is in no way associated with The Walt Disney Company or its affiliated/subsidiary entities.
