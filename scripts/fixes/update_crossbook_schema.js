const fs = require('fs');

// Bible book mapping
const bookMapping = {
  'matthew': 'Matthew',
  'mark': 'Mark',
  'luke': 'Luke',
  'john': 'John',
  'acts': 'Acts',
  'romans': 'Romans',
  '1corinthians': '1 Corinthians',
  '2corinthians': '2 Corinthians',
  'galatians': 'Galatians',
  'ephesians': 'Ephesians',
  'philippians': 'Philippians',
  'colossians': 'Colossians',
  '1thessalonians': '1 Thessalonians',
  '2thessalonians': '2 Thessalonians',
  '1timothy': '1 Timothy',
  '2timothy': '2 Timothy',
  'titus': 'Titus',
  'philemon': 'Philemon',
  'hebrews': 'Hebrews',
  'james': 'James',
  '1peter': '1 Peter',
  '2peter': '2 Peter',
  '1john': '1 John',
  '2john': '2 John',
  '3john': '3 John',
  'jude': 'Jude',
  'revelation': 'Revelation'
};

// New Testament chapter counts
const chapterCounts = {
  'matthew': 28, 'mark': 16, 'luke': 24, 'john': 21, 'acts': 28,
  'romans': 16, '1corinthians': 16, '2corinthians': 13, 'galatians': 6,
  'ephesians': 6, 'philippians': 4, 'colossians': 4, '1thessalonians': 5,
  '2thessalonians': 3, '1timothy': 6, '2timothy': 4, 'titus': 3,
  'philemon': 1, 'hebrews': 13, 'james': 5, '1peter': 5, '2peter': 3,
  '1john': 5, '2john': 1, '3john': 1, 'jude': 1, 'revelation': 22
};

