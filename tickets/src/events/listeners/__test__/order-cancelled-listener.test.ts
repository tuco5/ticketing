import mongoose from 'mongoose';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { OrderCancelledEvent, OrderStatus } from '@tucotests/common';
import nats from '../../../nats';
import { Ticket } from '../../../models/Ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create instance of a listener
  const listener = new OrderCancelledListener(nats.client);

  // Create and save ticket
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
    userId: 'not needed for the test',
  });
  await ticket.save();

  // create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // create a fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it('updates the ticket,publishes an event and acks the message', async () => {
  const { ticket, listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(nats.client.publish).toHaveBeenCalled();
});
