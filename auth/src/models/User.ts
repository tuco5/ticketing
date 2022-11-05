import mongoose from 'mongoose';
import { Password } from '../services/password';

// Interface that describes the attributes that User takes
export interface UserAttrs {
  email: string;
  password: string;
}

// Interface that describes that the UserModel has
export interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Interface that describes the properties that a User Document has
export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// Mongoose Schema declaration
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  // Transform the doc data when the doc is turn to a JSON. e.g. http responses
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
      versionKey: false,
    },
  }
);

// Hash password before save it into DB.
// We use function instead arrow because we don't want to override the this context.
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// Add a new method to our schema called build to create new User Docs
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