function updateCrossBookSchema() {
  console.log('Updating schema to support cross-book references...');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_validated.json', 'utf8'));
  
  // Cross-book transition mappings based on raw readings
  const crossBookTransitions = [
    // Day 98: John 21:19-25, then Acts 1:1-8
    {
      dayNumber: 98,
      startBook: { id: 'john', name: 'John', chapter: 21, verse: 19 },
      endBook: { id: 'acts', name: 'Acts', chapter: 1, verse: 8 },
      portions: [
        {
          bookName: 'John',
          bookId: 'john',
          startChapter: 21,
          startVerse: 19,
          endChapter: 21,
          endVerse: 25,
          portionOrder: 1
        },
        {
          bookName: 'Acts',
          bookId: 'acts',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 8,
          portionOrder: 2
        }
      ]
    },
    // Day 124: Acts 28:11-31, then Romans 1:1-2
    {
      dayNumber: 124,
      startBook: { id: 'acts', name: 'Acts', chapter: 28, verse: 11 },
      endBook: { id: 'romans', name: 'Romans', chapter: 1, verse: 2 },
      portions: [
        {
          bookName: 'Acts',
          bookId: 'acts',
          startChapter: 28,
          startVerse: 11,
          endChapter: 28,
          endVerse: 31,
          portionOrder: 1
        },
        {
          bookName: 'Romans',
          bookId: 'romans',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 2,
          portionOrder: 2
        }
      ]
    },
    // Day 162: 1 Cor 15:50 - 16:24, then 2 Cor 1:1-14
    {
      dayNumber: 162,
      startBook: { id: '1corinthians', name: '1 Corinthians', chapter: 15, verse: 50 },
      endBook: { id: '2corinthians', name: '2 Corinthians', chapter: 1, verse: 14 },
      portions: [
        {
          bookName: '1 Corinthians',
          bookId: '1corinthians',
          startChapter: 15,
          startVerse: 50,
          endChapter: 16,
          endVerse: 24,
          portionOrder: 1
        },
        {
          bookName: '2 Corinthians',
          bookId: '2corinthians',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 14,
          portionOrder: 2
        }
      ]
    },
    // Day 183: Gal 6:18 - Eph 1:6
    {
      dayNumber: 183,
      startBook: { id: 'galatians', name: 'Galatians', chapter: 6, verse: 18 },
      endBook: { id: 'ephesians', name: 'Ephesians', chapter: 1, verse: 6 },
      portions: [
        {
          bookName: 'Galatians',
          bookId: 'galatians',
          startChapter: 6,
          startVerse: 18,
          endChapter: 6,
          endVerse: 18,
          portionOrder: 1
        },
        {
          bookName: 'Ephesians',
          bookId: 'ephesians',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 6,
          portionOrder: 2
        }
      ]
    },
    // Day 196: Eph 6:21-24, then Phil 1:1-18
    {
      dayNumber: 196,
      startBook: { id: 'ephesians', name: 'Ephesians', chapter: 6, verse: 21 },
      endBook: { id: 'philippians', name: 'Philippians', chapter: 1, verse: 18 },
      portions: [
        {
          bookName: 'Ephesians',
          bookId: 'ephesians',
          startChapter: 6,
          startVerse: 21,
          endChapter: 6,
          endVerse: 24,
          portionOrder: 1
        },
        {
          bookName: 'Philippians',
          bookId: 'philippians',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 18,
          portionOrder: 2
        }
      ]
    },
    // Day 218: 1 Tim 6:21, then 2 Tim 1:1-14
    {
      dayNumber: 218,
      startBook: { id: '1timothy', name: '1 Timothy', chapter: 6, verse: 21 },
      endBook: { id: '2timothy', name: '2 Timothy', chapter: 1, verse: 14 },
      portions: [
        {
          bookName: '1 Timothy',
          bookId: '1timothy',
          startChapter: 6,
          startVerse: 21,
          endChapter: 6,
          endVerse: 21,
          portionOrder: 1
        },
        {
          bookName: '2 Timothy',
          bookId: '2timothy',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 14,
          portionOrder: 2
        }
      ]
    },
    // Day 221: 2 Tim 4:9-22, then Titus 1:1-4
    {
      dayNumber: 221,
      startBook: { id: '2timothy', name: '2 Timothy', chapter: 4, verse: 9 },
      endBook: { id: 'titus', name: 'Titus', chapter: 1, verse: 4 },
      portions: [
        {
          bookName: '2 Timothy',
          bookId: '2timothy',
          startChapter: 4,
          startVerse: 9,
          endChapter: 4,
          endVerse: 22,
          portionOrder: 1
        },
        {
          bookName: 'Titus',
          bookId: 'titus',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 4,
          portionOrder: 2
        }
      ]
    },
    // Day 224: Titus 3:9-15, then Philemon 1:1-3
    {
      dayNumber: 224,
      startBook: { id: 'titus', name: 'Titus', chapter: 3, verse: 9 },
      endBook: { id: 'philemon', name: 'Philemon', chapter: 1, verse: 3 },
      portions: [
        {
          bookName: 'Titus',
          bookId: 'titus',
          startChapter: 3,
          startVerse: 9,
          endChapter: 3,
          endVerse: 15,
          portionOrder: 1
        },
        {
          bookName: 'Philemon',
          bookId: 'philemon',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 3,
          portionOrder: 2
        }
      ]
    },
    // Day 225: Philemon 1:4-25, then Hebrews 1:1-2
    {
      dayNumber: 225,
      startBook: { id: 'philemon', name: 'Philemon', chapter: 1, verse: 4 },
      endBook: { id: 'hebrews', name: 'Hebrews', chapter: 1, verse: 2 },
      portions: [
        {
          bookName: 'Philemon',
          bookId: 'philemon',
          startChapter: 1,
          startVerse: 4,
          endChapter: 1,
          endVerse: 25,
          portionOrder: 1
        },
        {
          bookName: 'Hebrews',
          bookId: 'hebrews',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 2,
          portionOrder: 2
        }
      ]
    },
    // Day 241: Heb 13:13-25, then James 1:1
    {
      dayNumber: 241,
      startBook: { id: 'hebrews', name: 'Hebrews', chapter: 13, verse: 13 },
      endBook: { id: 'james', name: 'James', chapter: 1, verse: 1 },
      portions: [
        {
          bookName: 'Hebrews',
          bookId: 'hebrews',
          startChapter: 13,
          startVerse: 13,
          endChapter: 13,
          endVerse: 25,
          portionOrder: 1
        },
        {
          bookName: 'James',
          bookId: 'james',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 1,
          portionOrder: 2
        }
      ]
    },
    // Day 270: 1 John 5:7-21, then 2 John 1:1-9
    {
      dayNumber: 270,
      startBook: { id: '1john', name: '1 John', chapter: 5, verse: 7 },
      endBook: { id: '2john', name: '2 John', chapter: 1, verse: 9 },
      portions: [
        {
          bookName: '1 John',
          bookId: '1john',
          startChapter: 5,
          startVerse: 7,
          endChapter: 5,
          endVerse: 21,
          portionOrder: 1
        },
        {
          bookName: '2 John',
          bookId: '2john',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 9,
          portionOrder: 2
        }
      ]
    },
    // Day 271: 2 John 1:10-13, then 3 John 1:1-8
    {
      dayNumber: 271,
      startBook: { id: '2john', name: '2 John', chapter: 1, verse: 10 },
      endBook: { id: '3john', name: '3 John', chapter: 1, verse: 8 },
      portions: [
        {
          bookName: '2 John',
          bookId: '2john',
          startChapter: 1,
          startVerse: 10,
          endChapter: 1,
          endVerse: 13,
          portionOrder: 1
        },
        {
          bookName: '3 John',
          bookId: '3john',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 8,
          portionOrder: 2
        }
      ]
    },
    // Day 272: 3 John 1:9-14, then Jude 1:1-12
    {
      dayNumber: 272,
      startBook: { id: '3john', name: '3 John', chapter: 1, verse: 9 },
      endBook: { id: 'jude', name: 'Jude', chapter: 1, verse: 12 },
      portions: [
        {
          bookName: '3 John',
          bookId: '3john',
          startChapter: 1,
          startVerse: 9,
          endChapter: 1,
          endVerse: 14,
          portionOrder: 1
        },
        {
          bookName: 'Jude',
          bookId: 'jude',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 12,
          portionOrder: 2
        }
      ]
    },
    // Day 273: Jude 1:13-25, then Rev 1:1-8
    {
      dayNumber: 273,
      startBook: { id: 'jude', name: 'Jude', chapter: 1, verse: 13 },
      endBook: { id: 'revelation', name: 'Revelation', chapter: 1, verse: 8 },
      portions: [
        {
          bookName: 'Jude',
          bookId: 'jude',
          startChapter: 1,
          startVerse: 13,
          endChapter: 1,
          endVerse: 25,
          portionOrder: 1
        },
        {
          bookName: 'Revelation',
          bookId: 'revelation',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 8,
          portionOrder: 2
        }
      ]
    },
    // Day 202: Phil 4:10 - Col 1:8
    {
      dayNumber: 202,
      startBook: { id: 'philippians', name: 'Philippians', chapter: 4, verse: 10 },
      endBook: { id: 'colossians', name: 'Colossians', chapter: 1, verse: 8 },
      portions: [
        {
          bookName: 'Philippians',
          bookId: 'philippians',
          startChapter: 4,
          startVerse: 10,
          endChapter: 4,
          endVerse: 23,
          portionOrder: 1
        },
        {
          bookName: 'Colossians',
          bookId: 'colossians',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 8,
          portionOrder: 2
        }
      ]
    },
    // Day 207: Col 4:7 - 1 Thes 1:10
    {
      dayNumber: 207,
      startBook: { id: 'colossians', name: 'Colossians', chapter: 4, verse: 7 },
      endBook: { id: '1thessalonians', name: '1 Thessalonians', chapter: 1, verse: 10 },
      portions: [
        {
          bookName: 'Colossians',
          bookId: 'colossians',
          startChapter: 4,
          startVerse: 7,
          endChapter: 4,
          endVerse: 18,
          portionOrder: 1
        },
        {
          bookName: '1 Thessalonians',
          bookId: '1thessalonians',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 10,
          portionOrder: 2
        }
      ]
    },
    // Day 210: 1 Thes 5:12 - 2 Thes 1:2
    {
      dayNumber: 210,
      startBook: { id: '1thessalonians', name: '1 Thessalonians', chapter: 5, verse: 12 },
      endBook: { id: '2thessalonians', name: '2 Thessalonians', chapter: 1, verse: 2 },
      portions: [
        {
          bookName: '1 Thessalonians',
          bookId: '1thessalonians',
          startChapter: 5,
          startVerse: 12,
          endChapter: 5,
          endVerse: 28,
          portionOrder: 1
        },
        {
          bookName: '2 Thessalonians',
          bookId: '2thessalonians',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 2,
          portionOrder: 2
        }
      ]
    },
    // Day 212: 2 Thes 3:1 - 1 Tim 1:4
    {
      dayNumber: 212,
      startBook: { id: '2thessalonians', name: '2 Thessalonians', chapter: 3, verse: 1 },
      endBook: { id: '1timothy', name: '1 Timothy', chapter: 1, verse: 4 },
      portions: [
        {
          bookName: '2 Thessalonians',
          bookId: '2thessalonians',
          startChapter: 3,
          startVerse: 1,
          endChapter: 3,
          endVerse: 18,
          portionOrder: 1
        },
        {
          bookName: '1 Timothy',
          bookId: '1timothy',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 4,
          portionOrder: 2
        }
      ]
    },
    // Day 245: James 4:1 - 5:20, then 1 Pet 1:1-3
    {
      dayNumber: 245,
      startBook: { id: 'james', name: 'James', chapter: 4, verse: 1 },
      endBook: { id: '1peter', name: '1 Peter', chapter: 1, verse: 3 },
      portions: [
        {
          bookName: 'James',
          bookId: 'james',
          startChapter: 4,
          startVerse: 1,
          endChapter: 5,
          endVerse: 20,
          portionOrder: 1
        },
        {
          bookName: '1 Peter',
          bookId: '1peter',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 3,
          portionOrder: 2
        }
      ]
    },
    // Day 254 is no longer a cross-book day - just 1 Peter 5:4-14
    // Day 261: 2 Pet 3:17-18, then 1 John 1:1-6 
    {
      dayNumber: 261,
      startBook: { id: '2peter', name: '2 Peter', chapter: 3, verse: 17 },
      endBook: { id: '1john', name: '1 John', chapter: 1, verse: 6 },
      portions: [
        {
          bookName: '2 Peter',
          bookId: '2peter',
          startChapter: 3,
          startVerse: 17,
          endChapter: 3,
          endVerse: 18,
          portionOrder: 1
        },
        {
          bookName: '1 John',
          bookId: '1john',
          startChapter: 1,
          startVerse: 1,
          endChapter: 1,
          endVerse: 6,
          portionOrder: 2
        }
      ]
    }
  ];
  
  // Update the data with cross-book references
  let updatedCount = 0;
  
  data.forEach(day => {
    const crossBook = crossBookTransitions.find(cb => cb.dayNumber === day.dayNumber);
    
    if (crossBook) {
      // Update with new schema that includes start/end book information
      day.startBookName = crossBook.startBook.name;
      day.startBookId = crossBook.startBook.id;
      day.endBookName = crossBook.endBook.name;
      day.endBookId = crossBook.endBook.id;
      
      // Update portions to be multiple portions for cross-book days
      day.portions = crossBook.portions;
      
      console.log(`Updated Day ${day.dayNumber}: ${crossBook.startBook.name} ${crossBook.startBook.chapter}:${crossBook.startBook.verse} → ${crossBook.endBook.name} ${crossBook.endBook.chapter}:${crossBook.endBook.verse}`);
      updatedCount++;
    } else {
      // For single-book days, set start/end to the same book
      const portion = day.portions[0];
      if (portion) {
        day.startBookName = portion.bookName;
        day.startBookId = portion.bookId;
        day.endBookName = portion.bookName;
        day.endBookId = portion.bookId;
      }
    }
  });
  
  // Save the updated data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  
  console.log(`\n✅ Updated ${updatedCount} cross-book transition days`);
  console.log(`✅ Added start/end book fields to all ${data.length} daily readings`);
  console.log('✅ Saved updated data to nt_reading_schedule_crossbook.json');
  
  return data;
}

if (require.main === module) {
  updateCrossBookSchema();
}

module.exports = { updateCrossBookSchema };