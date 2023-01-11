import { Message } from 'node-nats-streaming';
import {
    Listener,
    OrderCreatedEvent,
    OrderStatus,
    Subjects,
} from '@codyle-tickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], message: Message) {
        // Find the ticket that the order was reserving
        const ticket = await Ticket.findById(data.ticket.id);
        // If no ticket ,throw error
        if (!ticket) {
            throw new Error('Ticket not found');
        }
        // Mark the ticket as being reserve by setting it's orderId property
        ticket.set({ orderId: data.id });
        //Save the ticket
        await ticket.save();
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version,
        });
        // ack the message
        message.ack();
    }
}
