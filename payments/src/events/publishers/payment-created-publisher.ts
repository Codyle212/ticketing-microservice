import {
    Subjects,
    Publisher,
    PaymentCreatedEvent,
} from '@codyle-tickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}
