import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@codyle-tickets/common';
import { queueGroupName } from './queueGroupName';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], message: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            status: data.status,
            userId: data.userId,
            version: data.version,
        });

        await order.save();
        message.ack();
    }
}
