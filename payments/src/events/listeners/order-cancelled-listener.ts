import { Message } from 'node-nats-streaming';
import {
    OrderCancelledEvent,
    Subjects,
    Listener,
    OrderStatus,
} from '@codyle-tickets/common';
import { queueGroupName } from './queueGroupName';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], message: Message) {
        const order = await Order.findByEvent(data);

        if (!order) {
            throw new Error('Order not found');
        }
        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        message.ack();
    }
}
