import { Publisher, OrderCreatedEvent, Subjects } from '@codyle-tickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}
