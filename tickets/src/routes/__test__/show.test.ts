import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';

it('returns a 404 if ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns the ticket if the ticket is found', async () => {
    const title = 'concert';
    const price = 20;
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price,
        });
    const getTicketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);
    expect(getTicketResponse.body.title).toEqual(title);
    expect(getTicketResponse.body.price).toEqual(price);
});
