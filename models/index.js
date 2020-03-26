import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
const Schema = mongoose.Schema;
const userSchema = new Schema({
    username: String,
    password: String,
    email: String,
    image: {
        secure_url: { type: String, default: '/images/default-profile.jpg' },
        public_id: String
    },
})
userSchema.plugin(passportLocalMongoose);
export default mongoose.model("User", userSchema);