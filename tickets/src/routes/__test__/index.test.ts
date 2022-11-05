import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app).post('/api/tickets').set('Cookie', signup()).send({
    title,
    price,
  });
};

it('can fetch a list of tickets', async () => {
  await createTicket('test 1', 20);
  await createTicket('test 2', 10);
  await createTicket('test 3', 30);

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
