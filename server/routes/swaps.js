import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Swaps route - to be implemented' });
});

export default router; 