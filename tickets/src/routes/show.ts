import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import { NotFoundError } from '@codyle-tickets/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        throw new NotFoundError();
    }
    res.send(ticket);
});

export { router as showTicketRouter };
