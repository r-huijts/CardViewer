const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all cards
router.get('/', async (req, res) => {
  try {
    const cards = await db.all('SELECT * FROM cards ORDER BY created_at DESC');
    res.json(cards);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single card
router.get('/:id', async (req, res) => {
  try {
    const card = await db.get('SELECT * FROM cards WHERE id = ?', [req.params.id]);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    res.json(card);
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new card (requires auth)
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const image_path = req.file ? req.file.filename : null;
    
    const result = await db.run(
      'INSERT INTO cards (title, subtitle, image_path, description) VALUES (?, ?, ?, ?)',
      [title, subtitle || null, image_path, description || null]
    );
    
    const newCard = await db.get('SELECT * FROM cards WHERE id = ?', [result.id]);
    
    res.status(201).json(newCard);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update card (requires auth)
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, description } = req.body;
    const cardId = req.params.id;
    
    // Get current card to check if it exists and get current image
    const currentCard = await db.get('SELECT * FROM cards WHERE id = ?', [cardId]);
    
    if (!currentCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    let image_path = currentCard.image_path;
    
    // If new image is uploaded, delete old image and use new one
    if (req.file) {
      if (currentCard.image_path) {
        const oldImagePath = path.join('uploads', currentCard.image_path);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image_path = req.file.filename;
    }
    
    await db.run(
      'UPDATE cards SET title = ?, subtitle = ?, image_path = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        title || currentCard.title,
        subtitle !== undefined ? subtitle : currentCard.subtitle,
        image_path,
        description !== undefined ? description : currentCard.description,
        cardId
      ]
    );
    
    const updatedCard = await db.get('SELECT * FROM cards WHERE id = ?', [cardId]);
    res.json(updatedCard);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete card (requires auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const cardId = req.params.id;
    
    // Get card to check if it exists and get image path
    const card = await db.get('SELECT * FROM cards WHERE id = ?', [cardId]);
    
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Delete image file if it exists
    if (card.image_path) {
      const imagePath = path.join('uploads', card.image_path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await db.run('DELETE FROM cards WHERE id = ?', [cardId]);
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;