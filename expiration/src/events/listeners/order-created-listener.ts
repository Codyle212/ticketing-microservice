import { Listener, OrderCreatedEvent, Subjects } from '@codyle-tickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCreatedEvent['data'], message: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        await expirationQueue.add({ orderId: data.id }, { delay: delay });
        //

        message.ack();
    }
}
