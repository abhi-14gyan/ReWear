import { Schema, model } from 'mongoose';

const itemSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories']
  },
  type: {
    type: String,
    required: true,
    enum: ['Casual', 'Formal', 'Sportswear', 'Vintage', 'Designer', "School Dresses"]
  },
  size: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'like-new', 'good', 'fair', 'poor']
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }],
  points: {
    type: Number,
    default: 0
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default model('Item', itemSchema); 