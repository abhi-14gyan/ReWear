const express = require('express');
const Item = require('../models/Item');
const User = require('../models/User');
const Swap = require('../models/Swap');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's items
router.get('/:id/items', async (req, res) => {
  try {
    const items = await Item.find({ 
      userId: req.params.id, 
      status: 'approved' 
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

    const transformedItems = items.map(item => ({
      ...item.toObject(),
      uploaderName: item.userId.name
    }));

    res.json(transformedItems);
  } catch (err) {
    console.error('Get user items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile (public info)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.aggregate([
      {
        $match: { _id: new require('mongoose').Types.ObjectId(req.params.id) }
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'userId',
          as: 'items'
        }
      },
      {
        $lookup: {
          from: 'swaps',
          localField: '_id',
          foreignField: 'requesterId',
          as: 'swaps'
        }
      },
      {
        $addFields: {
          itemCount: {
            $size: {
              $filter: {
                input: '$items',
                cond: { $eq: ['$$this.status', 'approved'] }
              }
            }
          },
          completedSwaps: {
            $size: {
              $filter: {
                input: '$swaps',
                cond: { $eq: ['$$this.status', 'accepted'] }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          points: 1,
          createdAt: 1,
          itemCount: 1,
          completedSwaps: 1
        }
      }
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user[0]);
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    await User.findByIdAndUpdate(userId, { name: name.trim() });
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's swap history
router.get('/:id/swaps', async (req, res) => {
  try {
    const userItems = await Item.find({ userId: req.params.id }).select('_id');
    const userItemIds = userItems.map(item => item._id);

    const swaps = await Swap.find({
      $or: [
        { requesterId: req.params.id },
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
    console.error('Get user swaps error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's active swap requests
router.get('/:id/active-swaps', async (req, res) => {
  try {
    const userItems = await Item.find({ userId: req.params.id }).select('_id');
    const userItemIds = userItems.map(item => item._id);

    const swaps = await Swap.find({
      $or: [
        { requesterId: req.params.id },
        { itemId: { $in: userItemIds } }
      ],
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
    .populate({
      path: 'itemId',
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
      requesterName: swap.requesterId.name,
      ownerName: swap.itemId.userId.name
    }));

    res.json(transformedSwaps);
  } catch (err) {
    console.error('Get user active swaps error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 