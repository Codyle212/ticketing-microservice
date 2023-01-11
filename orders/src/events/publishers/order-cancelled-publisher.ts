import {
    Publisher,
    OrderCancelledEvent,
    Subjects,
} from '@codyle-tickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}
