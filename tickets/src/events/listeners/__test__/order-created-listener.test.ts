import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@codyle-tickets/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';
const setup = async () => {
    //Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: 'userId',
    });
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'userId',
        expiresAt: '15min',
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    };
    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, ticket, data, message };
};

it('sets the userId of the ticket', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, message } = await setup();

    await listener.onMessage(data, message);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});
