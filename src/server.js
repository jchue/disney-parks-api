import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import models, { connectDb } from './models';

const app = express();

connectDb().then(async () => {
  app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}.`));
});

app.use(cors());

app.use((req, res, next) => {
  req.context = { models };
  next();
});

app.use('/api/events', routes.events);

app.use((req, res) => res.status(404).send(`The requested URL ${req.originalUrl} could not be found.`));
