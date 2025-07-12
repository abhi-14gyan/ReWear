import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled']
    },
    type: {
      type: String,
      required: true,
      enum: ['swap', 'points']
    },
    pointsOffered: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date
    }
  }, {
    timestamps: true
  });
  
  export default mongoose.model('Swap', swapSchema); 