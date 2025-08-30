const { db } = require('../config/firebase');
const { bibleBooks } = require('../data/bibleData');

async function seedBibleData() {
  try {
    console.log('Starting to seed Bible data...');
    
    const batch = db.batch();
    
    bibleBooks.forEach(book => {
      const bookRef = db.collection('books').doc(book.name.replace(/\s+/g, '').toLowerCase());
      batch.set(bookRef, {
        name: book.name,
        testament: book.testament,
        order: book.order,
        chapters: book.chapters,
        totalChapters: book.chapters.length,
        totalVerses: book.chapters.reduce((sum, verses) => sum + verses, 0)
      });
    });
    
    await batch.commit();
    console.log('Bible data seeded successfully!');
  } catch (error) {
    console.error('Error seeding Bible data:', error);
    throw error;
  }
}

module.exports = { seedBibleData };