const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');


// Path to your service account key file
const serviceAccount = require('./biblereading-pkey.json');

// Initialize Firebase Admin SDK
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

// Book order mappings
const bookOrder = {
  // Old Testament books in order (1-39)
  oldTestament: [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', '1samuel', '2samuel',
    '1kings', '2kings', '1chronicles', '2chronicles', 'ezra',
    'nehemiah', 'esther', 'job', 'psalms', 'proverbs',
    'ecclesiastes', 'songofsolomon', 'isaiah', 'jeremiah', 'lamentations',
    'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk',
    'zephaniah', 'haggai', 'zechariah', 'malachi'
  ],
  // New Testament books in order (40-66)
  newTestament: [
    'matthew', 'mark', 'luke', 'john', 'acts',
    'romans', '1corinthians', '2corinthians', 'galatians', 'ephesians',
    'philippians', 'colossians', '1thessalonians', '2thessalonians', '1timothy',
    '2timothy', 'titus', 'philemon', 'hebrews', 'james',
    '1peter', '2peter', '1john', '2john', '3john',
    'jude', 'revelation'
  ],
  // Complete Bible order (1-66)
  get all() {
    return [...this.oldTestament, ...this.newTestament];
  }
};

// Testament metadata collection
const testaments = {
  old: {
    id: 'old',
    name: 'Old Testament',
    bookCount: 39,
    startBookNumber: 1,
    endBookNumber: 39,
    books: bookOrder.oldTestament,
    totalChapters: 929,
    totalVerses: 23145
  },
  new: {
    id: 'new',
    name: 'New Testament',
    bookCount: 27,
    startBookNumber: 40,
    endBookNumber: 66,
    books: bookOrder.newTestament,
    totalChapters: 260,
    totalVerses: 7957
  }
};

