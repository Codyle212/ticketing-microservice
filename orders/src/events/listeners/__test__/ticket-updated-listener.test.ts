import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@codyle-tickets/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';

import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    //Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);
    //Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });
    await ticket.save();
    //Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'Next Concert',
        price: 15,
        userId: 'userId',
    };
    //Create a fake message
    //@ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };
    //Return all of this stuff
    return { listener, ticket, data, message };
};

it('finds, updates and saves a ticket', async () => {
    const { listener, ticket, data, message } = await setup();
    await listener.onMessage(data, message);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, message } = await setup();

    await listener.onMessage(data, message);

    expect(message.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version', async () => {
    const { listener, data, message } = await setup();
    data.version = 10;

    try {
        await listener.onMessage(data, message);
    } catch (error) {}
    expect(message.ack).not.toHaveBeenCalled();
});
