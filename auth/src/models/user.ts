import mongoose from 'mongoose';
import { Password } from '../services/password';
// An interface that describe the properties
//that are required to create a new User

interface UserAtters {
    email: string;
    password: string;
}

//An interface that describe the properties
// that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attributes: UserAtters): UserDoc;
}

//An interface that describe the properties
// that a User Document in DB has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
    {
        // this option specifies how to return a json
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
                delete ret.__v;
            },
        },
    }
);
//moogoose middleware for save, creating is  modification of password
userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const hashedPassword = await Password.toHash(this.get('password'));
        this.set('password', hashedPassword);
        done();
    }
});
//add statics to schema that build the user
userSchema.statics.build = (attributes: UserAtters) => {
    return new User(attributes);
};
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
