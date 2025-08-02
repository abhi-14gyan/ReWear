import { Router } from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { auth } from '../middlewares/auth.js';
import { storage } from '../config/cloudinary.js';

const router = Router();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, type, status, search } = req.query;
    let query = {}; 
    if (!req.query.debug) {
      query.status = 'approved';
      query.isAvailable = true;
    }

    if (category) query.category = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    console.log(`Found ${items.length} items matching query:`, query);
    
    // Debug: Log first few items to see their structure
    if (items.length > 0) {
      console.log('Sample item:', {
        id: items[0]._id,
        title: items[0].title,
        images: items[0].images,
        userId: items[0].userId
      });
    }

    const transformedItems = items.map(item => {
      const itemObj = item.toObject();
      return {
        ...itemObj,
        id: itemObj._id,
        uploaderName: itemObj.userId?.name || 'Unknown',
        uploaderId: itemObj.userId?._id || null
      };
    });

    res.json(transformedItems);
  } catch (err) {
    console.error('Get items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const items = await Item.find({ status: 'approved', isAvailable: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    const transformedItems = items.map(item => {
      const itemObj = item.toObject();
      return {
        ...itemObj,
        id: itemObj._id,
        uploaderName: itemObj.userId.name,
        uploaderId: itemObj.userId._id
      };
    });

    res.json(transformedItems);
  } catch (err) {
    console.error('Get featured items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('userId', 'name id');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const itemObj = item.toObject();
    const transformedItem = {
      ...itemObj,
      id: itemObj._id,
      uploaderName: itemObj.userId.name,
      uploaderId: itemObj.userId._id
    };

    res.json(transformedItem);
  } catch (err) {
    console.error('Get item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, upload.array('images', 5), [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('type').notEmpty().trim(),
  body('condition').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, type, size, condition, tags, points } = req.body;
    const images = req.files ? req.files.map(file => file.path || file.filename) : [];

    const item = new Item({
      title,
      description,
      category,
      type,
      size,
      condition,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      images,
      points: points || 0,
      userId: req.user.user.id,
      status: 'pending' // Items require manual approval by admin
    });

    await item.save();
    
    console.log('Created item:', {
      id: item._id,
      title: item.title,
      images: item.images,
      status: item.status
    });

    res.json({ id: item._id, message: 'Item created successfully' });
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, type, size, condition, tags, points } = req.body;
    const itemId = req.params.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.userId.toString() !== req.user.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = {
      title,
      description,
      category,
      type,
      size,
      condition,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      points: points || 0
    };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => file.path || file.filename);
    }

    await Item.findByIdAndUpdate(itemId, updateData);
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const itemId = req.params.id;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.userId.toString() !== req.user.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Item.findByIdAndDelete(itemId);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const items = await Item.find({ 
      userId: req.params.userId
      // Removed status filter to show all user items including pending ones
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

    const transformedItems = items.map(item => {
      const itemObj = item.toObject();
      return {
        ...itemObj,
        id: itemObj._id,
        uploaderName: itemObj.userId.name,
        uploaderId: itemObj.userId._id
      };
    });

    res.json(transformedItems);
  } catch (err) {
    console.error('Get user items error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Debug route to check all items
router.get('/debug/all', async (req, res) => {
  try {
    const allItems = await Item.find({}).populate('userId', 'name');
    console.log('All items in database:', allItems.map(item => ({
      id: item._id,
      title: item.title,
      images: item.images,
      status: item.status,
      isAvailable: item.isAvailable
    })));
    res.json(allItems);
  } catch (err) {
    console.error('Debug route error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test image route
router.get('/debug/test-image', (req, res) => {
  res.json({
    message: 'Image test',
    testUrl: '/uploads/item-1752316699525-447588118.png',
    fullUrl: 'http://localhost:5000/uploads/item-1752316699525-447588118.png'
  });
});

export default router;