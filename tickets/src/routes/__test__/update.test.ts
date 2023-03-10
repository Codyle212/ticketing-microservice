import request from 'supertest';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({ title: 'Ticket', price: 20 })
        .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({ title: 'Ticket', price: 20 })
        .expect(401);
});

it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({ title: 'Ticket', price: 20 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({ title: 'New Ticket', price: 2000 })
        .expect(401);
});

it('returns a 400 if the user provided an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Ticket', price: 20 });

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: '', price: 20 })
        .expect(400);
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: 'Ticket', price: -20 })
        .expect(400);
});

it('updates the tickets provide valid input', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Ticket', price: 20 });

    const newTitle = 'New Ticket';
    const newPrice = 50;
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: newTitle, price: newPrice })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual(newTitle);
    expect(ticketResponse.body.price).toEqual(newPrice);
});

it('publishes an event', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Ticket', price: 20 });

    const newTitle = 'New Ticket';
    const newPrice = 50;
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: newTitle, price: newPrice })
        .expect(200);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is already reserved', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Ticket', price: 20 });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    const newTitle = 'New Ticket';
    const newPrice = 50;
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({ title: newTitle, price: newPrice })
        .expect(400);
});
