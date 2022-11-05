import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@tucotests/common';

import { User } from '../models/User';

const router = express.Router();

router.post(
  '/api/users/signup',
  body('email').isEmail().withMessage('Email must be valid'),
  body('password')
    .trim()
    .isLength({ min: 8, max: 56 })
    .withMessage('Password must be between 8 and 56 characters long'),
  validateRequest,
  async (req: Request, res: Response) => {
    // Pull out body values from request
    const { email, password } = req.body;

    // Check If User already exists?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email is already in use.');
    }

    // Create a new User
    const user = User.build({ email, password });
    await user.save();

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
    res.status(201).send({ msg: 'user created successfully', data: user });
  }
);

export { router as signupRouter };