// Complete Bible book data with chapter and verse counts
const bibleBooks = [
  // Old Testament
  {
    id: 'genesis',
    bookNumber: 1,
    orderInTestament: 1,
    orderInBible: 1,
    name: 'Genesis',
    testament: 'Old',
    totalChapters: 50,
    totalVerses: 1533,
    chapters: {
      1: { verseCount: 31 }, 2: { verseCount: 25 }, 3: { verseCount: 24 }, 4: { verseCount: 26 }, 5: { verseCount: 32 },
      6: { verseCount: 22 }, 7: { verseCount: 24 }, 8: { verseCount: 22 }, 9: { verseCount: 29 }, 10: { verseCount: 32 },
      11: { verseCount: 32 }, 12: { verseCount: 20 }, 13: { verseCount: 18 }, 14: { verseCount: 24 }, 15: { verseCount: 21 },
      16: { verseCount: 16 }, 17: { verseCount: 27 }, 18: { verseCount: 33 }, 19: { verseCount: 38 }, 20: { verseCount: 18 },
      21: { verseCount: 34 }, 22: { verseCount: 24 }, 23: { verseCount: 20 }, 24: { verseCount: 67 }, 25: { verseCount: 34 },
      26: { verseCount: 35 }, 27: { verseCount: 46 }, 28: { verseCount: 22 }, 29: { verseCount: 35 }, 30: { verseCount: 43 },
      31: { verseCount: 55 }, 32: { verseCount: 32 }, 33: { verseCount: 20 }, 34: { verseCount: 31 }, 35: { verseCount: 29 },
      36: { verseCount: 43 }, 37: { verseCount: 36 }, 38: { verseCount: 30 }, 39: { verseCount: 23 }, 40: { verseCount: 23 },
      41: { verseCount: 57 }, 42: { verseCount: 38 }, 43: { verseCount: 34 }, 44: { verseCount: 34 }, 45: { verseCount: 28 },
      46: { verseCount: 34 }, 47: { verseCount: 31 }, 48: { verseCount: 22 }, 49: { verseCount: 33 }, 50: { verseCount: 26 }
    }
  },
  {
    id: 'exodus',
    bookNumber: 2,
    orderInTestament: 2,
    orderInBible: 2,
    name: 'Exodus',
    testament: 'Old',
    totalChapters: 40,
    totalVerses: 1213,
    chapters: {
      1: { verseCount: 22 }, 2: { verseCount: 25 }, 3: { verseCount: 22 }, 4: { verseCount: 31 }, 5: { verseCount: 23 },
      6: { verseCount: 30 }, 7: { verseCount: 25 }, 8: { verseCount: 32 }, 9: { verseCount: 35 }, 10: { verseCount: 29 },
      11: { verseCount: 10 }, 12: { verseCount: 51 }, 13: { verseCount: 22 }, 14: { verseCount: 31 }, 15: { verseCount: 27 },
      16: { verseCount: 36 }, 17: { verseCount: 16 }, 18: { verseCount: 27 }, 19: { verseCount: 25 }, 20: { verseCount: 26 },
      21: { verseCount: 36 }, 22: { verseCount: 31 }, 23: { verseCount: 33 }, 24: { verseCount: 18 }, 25: { verseCount: 40 },
      26: { verseCount: 37 }, 27: { verseCount: 21 }, 28: { verseCount: 43 }, 29: { verseCount: 46 }, 30: { verseCount: 38 },
      31: { verseCount: 18 }, 32: { verseCount: 35 }, 33: { verseCount: 23 }, 34: { verseCount: 35 }, 35: { verseCount: 35 },
      36: { verseCount: 38 }, 37: { verseCount: 29 }, 38: { verseCount: 31 }, 39: { verseCount: 43 }, 40: { verseCount: 38 }
    }
  },
  {
    id: 'leviticus',
    bookNumber: 3,
    orderInTestament: 3,
    orderInBible: 3,
    name: 'Leviticus',
    testament: 'Old',
    totalChapters: 27,
    totalVerses: 859,
    chapters: {
      1: { verseCount: 17 }, 2: { verseCount: 16 }, 3: { verseCount: 17 }, 4: { verseCount: 35 }, 5: { verseCount: 19 },
      6: { verseCount: 30 }, 7: { verseCount: 38 }, 8: { verseCount: 36 }, 9: { verseCount: 24 }, 10: { verseCount: 20 },
      11: { verseCount: 47 }, 12: { verseCount: 8 }, 13: { verseCount: 59 }, 14: { verseCount: 57 }, 15: { verseCount: 33 },
      16: { verseCount: 34 }, 17: { verseCount: 16 }, 18: { verseCount: 30 }, 19: { verseCount: 37 }, 20: { verseCount: 27 },
      21: { verseCount: 24 }, 22: { verseCount: 33 }, 23: { verseCount: 44 }, 24: { verseCount: 23 }, 25: { verseCount: 55 },
      26: { verseCount: 46 }, 27: { verseCount: 34 }
    }
  },
  {
    id: 'numbers',
    bookNumber: 4,
    orderInTestament: 4,
    orderInBible: 4,
    name: 'Numbers',
    testament: 'Old',
    totalChapters: 36,
    totalVerses: 1288,
    chapters: {
      1: { verseCount: 54 }, 2: { verseCount: 34 }, 3: { verseCount: 51 }, 4: { verseCount: 49 }, 5: { verseCount: 31 },
      6: { verseCount: 27 }, 7: { verseCount: 89 }, 8: { verseCount: 26 }, 9: { verseCount: 23 }, 10: { verseCount: 36 },
      11: { verseCount: 35 }, 12: { verseCount: 16 }, 13: { verseCount: 33 }, 14: { verseCount: 45 }, 15: { verseCount: 41 },
      16: { verseCount: 50 }, 17: { verseCount: 13 }, 18: { verseCount: 32 }, 19: { verseCount: 22 }, 20: { verseCount: 29 },
      21: { verseCount: 35 }, 22: { verseCount: 41 }, 23: { verseCount: 30 }, 24: { verseCount: 25 }, 25: { verseCount: 18 },
      26: { verseCount: 65 }, 27: { verseCount: 23 }, 28: { verseCount: 31 }, 29: { verseCount: 40 }, 30: { verseCount: 16 },
      31: { verseCount: 54 }, 32: { verseCount: 42 }, 33: { verseCount: 56 }, 34: { verseCount: 29 }, 35: { verseCount: 34 },
      36: { verseCount: 13 }
    }
  },
  {
    id: 'deuteronomy',
    bookNumber: 5,
    orderInTestament: 5,
    orderInBible: 5,
    name: 'Deuteronomy',
    testament: 'Old',
    totalChapters: 34,
    totalVerses: 959,
    chapters: {
      1: { verseCount: 46 }, 2: { verseCount: 37 }, 3: { verseCount: 29 }, 4: { verseCount: 49 }, 5: { verseCount: 33 },
      6: { verseCount: 25 }, 7: { verseCount: 26 }, 8: { verseCount: 20 }, 9: { verseCount: 29 }, 10: { verseCount: 22 },
      11: { verseCount: 32 }, 12: { verseCount: 32 }, 13: { verseCount: 18 }, 14: { verseCount: 29 }, 15: { verseCount: 23 },
      16: { verseCount: 22 }, 17: { verseCount: 20 }, 18: { verseCount: 22 }, 19: { verseCount: 21 }, 20: { verseCount: 20 },
      21: { verseCount: 23 }, 22: { verseCount: 30 }, 23: { verseCount: 25 }, 24: { verseCount: 22 }, 25: { verseCount: 19 },
      26: { verseCount: 19 }, 27: { verseCount: 26 }, 28: { verseCount: 68 }, 29: { verseCount: 29 }, 30: { verseCount: 20 },
      31: { verseCount: 30 }, 32: { verseCount: 52 }, 33: { verseCount: 29 }, 34: { verseCount: 12 }
    }
  },
  {
    id: 'joshua',
    bookNumber: 6,
    orderInTestament: 6,
    orderInBible: 6,
    name: 'Joshua',
    testament: 'Old',
    totalChapters: 24,
    totalVerses: 658,
    chapters: {
      1: { verseCount: 18 }, 2: { verseCount: 24 }, 3: { verseCount: 17 }, 4: { verseCount: 24 }, 5: { verseCount: 15 },
      6: { verseCount: 27 }, 7: { verseCount: 26 }, 8: { verseCount: 35 }, 9: { verseCount: 27 }, 10: { verseCount: 43 },
      11: { verseCount: 23 }, 12: { verseCount: 24 }, 13: { verseCount: 33 }, 14: { verseCount: 15 }, 15: { verseCount: 63 },
      16: { verseCount: 10 }, 17: { verseCount: 18 }, 18: { verseCount: 28 }, 19: { verseCount: 51 }, 20: { verseCount: 9 },
      21: { verseCount: 45 }, 22: { verseCount: 34 }, 23: { verseCount: 16 }, 24: { verseCount: 33 }
    }
  },
  {
    id: 'judges',
    bookNumber: 7,
    orderInTestament: 7,
    orderInBible: 7,
    name: 'Judges',
    testament: 'Old',
    totalChapters: 21,
    totalVerses: 618,
    chapters: {
      1: { verseCount: 36 }, 2: { verseCount: 23 }, 3: { verseCount: 31 }, 4: { verseCount: 24 }, 5: { verseCount: 31 },
      6: { verseCount: 40 }, 7: { verseCount: 25 }, 8: { verseCount: 35 }, 9: { verseCount: 57 }, 10: { verseCount: 18 },
      11: { verseCount: 40 }, 12: { verseCount: 15 }, 13: { verseCount: 25 }, 14: { verseCount: 20 }, 15: { verseCount: 20 },
      16: { verseCount: 31 }, 17: { verseCount: 13 }, 18: { verseCount: 31 }, 19: { verseCount: 30 }, 20: { verseCount: 48 },
      21: { verseCount: 25 }
    }
  },
  {
    id: 'ruth',
    bookNumber: 8,
    orderInTestament: 8,
    orderInBible: 8,
    name: 'Ruth',
    testament: 'Old',
    totalChapters: 4,
    totalVerses: 85,
    chapters: {
      1: { verseCount: 22 }, 2: { verseCount: 23 }, 3: { verseCount: 18 }, 4: { verseCount: 22 }
    }
  },
  {
    id: '1samuel',
    bookNumber: 9,
    orderInTestament: 9,
    orderInBible: 9,
    name: '1 Samuel',
    testament: 'Old',
    totalChapters: 31,
    totalVerses: 810,
    chapters: {
      1: { verseCount: 28 }, 2: { verseCount: 36 }, 3: { verseCount: 21 }, 4: { verseCount: 22 }, 5: { verseCount: 12 },
      6: { verseCount: 21 }, 7: { verseCount: 17 }, 8: { verseCount: 22 }, 9: { verseCount: 27 }, 10: { verseCount: 27 },
      11: { verseCount: 15 }, 12: { verseCount: 25 }, 13: { verseCount: 23 }, 14: { verseCount: 52 }, 15: { verseCount: 35 },
      16: { verseCount: 23 }, 17: { verseCount: 58 }, 18: { verseCount: 30 }, 19: { verseCount: 24 }, 20: { verseCount: 42 },
      21: { verseCount: 15 }, 22: { verseCount: 23 }, 23: { verseCount: 29 }, 24: { verseCount: 22 }, 25: { verseCount: 44 },
      26: { verseCount: 25 }, 27: { verseCount: 12 }, 28: { verseCount: 25 }, 29: { verseCount: 11 }, 30: { verseCount: 31 },
      31: { verseCount: 13 }
    }
  },
  {
    id: '2samuel',
    bookNumber: 10,
    orderInTestament: 10,
    orderInBible: 10,
    name: '2 Samuel',
    testament: 'Old',
    totalChapters: 24,
    totalVerses: 695,
    chapters: {
      1: { verseCount: 27 }, 2: { verseCount: 32 }, 3: { verseCount: 39 }, 4: { verseCount: 12 }, 5: { verseCount: 25 },
      6: { verseCount: 23 }, 7: { verseCount: 29 }, 8: { verseCount: 18 }, 9: { verseCount: 13 }, 10: { verseCount: 19 },
      11: { verseCount: 27 }, 12: { verseCount: 31 }, 13: { verseCount: 39 }, 14: { verseCount: 33 }, 15: { verseCount: 37 },
      16: { verseCount: 23 }, 17: { verseCount: 29 }, 18: { verseCount: 33 }, 19: { verseCount: 43 }, 20: { verseCount: 26 },
      21: { verseCount: 22 }, 22: { verseCount: 51 }, 23: { verseCount: 39 }, 24: { verseCount: 25 }
    }
  },
  {
    id: '1kings',
    bookNumber: 11,
    orderInTestament: 11,
    orderInBible: 11,
    name: '1 Kings',
    testament: 'Old',
    totalChapters: 22,
    totalVerses: 816,
    chapters: {
      1: { verseCount: 53 }, 2: { verseCount: 46 }, 3: { verseCount: 28 }, 4: { verseCount: 34 }, 5: { verseCount: 18 },
      6: { verseCount: 38 }, 7: { verseCount: 51 }, 8: { verseCount: 66 }, 9: { verseCount: 28 }, 10: { verseCount: 29 },
      11: { verseCount: 43 }, 12: { verseCount: 33 }, 13: { verseCount: 34 }, 14: { verseCount: 31 }, 15: { verseCount: 34 },
      16: { verseCount: 34 }, 17: { verseCount: 24 }, 18: { verseCount: 46 }, 19: { verseCount: 21 }, 20: { verseCount: 43 },
      21: { verseCount: 29 }, 22: { verseCount: 53 }
    }
  },
  {
    id: '2kings',
    bookNumber: 12,
    orderInTestament: 12,
    orderInBible: 12,
    name: '2 Kings',
    testament: 'Old',
    totalChapters: 25,
    totalVerses: 719,
    chapters: {
      1: { verseCount: 18 }, 2: { verseCount: 25 }, 3: { verseCount: 27 }, 4: { verseCount: 44 }, 5: { verseCount: 27 },
      6: { verseCount: 33 }, 7: { verseCount: 20 }, 8: { verseCount: 29 }, 9: { verseCount: 37 }, 10: { verseCount: 36 },
      11: { verseCount: 21 }, 12: { verseCount: 21 }, 13: { verseCount: 25 }, 14: { verseCount: 29 }, 15: { verseCount: 38 },
      16: { verseCount: 20 }, 17: { verseCount: 41 }, 18: { verseCount: 37 }, 19: { verseCount: 37 }, 20: { verseCount: 21 },
      21: { verseCount: 26 }, 22: { verseCount: 20 }, 23: { verseCount: 37 }, 24: { verseCount: 20 }, 25: { verseCount: 30 }
    }
  },
  {
    id: '1chronicles',
    bookNumber: 13,
    orderInTestament: 13,
    orderInBible: 13,
    name: '1 Chronicles',
    testament: 'Old',
    totalChapters: 29,
    totalVerses: 942,
    chapters: {
      1: { verseCount: 54 }, 2: { verseCount: 55 }, 3: { verseCount: 24 }, 4: { verseCount: 43 }, 5: { verseCount: 26 },
      6: { verseCount: 81 }, 7: { verseCount: 40 }, 8: { verseCount: 40 }, 9: { verseCount: 44 }, 10: { verseCount: 14 },
      11: { verseCount: 47 }, 12: { verseCount: 40 }, 13: { verseCount: 14 }, 14: { verseCount: 17 }, 15: { verseCount: 29 },
      16: { verseCount: 43 }, 17: { verseCount: 27 }, 18: { verseCount: 17 }, 19: { verseCount: 19 }, 20: { verseCount: 8 },
      21: { verseCount: 30 }, 22: { verseCount: 19 }, 23: { verseCount: 32 }, 24: { verseCount: 31 }, 25: { verseCount: 31 },
      26: { verseCount: 32 }, 27: { verseCount: 34 }, 28: { verseCount: 21 }, 29: { verseCount: 30 }
    }
  },
  {
    id: '2chronicles',
    bookNumber: 14,
    orderInTestament: 14,
    orderInBible: 14,
    name: '2 Chronicles',
    testament: 'Old',
    totalChapters: 36,
    totalVerses: 822,
    chapters: {
      1: { verseCount: 17 }, 2: { verseCount: 18 }, 3: { verseCount: 17 }, 4: { verseCount: 22 }, 5: { verseCount: 14 },
      6: { verseCount: 42 }, 7: { verseCount: 22 }, 8: { verseCount: 18 }, 9: { verseCount: 31 }, 10: { verseCount: 19 },
      11: { verseCount: 23 }, 12: { verseCount: 16 }, 13: { verseCount: 22 }, 14: { verseCount: 15 }, 15: { verseCount: 19 },
      16: { verseCount: 14 }, 17: { verseCount: 19 }, 18: { verseCount: 34 }, 19: { verseCount: 11 }, 20: { verseCount: 37 },
      21: { verseCount: 20 }, 22: { verseCount: 12 }, 23: { verseCount: 21 }, 24: { verseCount: 27 }, 25: { verseCount: 28 },
      26: { verseCount: 23 }, 27: { verseCount: 9 }, 28: { verseCount: 27 }, 29: { verseCount: 36 }, 30: { verseCount: 27 },
      31: { verseCount: 21 }, 32: { verseCount: 33 }, 33: { verseCount: 25 }, 34: { verseCount: 33 }, 35: { verseCount: 27 },
      36: { verseCount: 23 }
    }
  },
  {
    id: 'ezra',
    bookNumber: 15,
    orderInTestament: 15,
    orderInBible: 15,
    name: 'Ezra',
    testament: 'Old',
    totalChapters: 10,
    totalVerses: 280,
    chapters: {
      1: { verseCount: 11 }, 2: { verseCount: 70 }, 3: { verseCount: 13 }, 4: { verseCount: 24 }, 5: { verseCount: 17 },
      6: { verseCount: 22 }, 7: { verseCount: 28 }, 8: { verseCount: 36 }, 9: { verseCount: 15 }, 10: { verseCount: 44 }
    }
  },
  {
    id: 'nehemiah',
    bookNumber: 16,
    orderInTestament: 16,
    orderInBible: 16,
    name: 'Nehemiah',
    testament: 'Old',
    totalChapters: 13,
    totalVerses: 406,
    chapters: {
      1: { verseCount: 11 }, 2: { verseCount: 20 }, 3: { verseCount: 32 }, 4: { verseCount: 23 }, 5: { verseCount: 19 },
      6: { verseCount: 19 }, 7: { verseCount: 73 }, 8: { verseCount: 18 }, 9: { verseCount: 38 }, 10: { verseCount: 39 },
      11: { verseCount: 36 }, 12: { verseCount: 47 }, 13: { verseCount: 31 }
    }
  },
  {
    id: 'esther',
    bookNumber: 17,
    orderInTestament: 17,
    orderInBible: 17,
    name: 'Esther',
    testament: 'Old',
    totalChapters: 10,
    totalVerses: 167,
    chapters: {
      1: { verseCount: 22 }, 2: { verseCount: 23 }, 3: { verseCount: 15 }, 4: { verseCount: 17 }, 5: { verseCount: 14 },
      6: { verseCount: 14 }, 7: { verseCount: 10 }, 8: { verseCount: 17 }, 9: { verseCount: 32 }, 10: { verseCount: 3 }
    }
  },
  {
    id: 'job',
    bookNumber: 18,
    orderInTestament: 18,
    orderInBible: 18,
    name: 'Job',
    testament: 'Old',
    totalChapters: 42,
    totalVerses: 1070,
    chapters: {
      1: { verseCount: 22 }, 2: { verseCount: 13 }, 3: { verseCount: 26 }, 4: { verseCount: 21 }, 5: { verseCount: 27 },
      6: { verseCount: 30 }, 7: { verseCount: 21 }, 8: { verseCount: 22 }, 9: { verseCount: 35 }, 10: { verseCount: 22 },
      11: { verseCount: 20 }, 12: { verseCount: 25 }, 13: { verseCount: 28 }, 14: { verseCount: 22 }, 15: { verseCount: 35 },
      16: { verseCount: 22 }, 17: { verseCount: 16 }, 18: { verseCount: 21 }, 19: { verseCount: 29 }, 20: { verseCount: 29 },
      21: { verseCount: 34 }, 22: { verseCount: 30 }, 23: { verseCount: 17 }, 24: { verseCount: 25 }, 25: { verseCount: 6 },
      26: { verseCount: 14 }, 27: { verseCount: 23 }, 28: { verseCount: 28 }, 29: { verseCount: 25 }, 30: { verseCount: 31 },
      31: { verseCount: 40 }, 32: { verseCount: 22 }, 33: { verseCount: 33 }, 34: { verseCount: 37 }, 35: { verseCount: 16 },
      36: { verseCount: 33 }, 37: { verseCount: 24 }, 38: { verseCount: 41 }, 39: { verseCount: 30 }, 40: { verseCount: 24 },
      41: { verseCount: 34 }, 42: { verseCount: 17 }
    }
  },
  {
    id: 'psalms',
    bookNumber: 19,
    orderInTestament: 19,
    orderInBible: 19,
    name: 'Psalms',
    testament: 'Old',
    totalChapters: 150,
    totalVerses: 2461,
    chapters: {
      1: { verseCount: 6 }, 2: { verseCount: 12 }, 3: { verseCount: 8 }, 4: { verseCount: 8 }, 5: { verseCount: 12 },
      6: { verseCount: 10 }, 7: { verseCount: 17 }, 8: { verseCount: 9 }, 9: { verseCount: 20 }, 10: { verseCount: 18 },
      11: { verseCount: 7 }, 12: { verseCount: 8 }, 13: { verseCount: 6 }, 14: { verseCount: 7 }, 15: { verseCount: 5 },
      16: { verseCount: 11 }, 17: { verseCount: 15 }, 18: { verseCount: 50 }, 19: { verseCount: 14 }, 20: { verseCount: 9 },
      21: { verseCount: 13 }, 22: { verseCount: 31 }, 23: { verseCount: 6 }, 24: { verseCount: 10 }, 25: { verseCount: 22 },
      26: { verseCount: 12 }, 27: { verseCount: 14 }, 28: { verseCount: 9 }, 29: { verseCount: 11 }, 30: { verseCount: 12 },
      31: { verseCount: 24 }, 32: { verseCount: 11 }, 33: { verseCount: 22 }, 34: { verseCount: 22 }, 35: { verseCount: 28 },
      36: { verseCount: 12 }, 37: { verseCount: 40 }, 38: { verseCount: 22 }, 39: { verseCount: 13 }, 40: { verseCount: 17 },
      41: { verseCount: 13 }, 42: { verseCount: 11 }, 43: { verseCount: 5 }, 44: { verseCount: 26 }, 45: { verseCount: 17 },
      46: { verseCount: 11 }, 47: { verseCount: 9 }, 48: { verseCount: 14 }, 49: { verseCount: 20 }, 50: { verseCount: 23 },
      51: { verseCount: 19 }, 52: { verseCount: 9 }, 53: { verseCount: 6 }, 54: { verseCount: 7 }, 55: { verseCount: 23 },
      56: { verseCount: 13 }, 57: { verseCount: 11 }, 58: { verseCount: 11 }, 59: { verseCount: 17 }, 60: { verseCount: 12 },
      61: { verseCount: 8 }, 62: { verseCount: 12 }, 63: { verseCount: 11 }, 64: { verseCount: 10 }, 65: { verseCount: 13 },
      66: { verseCount: 20 }, 67: { verseCount: 7 }, 68: { verseCount: 35 }, 69: { verseCount: 36 }, 70: { verseCount: 5 },
      71: { verseCount: 24 }, 72: { verseCount: 20 }, 73: { verseCount: 28 }, 74: { verseCount: 23 }, 75: { verseCount: 10 },
      76: { verseCount: 12 }, 77: { verseCount: 20 }, 78: { verseCount: 72 }, 79: { verseCount: 13 }, 80: { verseCount: 19 },
      81: { verseCount: 16 }, 82: { verseCount: 8 }, 83: { verseCount: 18 }, 84: { verseCount: 12 }, 85: { verseCount: 13 },
      86: { verseCount: 17 }, 87: { verseCount: 7 }, 88: { verseCount: 18 }, 89: { verseCount: 52 }, 90: { verseCount: 17 },
      91: { verseCount: 16 }, 92: { verseCount: 15 }, 93: { verseCount: 5 }, 94: { verseCount: 23 }, 95: { verseCount: 11 },
      96: { verseCount: 13 }, 97: { verseCount: 12 }, 98: { verseCount: 9 }, 99: { verseCount: 9 }, 100: { verseCount: 5 },
      101: { verseCount: 8 }, 102: { verseCount: 28 }, 103: { verseCount: 22 }, 104: { verseCount: 35 }, 105: { verseCount: 45 },
      106: { verseCount: 48 }, 107: { verseCount: 43 }, 108: { verseCount: 13 }, 109: { verseCount: 31 }, 110: { verseCount: 7 },
      111: { verseCount: 10 }, 112: { verseCount: 10 }, 113: { verseCount: 9 }, 114: { verseCount: 8 }, 115: { verseCount: 18 },
      116: { verseCount: 19 }, 117: { verseCount: 2 }, 118: { verseCount: 176 }, 119: { verseCount: 176 }, 120: { verseCount: 7 },
      121: { verseCount: 8 }, 122: { verseCount: 9 }, 123: { verseCount: 4 }, 124: { verseCount: 8 }, 125: { verseCount: 5 },
      126: { verseCount: 6 }, 127: { verseCount: 5 }, 128: { verseCount: 6 }, 129: { verseCount: 8 }, 130: { verseCount: 8 },
      131: { verseCount: 3 }, 132: { verseCount: 18 }, 133: { verseCount: 3 }, 134: { verseCount: 3 }, 135: { verseCount: 21 },
      136: { verseCount: 26 }, 137: { verseCount: 9 }, 138: { verseCount: 8 }, 139: { verseCount: 24 }, 140: { verseCount: 13 },
      141: { verseCount: 10 }, 142: { verseCount: 7 }, 143: { verseCount: 12 }, 144: { verseCount: 15 }, 145: { verseCount: 21 },
      146: { verseCount: 10 }, 147: { verseCount: 20 }, 148: { verseCount: 14 }, 149: { verseCount: 9 }, 150: { verseCount: 6 }
    }
  },
  {
    id: 'proverbs',
    bookNumber: 20,
    orderInTestament: 20,
    orderInBible: 20,
    name: 'Proverbs',
    testament: 'Old',
    totalChapters: 31,
    totalVerses: 915,
    chapters: {
      1: { verseCount: 33 }, 2: { verseCount: 22 }, 3: { verseCount: 35 }, 4: { verseCount: 27 }, 5: { verseCount: 23 },
      6: { verseCount: 35 }, 7: { verseCount: 27 }, 8: { verseCount: 36 }, 9: { verseCount: 18 }, 10: { verseCount: 32 },
      11: { verseCount: 31 }, 12: { verseCount: 28 }, 13: { verseCount: 25 }, 14: { verseCount: 35 }, 15: { verseCount: 33 },
      16: { verseCount: 33 }, 17: { verseCount: 28 }, 18: { verseCount: 24 }, 19: { verseCount: 29 }, 20: { verseCount: 30 },
      21: { verseCount: 31 }, 22: { verseCount: 29 }, 23: { verseCount: 35 }, 24: { verseCount: 34 }, 25: { verseCount: 28 },
      26: { verseCount: 28 }, 27: { verseCount: 27 }, 28: { verseCount: 28 }, 29: { verseCount: 27 }, 30: { verseCount: 33 },
      31: { verseCount: 31 }
    }
  },
  {
    id: 'ecclesiastes',
    bookNumber: 21,
    orderInTestament: 21,
    orderInBible: 21,
    name: 'Ecclesiastes',
    testament: 'Old',
    totalChapters: 12,
    totalVerses: 222,
    chapters: {
      1: { verseCount: 18 }, 2: { verseCount: 26 }, 3: { verseCount: 22 }, 4: { verseCount: 16 }, 5: { verseCount: 20 },
      6: { verseCount: 12 }, 7: { verseCount: 29 }, 8: { verseCount: 17 }, 9: { verseCount: 18 }, 10: { verseCount: 20 },
      11: { verseCount: 10 }, 12: { verseCount: 14 }
    }
  },
  {
    id: 'songofsolomon',
    bookNumber: 22,
    orderInTestament: 22,
    orderInBible: 22,
    name: 'Song of Solomon',
    testament: 'Old',
    totalChapters: 8,
    totalVerses: 117,
    chapters: {
      1: { verseCount: 17 }, 2: { verseCount: 17 }, 3: { verseCount: 11 }, 4: { verseCount: 16 }, 5: { verseCount: 16 },
      6: { verseCount: 13 }, 7: { verseCount: 13 }, 8: { verseCount: 14 }
    }
  },
  {
    id: 'isaiah',
    bookNumber: 23,
    orderInTestament: 23,
    orderInBible: 23,
    name: 'Isaiah',
    testament: 'Old',
    totalChapters: 66,
    totalVerses: 1292,
    chapters: {
      1: { verseCount: 31 }, 2: { verseCount: 22 }, 3: { verseCount: 26 }, 4: { verseCount: 6 }, 5: { verseCount: 30 },
      6: { verseCount: 13 }, 7: { verseCount: 25 }, 8: { verseCount: 22 }, 9: { verseCount: 21 }, 10: { verseCount: 34 },
      11: { verseCount: 16 }, 12: { verseCount: 6 }, 13: { verseCount: 22 }, 14: { verseCount: 32 }, 15: { verseCount: 9 },
      16: { verseCount: 14 }, 17: { verseCount: 14 }, 18: { verseCount: 7 }, 19: { verseCount: 25 }, 20: { verseCount: 6 },
      21: { verseCount: 17 }, 22: { verseCount: 25 }, 23: { verseCount: 18 }, 24: { verseCount: 23 }, 25: { verseCount: 12 },
      26: { verseCount: 21 }, 27: { verseCount: 13 }, 28: { verseCount: 29 }, 29: { verseCount: 24 }, 30: { verseCount: 33 },
      31: { verseCount: 9 }, 32: { verseCount: 20 }, 33: { verseCount: 24 }, 34: { verseCount: 17 }, 35: { verseCount: 10 },
      36: { verseCount: 22 }, 37: { verseCount: 38 }, 38: { verseCount: 22 }, 39: { verseCount: 8 }, 40: { verseCount: 31 },
      41: { verseCount: 29 }, 42: { verseCount: 25 }, 43: { verseCount: 28 }, 44: { verseCount: 28 }, 45: { verseCount: 25 },
      46: { verseCount: 13 }, 47: { verseCount: 15 }, 48: { verseCount: 22 }, 49: { verseCount: 26 }, 50: { verseCount: 11 },
      51: { verseCount: 23 }, 52: { verseCount: 15 }, 53: { verseCount: 12 }, 54: { verseCount: 17 }, 55: { verseCount: 13 },
      56: { verseCount: 12 }, 57: { verseCount: 21 }, 58: { verseCount: 14 }, 59: { verseCount: 21 }, 60: { verseCount: 22 },
      61: { verseCount: 11 }, 62: { verseCount: 12 }, 63: { verseCount: 19 }, 64: { verseCount: 12 }, 65: { verseCount: 25 },
      66: { verseCount: 24 }
    }
  },
  {
    id: 'jeremiah',
    bookNumber: 24,
    orderInTestament: 24,
    orderInBible: 24,
    name: 'Jeremiah',
    testament: 'Old',
    totalChapters: 52,
    totalVerses: 1364,
    chapters: {
      1: { verseCount: 19 }, 2: { verseCount: 37 }, 3: { verseCount: 25 }, 4: { verseCount: 31 }, 5: { verseCount: 31 },
      6: { verseCount: 30 }, 7: { verseCount: 34 }, 8: { verseCount: 22 }, 9: { verseCount: 26 }, 10: { verseCount: 25 },
      11: { verseCount: 23 }, 12: { verseCount: 17 }, 13: { verseCount: 27 }, 14: { verseCount: 22 }, 15: { verseCount: 21 },
      16: { verseCount: 21 }, 17: { verseCount: 27 }, 18: { verseCount: 23 }, 19: { verseCount: 15 }, 20: { verseCount: 18 },
      21: { verseCount: 14 }, 22: { verseCount: 30 }, 23: { verseCount: 40 }, 24: { verseCount: 10 }, 25: { verseCount: 38 },
      26: { verseCount: 24 }, 27: { verseCount: 22 }, 28: { verseCount: 17 }, 29: { verseCount: 32 }, 30: { verseCount: 24 },
      31: { verseCount: 40 }, 32: { verseCount: 44 }, 33: { verseCount: 26 }, 34: { verseCount: 22 }, 35: { verseCount: 19 },
      36: { verseCount: 32 }, 37: { verseCount: 21 }, 38: { verseCount: 28 }, 39: { verseCount: 18 }, 40: { verseCount: 16 },
      41: { verseCount: 18 }, 42: { verseCount: 22 }, 43: { verseCount: 13 }, 44: { verseCount: 30 }, 45: { verseCount: 5 },
      46: { verseCount: 28 }, 47: { verseCount: 7 }, 48: { verseCount: 47 }, 49: { verseCount: 39 }, 50: { verseCount: 46 },
      51: { verseCount: 64 }, 52: { verseCount: 34 }
    }
  },
  {
    id: 'lamentations',
    bookNumber: 25,
    orderInTestament: 25,
    orderInBible: 25,
    name: 'Lamentations',
    testament: 'Old',
    totalChapters: 5,
    totalVerses: 154,
    chapters: {
      1: { verseCount: 22 }, 2: { verseCount: 22 }, 3: { verseCount: 66 }, 4: { verseCount: 22 }, 5: { verseCount: 22 }
    }
  },
  {
    id: 'ezekiel',
    bookNumber: 26,
    orderInTestament: 26,
    orderInBible: 26,
    name: 'Ezekiel',
    testament: 'Old',
    totalChapters: 48,
    totalVerses: 1273,
    chapters: {
      1: { verseCount: 28 }, 2: { verseCount: 10 }, 3: { verseCount: 27 }, 4: { verseCount: 17 }, 5: { verseCount: 17 },
      6: { verseCount: 14 }, 7: { verseCount: 27 }, 8: { verseCount: 18 }, 9: { verseCount: 11 }, 10: { verseCount: 22 },
      11: { verseCount: 25 }, 12: { verseCount: 28 }, 13: { verseCount: 23 }, 14: { verseCount: 23 }, 15: { verseCount: 8 },
      16: { verseCount: 63 }, 17: { verseCount: 24 }, 18: { verseCount: 32 }, 19: { verseCount: 14 }, 20: { verseCount: 49 },
      21: { verseCount: 32 }, 22: { verseCount: 31 }, 23: { verseCount: 49 }, 24: { verseCount: 27 }, 25: { verseCount: 17 },
      26: { verseCount: 21 }, 27: { verseCount: 36 }, 28: { verseCount: 26 }, 29: { verseCount: 21 }, 30: { verseCount: 26 },
      31: { verseCount: 18 }, 32: { verseCount: 32 }, 33: { verseCount: 33 }, 34: { verseCount: 31 }, 35: { verseCount: 15 },
      36: { verseCount: 38 }, 37: { verseCount: 28 }, 38: { verseCount: 23 }, 39: { verseCount: 29 }, 40: { verseCount: 49 },
      41: { verseCount: 26 }, 42: { verseCount: 20 }, 43: { verseCount: 27 }, 44: { verseCount: 31 }, 45: { verseCount: 25 },
      46: { verseCount: 24 }, 47: { verseCount: 23 }, 48: { verseCount: 35 }
    }
  },
  {
    id: 'daniel',
    bookNumber: 27,
    orderInTestament: 27,
    orderInBible: 27,
    name: 'Daniel',
    testament: 'Old',
    totalChapters: 12,
    totalVerses: 357,
    chapters: {
      1: { verseCount: 21 }, 2: { verseCount: 13 }, 3: { verseCount: 10 }, 4: { verseCount: 14 }, 5: { verseCount: 11 },
      6: { verseCount: 15 }, 7: { verseCount: 14 }, 8: { verseCount: 23 }, 9: { verseCount: 17 }, 10: { verseCount: 12 },
      11: { verseCount: 17 }, 12: { verseCount: 14 }, 13: { verseCount: 9 }, 14: { verseCount: 21 }
    }
  },
  {
    id: 'hosea',
    bookNumber: 28,
    orderInTestament: 28,
    orderInBible: 28,
    name: 'Hosea',
    testament: 'Old',
    totalChapters: 14,
    totalVerses: 197,
    chapters: {
      1: { verseCount: 11 }, 2: { verseCount: 23 }, 3: { verseCount: 5 }, 4: { verseCount: 19 }, 5: { verseCount: 15 },
      6: { verseCount: 11 }, 7: { verseCount: 16 }, 8: { verseCount: 14 }, 9: { verseCount: 17 }, 10: { verseCount: 15 },
      11: { verseCount: 12 }, 12: { verseCount: 14 }, 13: { verseCount: 16 }, 14: { verseCount: 9 }
    }
  },
  {
    id: 'joel',
    bookNumber: 29,
    orderInTestament: 29,
    orderInBible: 29,
    name: 'Joel',
    testament: 'Old',
    totalChapters: 3,
    totalVerses: 73,
    chapters: {
      1: { verseCount: 20 }, 2: { verseCount: 32 }, 3: { verseCount: 21 }
    }
  },
  {
    id: 'amos',
    bookNumber: 30,
    orderInTestament: 30,
    orderInBible: 30,
    name: 'Amos',
    testament: 'Old',
    totalChapters: 9,
    totalVerses: 146,
    chapters: {
      1: { verseCount: 15 }, 2: { verseCount: 16 }, 3: { verseCount: 15 }, 4: { verseCount: 13 }, 5: { verseCount: 27 },
      6: { verseCount: 14 }, 7: { verseCount: 17 }, 8: { verseCount: 14 }, 9: { verseCount: 15 }
    }
  },
  {
    id: 'obadiah',
    bookNumber: 31,
    orderInTestament: 31,
    orderInBible: 31,
    name: 'Obadiah',
    testament: 'Old',
    totalChapters: 1,
    totalVerses: 21,
    chapters: {
      1: { verseCount: 21 }
    }
  },
  {
    id: 'jonah',
    bookNumber: 32,
    orderInTestament: 32,
    orderInBible: 32,
    name: 'Jonah',
    testament: 'Old',
    totalChapters: 4,
    totalVerses: 48,
    chapters: {
      1: { verseCount: 17 }, 2: { verseCount: 10 }, 3: { verseCount: 10 }, 4: { verseCount: 11 }
    }
  },
  {
    id: 'micah',
    bookNumber: 33,
    orderInTestament: 33,
    orderInBible: 33,
    name: 'Micah',
    testament: 'Old',
    totalChapters: 7,
    totalVerses: 105,
    chapters: {
      1: { verseCount: 16 }, 2: { verseCount: 13 }, 3: { verseCount: 12 }, 4: { verseCount: 13 }, 5: { verseCount: 15 },
      6: { verseCount: 16 }, 7: { verseCount: 20 }
    }
  },
  {
    id: 'nahum',
    bookNumber: 34,
    orderInTestament: 34,
    orderInBible: 34,
    name: 'Nahum',
    testament: 'Old',
    totalChapters: 3,
    totalVerses: 47,
    chapters: {
      1: { verseCount: 15 }, 2: { verseCount: 13 }, 3: { verseCount: 19 }
    }
  },
  {
    id: 'habakkuk',
    bookNumber: 35,
    orderInTestament: 35,
    orderInBible: 35,
    name: 'Habakkuk',
    testament: 'Old',
    totalChapters: 3,
    totalVerses: 56,
    chapters: {
      1: { verseCount: 17 }, 2: { verseCount: 20 }, 3: { verseCount: 19 }
    }
  },
  {
    id: 'zephaniah',
    bookNumber: 36,
    orderInTestament: 36,
    orderInBible: 36,
    name: 'Zephaniah',
    testament: 'Old',
    totalChapters: 3,
    totalVerses: 53,
    chapters: {
      1: { verseCount: 18 }, 2: { verseCount: 15 }, 3: { verseCount: 20 }
    }
  },
  {
    id: 'haggai',
    bookNumber: 37,
    orderInTestament: 37,
    orderInBible: 37,
    name: 'Haggai',
    testament: 'Old',
    totalChapters: 2,
    totalVerses: 38,
    chapters: {
      1: { verseCount: 15 }, 2: { verseCount: 23 }
    }
  },
  {
    id: 'zechariah',
    bookNumber: 38,
    orderInTestament: 38,
    orderInBible: 38,
    name: 'Zechariah',
    testament: 'Old',
    totalChapters: 14,
    totalVerses: 211,
    chapters: {
      1: { verseCount: 21 }, 2:
      { verseCount: 49 }, 3: { verseCount: 30 }, 4: { verseCount: 37 }, 5: { verseCount: 31 },
          6: { verseCount: 28 }, 7: { verseCount: 28 }, 8: { verseCount: 27 }, 9: { verseCount: 27 }, 10: { verseCount: 21 },
          11: { verseCount: 45 }, 12: { verseCount: 13 }
    }
  },
  {
    id: 'malachi',
    bookNumber: 39,
    orderInTestament: 39,
    orderInBible: 39,
    name: 'Malachi',
    testament: 'Old',
    totalChapters: 4,
    totalVerses: 55,
    chapters: {
      1: { verseCount: 14 }, 2: { verseCount: 17 }, 3: { verseCount: 18 }, 4: { verseCount: 6 }
    }
  },
  // New Testament
  {
    id: 'matthew',
    bookNumber: 40,
    orderInTestament: 1,
    orderInBible: 40,
    name: 'Matthew',
    testament: 'New',
    totalChapters: 28,
    totalVerses: 1071,
    chapters: {
      1: { verseCount: 25 }, 2: { verseCount: 23 }, 3: { verseCount: 17 }, 4: { verseCount: 25 }, 5: { verseCount: 48 },
      6: { verseCount: 34 }, 7: { verseCount: 29 }, 8: { verseCount: 34 }, 9: { verseCount: 38 }, 10: { verseCount: 42 },
      11: { verseCount: 30 }, 12: { verseCount: 50 }, 13: { verseCount: 58 }, 14: { verseCount: 36 }, 15: { verseCount: 39 },
      16: { verseCount: 28 }, 17: { verseCount: 27 }, 18: { verseCount: 35 }, 19: { verseCount: 30 }, 20: { verseCount: 34 },
      21: { verseCount: 46 }, 22: { verseCount: 46 }, 23: { verseCount: 39 }, 24: { verseCount: 51 }, 25: { verseCount: 46 },
      26: { verseCount: 75 }, 27: { verseCount: 66 }, 28: { verseCount: 20 }
    }
  },
  {
    id: 'mark',
    bookNumber: 41,
    orderInTestament: 2,
    orderInBible: 41,
    name: 'Mark',
    testament: 'New',
    totalChapters: 16,
    totalVerses: 678,
    chapters: {
      1: { verseCount: 45 }, 2: { verseCount: 28 }, 3: { verseCount: 35 }, 4: { verseCount: 41 }, 5: { verseCount: 43 },
      6: { verseCount: 56 }, 7: { verseCount: 37 }, 8: { verseCount: 38 }, 9: { verseCount: 50 }, 10: { verseCount: 52 },
      11: { verseCount: 33 }, 12: { verseCount: 44 }, 13: { verseCount: 37 }, 14: { verseCount: 72 }, 15: { verseCount: 47 },
      16: { verseCount: 20 }
    }
  },
  {
    id: 'luke',
    bookNumber: 42,
    orderInTestament: 3,
    orderInBible: 42,
    name: 'Luke',
    testament: 'New',
    totalChapters: 24,
    totalVerses: 1151,
    chapters: {
      1: { verseCount: 80 }, 2: { verseCount: 52 }, 3: { verseCount: 38 }, 4: { verseCount: 44 }, 5: { verseCount: 39 },
      6: { verseCount: 49 }, 7: { verseCount: 50 }, 8: { verseCount: 56 }, 9: { verseCount: 62 }, 10: { verseCount: 42 },
      11: { verseCount: 54 }, 12: { verseCount: 59 }, 13: { verseCount: 35 }, 14: { verseCount: 35 }, 15: { verseCount: 32 },
      16: { verseCount: 31 }, 17: { verseCount: 37 }, 18: { verseCount: 43 }, 19: { verseCount: 48 }, 20: { verseCount: 47 },
      21: { verseCount: 38 }, 22: { verseCount: 71 }, 23: { verseCount: 56 }, 24: { verseCount: 53 }
    }
  },
  {
    id: 'john',
    bookNumber: 43,
    orderInTestament: 4,
    orderInBible: 43,
    name: 'John',
    testament: 'New',
    totalChapters: 21,
    totalVerses: 879,
    chapters: {
      1: { verseCount: 51 }, 2: { verseCount: 25 }, 3: { verseCount: 36 }, 4: { verseCount: 54 }, 5: { verseCount: 47 },
      6: { verseCount: 71 }, 7: { verseCount: 53 }, 8: { verseCount: 59 }, 9: { verseCount: 41 }, 10: { verseCount: 42 },
      11: { verseCount: 57 }, 12: { verseCount: 50 }, 13: { verseCount: 38 }, 14: { verseCount: 31 }, 15: { verseCount: 27 },
      16: { verseCount: 33 }, 17: { verseCount: 26 }, 18: { verseCount: 40 }, 19: { verseCount: 42 }, 20: { verseCount: 31 },
      21: { verseCount: 25 }
    }
  },
  {
    id: 'acts',
    bookNumber: 44,
    orderInTestament: 5,
    orderInBible: 44,
    name: 'Acts',
    testament: 'New',
    totalChapters: 28,
    totalVerses: 1007,
    chapters: {
      1: { verseCount: 26 }, 2: { verseCount: 47 }, 3: { verseCount: 26 }, 4: { verseCount: 37 }, 5: { verseCount: 42 },
      6: { verseCount: 15 }, 7: { verseCount: 60 }, 8: { verseCount: 40 }, 9: { verseCount: 43 }, 10: { verseCount: 48 },
      11: { verseCount: 30 }, 12: { verseCount: 25 }, 13: { verseCount: 52 }, 14: { verseCount: 28 }, 15: { verseCount: 41 },
      16: { verseCount: 40 }, 17: { verseCount: 34 }, 18: { verseCount: 28 }, 19: { verseCount: 41 }, 20: { verseCount: 38 },
      21: { verseCount: 40 }, 22: { verseCount: 30 }, 23: { verseCount: 35 }, 24: { verseCount: 27 }, 25: { verseCount: 27 },
      26: { verseCount: 32 }, 27: { verseCount: 44 }, 28: { verseCount: 31 }
    }
  },
  {
    id: 'romans',
    bookNumber: 45,
    orderInTestament: 6,
    orderInBible: 45,
    name: 'Romans',
    testament: 'New',
    totalChapters: 16,
    totalVerses: 433,
    chapters: {
      1: { verseCount: 32 }, 2: { verseCount: 29 }, 3: { verseCount: 31 }, 4: { verseCount: 25 }, 5: { verseCount: 21 },
      6: { verseCount: 23 }, 7: { verseCount: 25 }, 8: { verseCount: 39 }, 9: { verseCount: 33 }, 10: { verseCount: 21 },
      11: { verseCount: 36 }, 12: { verseCount: 21 }, 13: { verseCount: 14 }, 14: { verseCount: 23 }, 15: { verseCount: 33 },
      16: { verseCount: 27 }
    }
  },
  {
    id: '1corinthians',
    bookNumber: 46,
    orderInTestament: 7,
    orderInBible: 46,
    name: '1 Corinthians',
    testament: 'New',
    totalChapters: 16,
    totalVerses: 437,
    chapters: {
      1: { verseCount: 31 }, 2: { verseCount: 16 }, 3: { verseCount: 23 }, 4: { verseCount: 21 }, 5: { verseCount: 13 },
      6: { verseCount: 20 }, 7: { verseCount: 40 }, 8: { verseCount: 13 }, 9: { verseCount: 27 }, 10: { verseCount: 33 },
      11: { verseCount: 34 }, 12: { verseCount: 31 }, 13: { verseCount: 13 }, 14: { verseCount: 40 }, 15: { verseCount: 58 },
      16: { verseCount: 24 }
    }
  },
  {
    id: '2corinthians',
    bookNumber: 47,
    orderInTestament: 8,
    orderInBible: 47,
    name: '2 Corinthians',
    testament: 'New',
    totalChapters: 13,
    totalVerses: 257,
    chapters: {
      1: { verseCount: 24 }, 2: { verseCount: 17 }, 3: { verseCount: 18 }, 4: { verseCount: 18 }, 5: { verseCount: 21 },
      6: { verseCount: 18 }, 7: { verseCount: 16 }, 8: { verseCount: 24 }, 9: { verseCount: 15 }, 10: { verseCount: 18 },
      11: { verseCount: 33 }, 12: { verseCount: 21 }, 13: { verseCount: 14 }
    }
  },
  {
    id: 'galatians',
    bookNumber: 48,
    orderInTestament: 9,
    orderInBible: 48,
    name: 'Galatians',
    testament: 'New',
    totalChapters: 6,
    totalVerses: 149,
    chapters: {
      1: { verseCount: 24 }, 2: { verseCount: 21 }, 3: { verseCount: 29 }, 4: { verseCount: 31 }, 5: { verseCount: 26 },
      6: { verseCount: 18 }
    }
  },
  {
    id: 'ephesians',
    bookNumber: 49,
    orderInTestament: 10,
    orderInBible: 49,
    name: 'Ephesians',
    testament: 'New',
    totalChapters: 6,
    totalVerses: 155,
    chapters: {
      1: { verseCount: 23 }, 2: { verseCount: 22 }, 3: { verseCount: 21 }, 4: { verseCount: 32 }, 5: { verseCount: 33 },
      6: { verseCount: 24 }
    }
  },
  {
    id: 'philippians',
    bookNumber: 50,
    orderInTestament: 11,
    orderInBible: 50,
    name: 'Philippians',
    testament: 'New',
    totalChapters: 4,
    totalVerses: 104,
    chapters: {
      1: { verseCount: 30 }, 2: { verseCount: 30 }, 3: { verseCount: 21 }, 4: { verseCount: 23 }
    }
  },
  {
    id: 'colossians',
    bookNumber: 51,
    orderInTestament: 12,
    orderInBible: 51,
    name: 'Colossians',
    testament: 'New',
    totalChapters: 4,
    totalVerses: 95,
    chapters: {
      1: { verseCount: 29 }, 2: { verseCount: 23 }, 3: { verseCount: 25 }, 4: { verseCount: 18 }
    }
  },
  {
    id: '1thessalonians',
    bookNumber: 52,
    orderInTestament: 13,
    orderInBible: 52,
    name: '1 Thessalonians',
    testament: 'New',
    totalChapters: 5,
    totalVerses: 89,
    chapters: {
      1: { verseCount: 10 }, 2: { verseCount: 20 }, 3: { verseCount: 13 }, 4: { verseCount: 18 }, 5: { verseCount: 28 }
    }
  },
  {
    id: '2thessalonians',
    bookNumber: 53,
    orderInTestament: 14,
    orderInBible: 53,
    name: '2 Thessalonians',
    testament: 'New',
    totalChapters: 3,
    totalVerses: 47,
    chapters: {
      1: { verseCount: 12 }, 2: { verseCount: 17 }, 3: { verseCount: 18 }
    }
  },
  {
    id: '1timothy',
    bookNumber: 54,
    orderInTestament: 15,
    orderInBible: 54,
    name: '1 Timothy',
    testament: 'New',
    totalChapters: 6,
    totalVerses: 113,
    chapters: {
      1: { verseCount: 20 }, 2: { verseCount: 15 }, 3: { verseCount: 16 }, 4: { verseCount: 16 }, 5: { verseCount: 25 },
      6: { verseCount: 21 }
    }
  },
  {
    id: '2timothy',
    bookNumber: 55,
    orderInTestament: 16,
    orderInBible: 55,
    name: '2 Timothy',
    testament: 'New',
    totalChapters: 4,
    totalVerses: 83,
    chapters: {
      1: { verseCount: 18 }, 2: { verseCount: 26 }, 3: { verseCount: 17 }, 4: { verseCount: 22 }
    }
  },
  {
    id: 'titus',
    bookNumber: 56,
    orderInTestament: 17,
    orderInBible: 56,
    name: 'Titus',
    testament: 'New',
    totalChapters: 3,
    totalVerses: 46,
    chapters: {
      1: { verseCount: 16 }, 2: { verseCount: 15 }, 3: { verseCount: 15 }
    }
  },
  {
    id: 'philemon',
    bookNumber: 57,
    orderInTestament: 18,
    orderInBible: 57,
    name: 'Philemon',
    testament: 'New',
    totalChapters: 1,
    totalVerses: 25,
    chapters: {
      1: { verseCount: 25 }
    }
  },
  {
    id: 'hebrews',
    bookNumber: 58,
    orderInTestament: 19,
    orderInBible: 58,
    name: 'Hebrews',
    testament: 'New',
    totalChapters: 13,
    totalVerses: 303,
    chapters: {
      1: { verseCount: 14 }, 2: { verseCount: 18 }, 3: { verseCount: 19 }, 4: { verseCount: 16 }, 5: { verseCount: 14 },
      6: { verseCount: 20 }, 7: { verseCount: 28 }, 8: { verseCount: 13 }, 9: { verseCount: 28 }, 10: { verseCount: 39 },
      11: { verseCount: 40 }, 12: { verseCount: 29 }, 13: { verseCount: 25 }
    }
  },
  {
    id: 'james',
    bookNumber: 59,
    orderInTestament: 20,
    orderInBible: 59,
    name: 'James',
    testament: 'New',
    totalChapters: 5,
    totalVerses: 108,
    chapters: {
      1: { verseCount: 27 }, 2: { verseCount: 26 }, 3: { verseCount: 18 }, 4: { verseCount: 17 }, 5: { verseCount: 20 }
    }
  },
  {
    id: '1peter',
    bookNumber: 60,
    orderInTestament: 21,
    orderInBible: 60,
    name: '1 Peter',
    testament: 'New',
    totalChapters: 5,
    totalVerses: 105,
    chapters: {
      1: { verseCount: 25 }, 2: { verseCount: 25 }, 3: { verseCount: 22 }, 4: { verseCount: 19 }, 5: { verseCount: 14 }
    }
  },
  {
    id: '2peter',
    bookNumber: 61,
    orderInTestament: 22,
    orderInBible: 61,
    name: '2 Peter',
    testament: 'New',
    totalChapters: 3,
    totalVerses: 61,
    chapters: {
      1: { verseCount: 21 }, 2: { verseCount: 22 }, 3: { verseCount: 18 }
    }
  },
  {
    id: '1john',
    bookNumber: 62,
    orderInTestament: 23,
    orderInBible: 62,
    name: '1 John',
    testament: 'New',
    totalChapters: 5,
    totalVerses: 105,
    chapters: {
      1: { verseCount: 10 }, 2: { verseCount: 29 }, 3: { verseCount: 24 }, 4: { verseCount: 21 }, 5: { verseCount: 21 }
    }
  },
  {
    id: '2john',
    bookNumber: 63,
    orderInTestament: 24,
    orderInBible: 63,
    name: '2 John',
    testament: 'New',
    totalChapters: 1,
    totalVerses: 13,
    chapters: {
      1: { verseCount: 13 }
    }
  },
  {
    id: '3john',
    bookNumber: 64,
    orderInTestament: 25,
    orderInBible: 64,
    name: '3 John',
    testament: 'New',
    totalChapters: 1,
    totalVerses: 14,
    chapters: {
      1: { verseCount: 14 }
    }
  },
  {
    id: 'jude',
    bookNumber: 65,
    orderInTestament: 26,
    orderInBible: 65,
    name: 'Jude',
    testament: 'New',
    totalChapters: 1,
    totalVerses: 25,
    chapters: {
      1: { verseCount: 25 }
    }
  },
  {
    id: 'revelation',
    bookNumber: 66,
    orderInTestament: 27,
    orderInBible: 66,
    name: 'Revelation',
    testament: 'New',
    totalChapters: 22,
    totalVerses: 404,
    chapters: {
      1: { verseCount: 20 }, 2: { verseCount: 29 }, 3: { verseCount: 22 }, 4: { verseCount: 11 }, 5: { verseCount: 14 },
      6: { verseCount: 17 }, 7: { verseCount: 17 }, 8: { verseCount: 13 }, 9: { verseCount: 21 }, 10: { verseCount: 11 },
      11: { verseCount: 19 }, 12: { verseCount: 17 }, 13: { verseCount: 18 }, 14: { verseCount: 20 }, 15: { verseCount: 8 },
      16: { verseCount: 21 }, 17: { verseCount: 18 }, 18: { verseCount: 24 }, 19: { verseCount: 21 }, 20: { verseCount: 15 },
      21: { verseCount: 27 }, 22: { verseCount: 21 }
    }
  }
];

