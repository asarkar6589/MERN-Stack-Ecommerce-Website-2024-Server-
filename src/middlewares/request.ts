import { Request } from 'express';
import { User } from './isAuthenticated.js';

declare module 'express' {
  interface Request {
    user?: User; // Define the user property
  }
}
