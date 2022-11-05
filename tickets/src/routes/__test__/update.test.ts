import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import nats from '../../nats';
import { Ticket } from '../../models/Ticket';

const ticketTest = {
  title: 'test title',
  price: 10,
};

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signup())
    .send(ticketTest)
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).put(`/api/tickets/${id}`).send(ticketTest).expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', signup())
    .send(ticketTest);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', signup())
    .send({ title: 'edited title test', price: 1000 })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = signup();

  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send(ticketTest);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'edited title test', price: -20 })
    .expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = signup();

  const editedTitle = 'edited title test';
  const editedPrice = 20;

  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send(ticketTest);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: editedTitle, price: editedPrice })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual(editedTitle);
  expect(ticketResponse.body.price).toEqual(editedPrice);
});

it('publishes an event', async () => {
  const cookie = signup();

  const editedTitle = 'edited title test';
  const editedPrice = 20;

  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send(ticketTest);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: editedTitle, price: editedPrice })
    .expect(200);

  expect(nats.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = signup();

  const editedTitle = 'edited title test';
  const editedPrice = 20;

  const response = await request(app)
    .post('/api/tickets/')
    .set('Cookie', cookie)
    .send(ticketTest);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: editedTitle, price: editedPrice })
    .expect(400);
});
