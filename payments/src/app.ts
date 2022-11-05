import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@tucotests/common';
import { createChargeRouter } from './routes/new';

const app = express();

// Middlewares
app.use(json());
app.set('trust proxy', true);
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);
app.use(currentUser);

// Routes Handlers
app.use(createChargeRouter);

app.all('*', () => {
  throw new NotFoundError();
});

// Error Handlers
app.use(errorHandler);

export { app };
