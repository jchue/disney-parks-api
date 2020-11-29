import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import models from './models';

import eventsRouter from './routes/events';
import { title } from 'process';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.context = { models };
  next();
});

app.use('/events', eventsRouter);

// Standardize response structure
app.use((req, res) => {
  res.statusCode = res.statusCode || 200;
  res.body = {
    data: res.data,
  };

  return res.status(res.statusCode).json(res.body);
});

// Error handler
app.use((err, req, res, next) => {
  res.statusCode = err.statusCode || 500;
  res.title = '';

  switch (res.statusCode) {
    case 404:
      res.title = 'Not Found';
      break;
    default:
      res.title = 'Internal Server Error';
  }

  res.body = {
    errors: [{
      status: res.statusCode.toString(),
      title: res.title,
      detail: err.detail,
    }],
  };

  return res.status(res.statusCode).json(res.body);
});

module.exports = app;
