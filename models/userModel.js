import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    userLocation: { type: String, required: true },
    userBoxes: {
        type: [Schema.Types.Mixed],
    },
});

export default mongoose.model("users", userSchema);
