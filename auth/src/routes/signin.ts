import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@tucotests/common';

import { Password } from '../services/password';
import { User } from '../models/User';

const router = express.Router();

router.post(
  '/api/users/signin',
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('You must supply password'),
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Check if user/email exists
    const user = await User.findOne({ email });
    if (!user) throw new BadRequestError('Invalid credentials');

    // Check if password is correct
    const isPasswordCorrect = await Password.compare(user.password, password);
    if (!isPasswordCorrect) throw new BadRequestError('Invalid credentials');

    // If no error was thrown at this point lets create a jwt and send it back
    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = { jwt: userJwt };

    // Send Success Response
    res.status(200).send({ msg: 'user logged in successfully', data: user });
  }
);

export { router as signinRouter };
