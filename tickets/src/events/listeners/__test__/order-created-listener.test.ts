import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@tucotests/common';
import nats from '../../../nats';
import { Ticket } from '../../../models/Ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  // create instance of a listener
  const listener = new OrderCreatedListener(nats.client);

  // Create and save ticket
  const ticket = Ticket.build({
    title: 'test',
    price: 20,
    userId: 'not needed for the test',
  });
  await ticket.save();

  // create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'not needed for the test',
    expiresAt: 'not needed for the test',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // create a fake msg
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it('sets the orderId to the ticket', async () => {
  const { ticket, listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(nats.client.publish).toHaveBeenCalled();

  //@ts-ignore
  // console.log(nats.client.publish.mock.calls);
  const ticketUpdatedData = JSON.parse(
    (nats.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
