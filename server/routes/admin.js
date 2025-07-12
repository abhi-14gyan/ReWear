import { Router } from 'express';
import Item from '../models/Item.js';
import User from '../models/User.js';
import Swap from '../models/Swap.js';
import { adminAuth } from '../middlewares/auth.js';

const router = Router();

router.get('/pending-items', adminAuth, async (req, res) => {
  try {
    const items = await Item.find({ status: 'pending' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const transformedItems = items.map(item => {
      const itemObj = item.toObject();
      return {
        ...itemObj,
        id: itemObj._id,
        uploaderName: itemObj.userId.name,
        uploaderEmail: itemObj.userId.email
      };
    });

    res.json(transformedItems);
  } catch (err) {
    console.error('Get pending items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/items/:id/approve', adminAuth, async (req, res) => {
  try {
    const itemId = req.params.id;
    await Item.findByIdAndUpdate(itemId, { status: 'approved' });
    res.json({ message: 'Item approved successfully' });
  } catch (err) {
    console.error('Approve item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/items/:id/reject', adminAuth, async (req, res) => {
  try {
    const itemId = req.params.id;
    await Item.findByIdAndUpdate(itemId, { status: 'rejected' });
    res.json({ message: 'Item rejected successfully' });
  } catch (err) {
    console.error('Reject item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/items/:id', adminAuth, async (req, res) => {
  try {
    const itemId = req.params.id;
    await Item.findByIdAndDelete(itemId);
    res.json({ message: 'Item removed successfully' });
  } catch (err) {
    console.error('Remove item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: 'userId',
          as: 'items'
        }
      },
      {
        $addFields: {
          itemCount: { $size: '$items' }
        }
      },
      {
        $project: {
          items: 0,
          password: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    const transformedUsers = users.map(user => ({
      ...user,
      id: user._id
    }));
    res.json(transformedUsers);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id/points', adminAuth, async (req, res) => {
  try {
    const { points } = req.body;
    const userId = req.params.id;

    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({ message: 'Invalid points value' });
    }

    await User.findByIdAndUpdate(userId, { points });
    res.json({ message: 'User points updated successfully' });
  } catch (err) {
    console.error('Update user points error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id/admin', adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAdminStatus = !user.isAdmin;
    await User.findByIdAndUpdate(userId, { isAdmin: newAdminStatus });
    
    res.json({ 
      message: `User admin status ${newAdminStatus ? 'enabled' : 'disabled'} successfully` 
    });
  } catch (err) {
    console.error('Toggle admin status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalUsers, approvedItems, pendingItems, completedSwaps, totalPoints] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ status: 'approved' }),
      Item.countDocuments({ status: 'pending' }),
      Swap.countDocuments({ status: 'accepted' }),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalPoints: { $sum: '$points' }
          }
        }
      ])
    ]);

    const stats = {
      totalUsers,
      approvedItems,
      pendingItems,
      completedSwaps,
      totalPoints: totalPoints[0]?.totalPoints || 0
    };

    res.json(stats);
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/activity', adminAuth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentItems, recentSwaps] = await Promise.all([
      Item.find({ createdAt: { $gte: sevenDaysAgo } })
        .populate('userId', 'name')
        .select('title userId createdAt')
        .sort({ createdAt: -1 })
        .limit(10),
      
      Swap.find({ 
        status: 'accepted', 
        completedAt: { $gte: sevenDaysAgo } 
      })
        .populate('requesterId', 'name')
        .populate('itemId', 'title')
        .select('requesterId itemId completedAt')
        .sort({ completedAt: -1 })
        .limit(10)
    ]);

    const activity = [
      ...recentItems.map(item => ({
        type: 'item_created',
        title: item.title,
        userName: item.userId.name,
        timestamp: item.createdAt
      })),
      ...recentSwaps.map(swap => ({
        type: 'swap_completed',
        title: swap.itemId.title,
        userName: swap.requesterId.name,
        timestamp: swap.completedAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, 20);

    res.json(activity);
  } catch (err) {
    console.error('Get activity error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 