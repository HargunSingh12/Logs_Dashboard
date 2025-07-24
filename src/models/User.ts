import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  country: String,
  phone: String,
  password: { type: String, required: true }, // Store hashed passwords in production!
}, { timestamps: true });

export default models.User || model('User', UserSchema); 