const { db } = require('./config/firebase');
const fs = require('fs');

async function getBooksData() {
  try {
    console.log('Fetching books collection from Firebase...');
    
    const booksSnapshot = await db.collection('books').get();
    const booksData = {};
    
    booksSnapshot.forEach(doc => {
      const data = doc.data();
      booksData[doc.id] = {
        name: data.name,
        testament: data.testament,
        chapters: data.chapters || []
      };
    });
    
    // Save to JSON file
    fs.writeFileSync('books_data.json', JSON.stringify(booksData, null, 2));
    
    console.log(`Fetched ${Object.keys(booksData).length} books`);
    console.log('Data saved to books_data.json');
    
    // Show sample of New Testament books
    console.log('\nNew Testament books with chapter info:');
    Object.entries(booksData).forEach(([id, book]) => {
      if (book.testament === 'New') {
        console.log(`${book.name}: ${book.chapters.length} chapters`);
        if (book.chapters.length > 0 && book.chapters[0]) {
          console.log(`  Chapter 1: ${book.chapters[0]} verses`);
        }
      }
    });
    
    return booksData;
    
  } catch (error) {
    console.error('Error fetching books data:', error);
    throw error;
  }
}

if (require.main === module) {
  getBooksData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { getBooksData };