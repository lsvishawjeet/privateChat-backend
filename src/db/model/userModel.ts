import mongoose from "mongoose";
import { UserModel } from "../../model/dataModes";

const UserSchema = new mongoose.Schema<UserModel>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, {
    timestamps: true
});

export default mongoose.model<UserModel>('User', UserSchema);