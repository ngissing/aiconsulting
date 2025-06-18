import express, { Router, Request, Response, NextFunction } from 'express';
import { handleContactForm } from '../controllers/contactController';

const router: Router = express.Router();

// Define a type for your handler to ensure compatibility
type ExpressRouteHandler = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

router.post('/contact', handleContactForm as ExpressRouteHandler);

export default router;