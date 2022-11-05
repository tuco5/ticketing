import express from 'express';
import { json } from 'body-parser';
import 'express-async-errors';
import { errorHandler, NotFoundError } from '@tucotests/common';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import cookieSession from 'cookie-session';

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

// Routes Handlers
app.use(currentUserRouter);
app.use(signinRouter);
app.use(signupRouter);
app.use(signoutRouter);

app.all('*', () => {
  throw new NotFoundError();
});

// Error Handlers
app.use(errorHandler);

export { app };