// Sample reading plans
const sampleReadingPlans = {
  'one-year-bible': {
    name: 'One Year Bible',
    description: 'Read through the entire Bible in 365 days',
    durationDays: 365,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'chronological-bible': {
    name: 'Chronological Bible',
    description: 'Read the Bible in chronological order in one year',
    durationDays: 365,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  '90-day-challenge': {
    name: '90 Day Bible Challenge',
    description: 'Read through the entire Bible in 90 days',
    durationDays: 90,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Sample daily readings for the One Year Bible plan (first 7 days)
const sampleDailyReadings = [
  {
    dayNumber: 1,
    portions: [
      {
        bookId: 'genesis',
        bookName: 'Genesis',
        startChapter: 1,
        startVerse: 1,
        endChapter: 2,
        endVerse: 25,
        portionOrder: 1
      },
      {
        bookId: 'matthew',
        bookName: 'Matthew',
        startChapter: 1,
        startVerse: 1,
        endChapter: 1,
        endVerse: 17,
        portionOrder: 2
      },
      {
        bookId: 'psalms',
        bookName: 'Psalms',
        startChapter: 1,
        startVerse: 1,
        endChapter: 1,
        endVerse: 6,
        portionOrder: 3
      },
      {
        bookId: 'proverbs',
        bookName: 'Proverbs',
        startChapter: 1,
        startVerse: 1,
        endChapter: 1,
        endVerse: 6,
        portionOrder: 4
      }
    ]
  },
  {
    dayNumber: 2,
    portions: [
      {
        bookId: 'genesis',
        bookName: 'Genesis',
        startChapter: 3,
        startVerse: 1,
        endChapter: 4,
        endVerse: 26,
        portionOrder: 1
      },
      {
        bookId: 'matthew',
        bookName: 'Matthew',
        startChapter: 1,
        startVerse: 18,
        endChapter: 2,
        endVerse: 12,
        portionOrder: 2
      },
      {
        bookId: 'psalms',
        bookName: 'Psalms',
        startChapter: 2,
        startVerse: 1,
        endChapter: 2,
        endVerse: 12,
        portionOrder: 3
      },
      {
        bookId: 'proverbs',
        bookName: 'Proverbs',
        startChapter: 1,
        startVerse: 7,
        endChapter: 1,
        endVerse: 9,
        portionOrder: 4
      }
    ]
  },
  {
    dayNumber: 3,
    portions: [
      {
        bookId: 'genesis',
        bookName: 'Genesis',
        startChapter: 5,
        startVerse: 1,
        endChapter: 6,
        endVerse: 22,
        portionOrder: 1
      },
      {
        bookId: 'matthew',
        bookName: 'Matthew',
        startChapter: 2,
        startVerse: 13,
        endChapter: 2,
        endVerse: 23,
        portionOrder: 2
      },
      {
        bookId: 'psalms',
        bookName: 'Psalms',
        startChapter: 3,
        startVerse: 1,
        endChapter: 3,
        endVerse: 8,
        portionOrder: 3
      },
      {
        bookId: 'proverbs',
        bookName: 'Proverbs',
        startChapter: 1,
        startVerse: 10,
        endChapter: 1,
        endVerse: 19,
        portionOrder: 4
      }
    ]
  },
  {
    dayNumber: 4,
    portions: [
      {
        bookId: 'genesis',
        bookName: 'Genesis',
        startChapter: 7,
        startVerse: 1,
        endChapter: 8,
        endVerse: 22,
        portionOrder: 1
      },
      {
        bookId: 'matthew',
        bookName: 'Matthew',
        startChapter: 3,
        startVerse: 1,
        endChapter: 3,
        endVerse: 17,
        portionOrder: 2
      },
      {
        bookId: 'psalms',
        bookName: 'Psalms',
        startChapter: 4,
        startVerse: 1,
        endChapter: 4,
        endVerse: 8,
        portionOrder: 3
      },
      {
        bookId: 'proverbs',
        bookName: 'Proverbs',
        startChapter: 1,
        startVerse: 20,
        endChapter: 1,
        endVerse: 23,
        portionOrder: 4
      }
    ]
  },
  {
    dayNumber: 5,
    portions: [
      {
        bookId: 'genesis',
        bookName: 'Genesis',
        startChapter: 9,
        startVerse: 1,
        endChapter: 10,
        endVerse: 32,
        portionOrder: 1
      },
      {
        bookId: 'matthew',
        bookName: 'Matthew',
        startChapter: 4,
        startVerse: 1,
        endChapter: 4,
        endVerse: 11,
        portionOrder: 2
      },
      {
        bookId: 'psalms',
        bookName: 'Psalms',
        startChapter: 5,
        startVerse: 1,
        endChapter: 5,
        endVerse: 12,
        portionOrder: 3
      },
      {
        bookId: 'proverbs',
        bookName: 'Proverbs',
        startChapter: 1,
        startVerse: 24,
        endChapter: 1,
        endVerse: 28,
        portionOrder: 4
      }
    ]
  },
  {
    dayNumber: 6,
    portions: [
      {
        bookId: 'genesis',
        bookName: 'Genesis',
        startChapter: 11,
        startVerse: 1,
        endChapter: 12,
        endVerse: 20,
        portionOrder: 1
      },
      {
        bookId: 'matthew',
        bookName: 'Matthew',
        startChapter: 4,
        startVerse: 12,
        endChapter: 4,
        endVerse: 25,
        portionOrder: 2
      },
      {
        bookId: 'psalms',
        bookName: 'Psalms',
        startChapter: 6,
        startVerse: 1,
        endChapter: 6,
        endVerse: 10,
        portionOrder: 3
      },
      {
        bookId: 'proverbs',
        bookName: 'Proverbs',
        startChapter: 1,
        startVerse: 29,
        endChapter: 1,
        endVerse: 33,
        portionOrder: 4
      }
    ]
  },
  {
    dayNumber: 7,
    portions: [
      {
        bookId: 'genesis',
        bookName: 'Genesis',
        startChapter: 13,
        startVerse: 1,
        endChapter: 14,
        endVerse: 24,
        portionOrder: 1
      },
      {
        bookId: 'matthew',
        bookName: 'Matthew',
        startChapter: 5,
        startVerse: 1,
        endChapter: 5,
        endVerse: 26,
        portionOrder: 2
      },
      {
        bookId: 'psalms',
        bookName: 'Psalms',
        startChapter: 7,
        startVerse: 1,
        endChapter: 7,
        endVerse: 17,
        portionOrder: 3
      },
      {
        bookId: 'proverbs',
        bookName: 'Proverbs',
        startChapter: 2,
        startVerse: 1,
        endChapter: 2,
        endVerse: 5,
        portionOrder: 4
      }
    ]
  }
];

/**
 * Initialize Firebase with Bible schema
 */
async function initializeBibleSchema() {
  try {
    console.log('Starting Bible schema initialization...');
    
    // 1. Create testaments collection
    console.log('\n1. Creating testaments collection...');
    const testamentsBatch = db.batch();
    
    Object.entries(testaments).forEach(([key, testament]) => {
      const testamentRef = db.collection('testaments').doc(key);
      testamentsBatch.set(testamentRef, testament);
    });
    
    await testamentsBatch.commit();
    console.log(`✓ Created ${Object.keys(testaments).length} testaments`);
    
    // 2. Create books collection with order information
    console.log('\n2. Creating books collection...');
    const booksBatch = db.batch();
    
    bibleBooks.forEach(book => {
      const bookRef = db.collection('books').doc(book.id);
      booksBatch.set(bookRef, {
        bookNumber: book.bookNumber,
        orderInTestament: book.orderInTestament,
        orderInBible: book.orderInBible,
        name: book.name,
        testament: book.testament,
        totalChapters: book.totalChapters,
        totalVerses: book.totalVerses,
        chapters: book.chapters
      });
    });
    
    await booksBatch.commit();
    console.log(`✓ Created ${bibleBooks.length} books`);
    
    // 3. Create book order collection for quick reference
    console.log('\n3. Creating book order reference...');
    const orderRef = db.collection('metadata').doc('bookOrder');
    await orderRef.set({
      oldTestament: bookOrder.oldTestament,
      newTestament: bookOrder.newTestament,
      all: bookOrder.all,
      updatedAt: new Date()
    });
    console.log('✓ Created book order reference');
    
    // 4. Create sample reading plans
    console.log('\n4. Creating sample reading plans...');
    const plansBatch = db.batch();
    
    Object.entries(sampleReadingPlans).forEach(([planId, planData]) => {
      const planRef = db.collection('readingPlans').doc(planId);
      plansBatch.set(planRef, planData);
    });
    
    await plansBatch.commit();
    console.log(`✓ Created ${Object.keys(sampleReadingPlans).length} reading plans`);
    
    // 5. Create daily readings for One Year Bible plan
    console.log('\n5. Creating daily readings for One Year Bible plan...');
    const readingsBatch = db.batch();
    
    sampleDailyReadings.forEach(dayData => {
      const dayId = `day-${String(dayData.dayNumber).padStart(3, '0')}`;
      const dayRef = db.collection('readingPlans')
        .doc('one-year-bible')
        .collection('dailyReadings')
        .doc(dayId);
      
      readingsBatch.set(dayRef, dayData);
    });
    
    await readingsBatch.commit();
    console.log(`✓ Created ${sampleDailyReadings.length} daily readings`);
    
    console.log('\n✅ Bible schema initialization complete!');
    
  } catch (error) {
    console.error('Error initializing Bible schema:', error);
    throw error;
  }
}

/**
 * Helper function to get books by testament
 * @param {string} testament - 'Old' or 'New'
 */
async function getBooksByTestament(testament) {
  try {
    const snapshot = await db
      .collection('books')
      .where('testament', '==', testament)
      .orderBy('orderInTestament')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting ${testament} Testament books:`, error);
    throw error;
  }
}

/**
 * Helper function to get the next book in reading order
 * @param {string} currentBookId - Current book ID
 */
async function getNextBook(currentBookId) {
  try {
    const currentBook = await db.collection('books').doc(currentBookId).get();
    if (!currentBook.exists) return null;
    
    const currentOrder = currentBook.data().orderInBible;
    if (currentOrder >= 66) return null; // Last book
    
    const nextBookQuery = await db
      .collection('books')
      .where('orderInBible', '==', currentOrder + 1)
      .limit(1)
      .get();
    
    if (nextBookQuery.empty) return null;
    
    return {
      id: nextBookQuery.docs[0].id,
      ...nextBookQuery.docs[0].data()
    };
  } catch (error) {
    console.error('Error getting next book:', error);
    throw error;
  }
}

/**
 * Helper function to create a complete reading plan
 * @param {string} planId - Unique identifier for the plan
 * @param {Object} planData - Plan metadata
 * @param {Array} dailyPortions - Array of daily reading portions
 */
async function createCompleteReadingPlan(planId, planData, dailyPortions) {
  try {
    const batch = db.batch();
    
    // Create the main plan document
    const planRef = db.collection('readingPlans').doc(planId);
    batch.set(planRef, {
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Create daily reading documents
    dailyPortions.forEach((portions, index) => {
      const dayNumber = index + 1;
      const dayId = `day-${String(dayNumber).padStart(3, '0')}`;
      const dayRef = planRef.collection('dailyReadings').doc(dayId);
      
      batch.set(dayRef, {
        dayNumber: dayNumber,
        portions: portions.map((portion, portionIndex) => ({
          ...portion,
          portionOrder: portionIndex + 1
        }))
      });
    });
    
    await batch.commit();
    console.log(`✓ Created reading plan: ${planData.name}`);
    
  } catch (error) {
    console.error(`Error creating reading plan ${planId}:`, error);
    throw error;
  }
}

/**
 * Helper function to get a book's information
 * @param {string} bookId - Book identifier
 */
async function getBookInfo(bookId) {
  try {
    const bookDoc = await db.collection('books').doc(bookId).get();
    
    if (!bookDoc.exists) {
      console.log(`Book ${bookId} not found`);
      return null;
    }
    
    return {
      id: bookDoc.id,
      ...bookDoc.data()
    };
  } catch (error) {
    console.error(`Error getting book ${bookId}:`, error);
    throw error;
  }
}

/**
 * Helper function to get daily reading for a specific day
 * @param {string} planId - Reading plan identifier
 * @param {number} dayNumber - Day number (1-365 for yearly plans)
 */
async function getDailyReading(planId, dayNumber) {
  try {
    const dayId = `day-${String(dayNumber).padStart(3, '0')}`;
    const dayDoc = await db
      .collection('readingPlans')
      .doc(planId)
      .collection('dailyReadings')
      .doc(dayId)
      .get();
    
    if (!dayDoc.exists) {
      console.log(`Day ${dayNumber} not found for plan ${planId}`);
      return null;
    }
    
    return dayDoc.data();
  } catch (error) {
    console.error(`Error getting daily reading:`, error);
    throw error;
  }
}

// Export functions for use in other modules
module.exports = {
  initializeBibleSchema,
  createCompleteReadingPlan,
  getBookInfo,
  getDailyReading,
  getBooksByTestament,
  getNextBook,
  bibleBooks,
  sampleReadingPlans,
  sampleDailyReadings,
  bookOrder,
  testaments
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeBibleSchema()
    .then(() => {
      console.log('\nInitialization completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\nInitialization failed:', error);
      process.exit(1);
    });
} 