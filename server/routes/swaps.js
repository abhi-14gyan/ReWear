const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Creating swap request
router.post('/', auth, [
  body('itemId').notEmpty(),
  body('type').isIn(['swap', 'points']),
  body('pointsOffered').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, type, pointsOffered } = req.body;
    const requesterId = req.user.user.id;

    const item = await Item.findOne({ 
      _id: itemId, 
      isAvailable: true, 
      status: 'approved' 
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not available' });
    }
    
    if (item.userId.toString() === requesterId) {
      return res.status(400).json({ message: 'Cannot request your own item' });
    }

    if (type === 'points') {
      const user = await User.findById(requesterId);
      if (user.points < pointsOffered) {
        return res.status(400).json({ message: 'Insufficient points' });
      }
    }

    const swap = new Swap({
      requesterId,
      itemId,
      type,
      pointsOffered: pointsOffered || 0
    });

    await swap.save();
    res.json({ id: swap._id, message: 'Swap request created successfully' });
  } catch (err) {
    console.error('Create swap error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's swap requests (as requester)
router.get('/my-requests', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({ requesterId: req.user.user.id })
      .populate({
        path: 'itemId',
        select: 'title images',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    const transformedSwaps = swaps.map(swap => ({
      ...swap.toObject(),
      itemTitle: swap.itemId.title,
      itemImages: swap.itemId.images,
      itemOwnerName: swap.itemId.userId.name
    }));

    res.json(transformedSwaps);
  } catch (err) {
    console.error('Get my requests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get swap requests for user's items (as item owner)
router.get('/my-items', auth, async (req, res) => {
  try {
    const swaps = await Swap.find({ 
      'itemId': { $in: await Item.find({ userId: req.user.user.id }).select('_id') },
      status: 'pending'
    })
    .populate({
      path: 'itemId',
      select: 'title images'
    })
    .populate({
      path: 'requesterId',
      select: 'name'
    })
    .sort({ createdAt: -1 });

    const transformedSwaps = swaps.map(swap => ({
      ...swap.toObject(),
      itemTitle: swap.itemId.title,
      itemImages: swap.itemId.images,
      requesterName: swap.requesterId.name
    }));

    res.json(transformedSwaps);
  } catch (err) {
    console.error('Get my items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept swap request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const swapId = req.params.id;

    const swap = await Swap.findById(swapId).populate('itemId');
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    if (swap.itemId.userId.toString() !== req.user.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap request already processed' });
    }

    swap.status = 'accepted';
    swap.completedAt = new Date();
    await swap.save();

    await Item.findByIdAndUpdate(swap.itemId._id, { isAvailable: false });

    if (swap.type === 'points') {
      await User.findByIdAndUpdate(swap.requesterId, { 
        $inc: { points: -swap.pointsOffered } 
      });
      await User.findByIdAndUpdate(req.user.user.id, { 
        $inc: { points: swap.pointsOffered } 
      });
    }

    res.json({ message: 'Swap accepted successfully' });
  } catch (err) {
    console.error('Accept swap error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject swap request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const swapId = req.params.id;

    const swap = await Swap.findById(swapId).populate('itemId');
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }
    
    if (swap.itemId.userId.toString() !== req.user.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap request already processed' });
    }

    swap.status = 'rejected';
    swap.completedAt = new Date();
    await swap.save();

    res.json({ message: 'Swap rejected successfully' });
  } catch (err) {
    console.error('Reject swap error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get swap history
router.get('/history', auth, async (req, res) => {
  try {
    const userItems = await Item.find({ userId: req.user.user.id }).select('_id');
    const userItemIds = userItems.map(item => item._id);

    const swaps = await Swap.find({
      $or: [
        { requesterId: req.user.user.id },
        { itemId: { $in: userItemIds } }
      ],
      status: { $in: ['accepted', 'rejected'] }
    })
    .populate({
      path: 'itemId',
      select: 'title images'
    })
    .populate({
      path: 'requesterId',
      select: 'name'
    })
    .populate({
      path: 'itemId',
      populate: {
        path: 'userId',
        select: 'name'
      }
    })
    .sort({ completedAt: -1 });

    const transformedSwaps = swaps.map(swap => ({
      ...swap.toObject(),
      itemTitle: swap.itemId.title,
      itemImages: swap.itemId.images,
      requesterName: swap.requesterId.name,
      ownerName: swap.itemId.userId.name
    }));

    res.json(transformedSwaps);
  } catch (err) {
    console.error('Get swap history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 