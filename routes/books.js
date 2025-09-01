const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Debug endpoint to check collections
router.get('/debug', async (req, res) => {
  try {
    console.log('Debug: Checking Firestore collections...');
    
    // Try to list all collections
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    console.log('Available collections:', collectionNames);
    
    // Try different possible collection names
    const possibleNames = ['books', 'Books', 'bible_books', 'bibleBooks'];
    const results = {};
    
    for (const name of possibleNames) {
      try {
        const snapshot = await db.collection(name).limit(1).get();
        results[name] = {
          exists: !snapshot.empty,
          size: snapshot.size,
          sampleDoc: snapshot.empty ? null : snapshot.docs[0].data()
        };
      } catch (error) {
        results[name] = { error: error.message };
      }
    }
    
    res.json({
      success: true,
      collections: collectionNames,
      testResults: results
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    console.log('Attempting to fetch books from Firestore...');
    const booksSnapshot = await db.collection('books')
      .orderBy('orderInBible')
      .get();

    console.log('Books snapshot empty:', booksSnapshot.empty);
    console.log('Books snapshot size:', booksSnapshot.size);

    if (booksSnapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: 'No books found. Please seed the database first.' 
      });
    }

    const books = booksSnapshot.docs.map(doc => {
      const data = doc.data();
      const chaptersArray = [];
      
      // Convert chapters object to array format
      if (data.chapters) {
        Object.keys(data.chapters).forEach(chapterNum => {
          const chapterIndex = parseInt(chapterNum) - 1;
          chaptersArray[chapterIndex] = data.chapters[chapterNum].verseCount;
        });
      }
      
      return {
        id: doc.id,
        name: data.name,
        testament: data.testament.toLowerCase(),
        order: data.orderInBible,
        chapters: chaptersArray,
        totalChapters: data.totalChapters,
        totalVerses: data.totalVerses,
        chaptersWithVerses: chaptersArray.map((verses, index) => ({
          chapter: index + 1,
          verses: verses
        }))
      };
    });

    res.json({
      success: true,
      data: books,
      total: books.length
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.get('/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const bookDoc = await db.collection('books').doc(bookId).get();

    if (!bookDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const data = bookDoc.data();
    const chaptersArray = [];
    
    // Convert chapters object to array format
    if (data.chapters) {
      Object.keys(data.chapters).forEach(chapterNum => {
        const chapterIndex = parseInt(chapterNum) - 1;
        chaptersArray[chapterIndex] = data.chapters[chapterNum].verseCount;
      });
    }

    res.json({
      success: true,
      data: {
        id: bookDoc.id,
        name: data.name,
        testament: data.testament.toLowerCase(),
        order: data.orderInBible,
        chapters: chaptersArray,
        totalChapters: data.totalChapters,
        totalVerses: data.totalVerses,
        chaptersWithVerses: chaptersArray.map((verses, index) => ({
          chapter: index + 1,
          verses: verses
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;