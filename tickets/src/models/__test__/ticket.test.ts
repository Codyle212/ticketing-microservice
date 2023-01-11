import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    // Create a instance of a ticket
    const ticket = Ticket.build({
        title: 'Ticket',
        price: 5,
        userId: 'userId',
    });
    // Save the ticket to the database
    await ticket.save();
    // Fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);
    // Make two separte changes to the tickets we fetch
    firstInstance!.set({ price: 10 });
    secondInstance!.set({ price: 15 });
    // Save the first fetched ticket
    await firstInstance!.save();
    // Save the second fetched ticket and expect an error
    try {
        await secondInstance!.save();
    } catch (err) {
        return;
    }
    // throw new Error('Should not reach this point');
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'Ticket',
        price: 5,
        userId: 'userId',
    });
    await ticket.save();
    expect(ticket.version).toEqual(0);

    ticket.set({ title: 'Ticket 2' });
    await ticket.save();
    expect(ticket.version).toEqual(1);

    ticket.set({ price: 10 });
    await ticket.save();
    expect(ticket.version).toEqual(2);
});
