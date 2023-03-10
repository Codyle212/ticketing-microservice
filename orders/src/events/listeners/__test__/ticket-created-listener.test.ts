import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@codyle-tickets/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create a instance of the listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // Create a fake data
    const data: TicketCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    };
    // Create a fake message object
    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };
    return { listener, data, message };
};

it('creates and saves a ticket', async () => {
    const { listener, data, message } = await setup();
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, message);
    // write assertion to make sure a tikcet was created
    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const { listener, data, message } = await setup();
    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, message);
    // Write assertion to make sure ack function was called
    expect(message.ack).toHaveBeenCalled();
});
