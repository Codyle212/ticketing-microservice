import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@codyle-tickets/common';
import { natsWrapper } from '../../../nats-wrapper';

import { OrderCancelledListener } from '../order-cancelled-listener';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'concert',
        price: 100,
        userId: 'userId',
    });
    ticket.set({ orderId });
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: { id: ticket.id },
    };
    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { message, data, ticket, orderId, listener };
};

it('updates the ticket with undefined orderId, publishes an event ', async () => {
    const { message, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
    const { message, data, ticket, orderId, listener } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it('publishes an event', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
