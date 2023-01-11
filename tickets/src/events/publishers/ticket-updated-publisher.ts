import {
    Publisher,
    Subjects,
    TicketUpdatedEvent,
} from '@codyle-tickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
