import { Publisher, OrderCreatedEvent, Subjects } from '@tucotests/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
