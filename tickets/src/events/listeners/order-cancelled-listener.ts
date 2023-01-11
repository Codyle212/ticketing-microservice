import {
    Listener,
    OrderCancelledEvent,
    Subjects,
} from '@codyle-tickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], message: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        }
        //Set orderId to undefined
        ticket.set({ orderId: undefined });
        //Save the ticket
        await ticket.save();
        //Publish a event that says the ticket has been updated
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            userId: ticket.userId,
            orderId: ticket.orderId,
            title: ticket.title,
            price: ticket.price,
            version: ticket.version,
        });
        message.ack();
    }
}
