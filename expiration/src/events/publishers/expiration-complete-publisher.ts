import {
    Subjects,
    Publisher,
    ExpirationCompleteEvent,
} from '@codyle-tickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
