import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderStatus, ExpirationCompleteEvent } from '@codyle-tickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20,
    });

    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'user',
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };
    // @ts-ignore
    const message: Message = {
        ack: jest.fn(),
    };

    return { listener, order, ticket, data, message };
};

it('updates the order status to cancelled', async () => {
    const { listener, order, ticket, data, message } = await setup();

    await listener.onMessage(data, message);
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit and Order Cancelled evnet', async () => {
    const { listener, order, ticket, data, message } = await setup();

    await listener.onMessage(data, message);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
    const { listener, order, ticket, data, message } = await setup();

    await listener.onMessage(data, message);
    expect(message.ack).toHaveBeenCalled();
});
