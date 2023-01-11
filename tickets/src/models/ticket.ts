import mongoose from 'mongoose';

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;
    orderId?: string;
}
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attributes: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
        optimisticConcurrency: true,
        versionKey: 'version',
    }
);

ticketSchema.statics.build = (attributes: TicketAttrs) => {
    return new Ticket(attributes);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
