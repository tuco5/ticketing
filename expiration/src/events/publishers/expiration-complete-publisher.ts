import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@tucotests/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
