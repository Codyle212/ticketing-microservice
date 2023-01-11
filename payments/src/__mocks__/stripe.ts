export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({
            id: 'paymentId',
            orderId: 'orderId',
            stripeId: 'stripeId',
        }),
    },
};
