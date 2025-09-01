const fs = require('fs');

// Bible verse count data
const bibleBooks = {
  'matthew': {
    name: 'Matthew',
    chapters: {
      1: { verseCount: 25 }, 2: { verseCount: 23 }, 3: { verseCount: 17 }, 4: { verseCount: 25 }, 5: { verseCount: 48 },
      6: { verseCount: 34 }, 7: { verseCount: 29 }, 8: { verseCount: 34 }, 9: { verseCount: 38 }, 10: { verseCount: 42 },
      11: { verseCount: 30 }, 12: { verseCount: 50 }, 13: { verseCount: 58 }, 14: { verseCount: 36 }, 15: { verseCount: 39 },
      16: { verseCount: 28 }, 17: { verseCount: 27 }, 18: { verseCount: 35 }, 19: { verseCount: 30 }, 20: { verseCount: 34 },
      21: { verseCount: 46 }, 22: { verseCount: 46 }, 23: { verseCount: 39 }, 24: { verseCount: 51 }, 25: { verseCount: 46 },
      26: { verseCount: 75 }, 27: { verseCount: 66 }, 28: { verseCount: 20 }
    }
  },
  'mark': {
    name: 'Mark',
    chapters: {
      1: { verseCount: 45 }, 2: { verseCount: 28 }, 3: { verseCount: 35 }, 4: { verseCount: 41 }, 5: { verseCount: 43 },
      6: { verseCount: 56 }, 7: { verseCount: 37 }, 8: { verseCount: 38 }, 9: { verseCount: 50 }, 10: { verseCount: 52 },
      11: { verseCount: 33 }, 12: { verseCount: 44 }, 13: { verseCount: 37 }, 14: { verseCount: 72 }, 15: { verseCount: 47 },
      16: { verseCount: 20 }
    }
  },
  'luke': {
    name: 'Luke',
    chapters: {
      1: { verseCount: 80 }, 2: { verseCount: 52 }, 3: { verseCount: 38 }, 4: { verseCount: 44 }, 5: { verseCount: 39 },
      6: { verseCount: 49 }, 7: { verseCount: 50 }, 8: { verseCount: 56 }, 9: { verseCount: 62 }, 10: { verseCount: 42 },
      11: { verseCount: 54 }, 12: { verseCount: 59 }, 13: { verseCount: 35 }, 14: { verseCount: 35 }, 15: { verseCount: 32 },
      16: { verseCount: 31 }, 17: { verseCount: 37 }, 18: { verseCount: 43 }, 19: { verseCount: 48 }, 20: { verseCount: 47 },
      21: { verseCount: 38 }, 22: { verseCount: 71 }, 23: { verseCount: 56 }, 24: { verseCount: 53 }
    }
  },
  'john': {
    name: 'John',
    chapters: {
      1: { verseCount: 51 }, 2: { verseCount: 25 }, 3: { verseCount: 36 }, 4: { verseCount: 54 }, 5: { verseCount: 47 },
      6: { verseCount: 71 }, 7: { verseCount: 53 }, 8: { verseCount: 59 }, 9: { verseCount: 41 }, 10: { verseCount: 42 },
      11: { verseCount: 57 }, 12: { verseCount: 50 }, 13: { verseCount: 38 }, 14: { verseCount: 31 }, 15: { verseCount: 27 },
      16: { verseCount: 33 }, 17: { verseCount: 26 }, 18: { verseCount: 40 }, 19: { verseCount: 42 }, 20: { verseCount: 31 },
      21: { verseCount: 25 }
    }
  },
  'acts': {
    name: 'Acts',
    chapters: {
      1: { verseCount: 26 }, 2: { verseCount: 47 }, 3: { verseCount: 26 }, 4: { verseCount: 37 }, 5: { verseCount: 42 },
      6: { verseCount: 15 }, 7: { verseCount: 60 }, 8: { verseCount: 40 }, 9: { verseCount: 43 }, 10: { verseCount: 48 },
      11: { verseCount: 30 }, 12: { verseCount: 25 }, 13: { verseCount: 52 }, 14: { verseCount: 28 }, 15: { verseCount: 41 },
      16: { verseCount: 40 }, 17: { verseCount: 34 }, 18: { verseCount: 28 }, 19: { verseCount: 41 }, 20: { verseCount: 38 },
      21: { verseCount: 40 }, 22: { verseCount: 30 }, 23: { verseCount: 35 }, 24: { verseCount: 27 }, 25: { verseCount: 27 },
      26: { verseCount: 32 }, 27: { verseCount: 44 }, 28: { verseCount: 31 }
    }
  },
  'romans': {
    name: 'Romans',
    chapters: {
      1: { verseCount: 32 }, 2: { verseCount: 29 }, 3: { verseCount: 31 }, 4: { verseCount: 25 }, 5: { verseCount: 21 },
      6: { verseCount: 23 }, 7: { verseCount: 25 }, 8: { verseCount: 39 }, 9: { verseCount: 33 }, 10: { verseCount: 21 },
      11: { verseCount: 36 }, 12: { verseCount: 21 }, 13: { verseCount: 14 }, 14: { verseCount: 23 }, 15: { verseCount: 33 },
      16: { verseCount: 27 }
    }
  },
  '1corinthians': {
    name: '1 Corinthians',
    chapters: {
      1: { verseCount: 31 }, 2: { verseCount: 16 }, 3: { verseCount: 23 }, 4: { verseCount: 21 }, 5: { verseCount: 13 },
      6: { verseCount: 20 }, 7: { verseCount: 40 }, 8: { verseCount: 13 }, 9: { verseCount: 27 }, 10: { verseCount: 33 },
      11: { verseCount: 34 }, 12: { verseCount: 31 }, 13: { verseCount: 13 }, 14: { verseCount: 40 }, 15: { verseCount: 58 },
      16: { verseCount: 24 }
    }
  },
  '2corinthians': {
    name: '2 Corinthians',
    chapters: {
      1: { verseCount: 24 }, 2: { verseCount: 17 }, 3: { verseCount: 18 }, 4: { verseCount: 18 }, 5: { verseCount: 21 },
      6: { verseCount: 18 }, 7: { verseCount: 16 }, 8: { verseCount: 24 }, 9: { verseCount: 15 }, 10: { verseCount: 18 },
      11: { verseCount: 33 }, 12: { verseCount: 21 }, 13: { verseCount: 14 }
    }
  },
  'galatians': {
    name: 'Galatians',
    chapters: {
      1: { verseCount: 24 }, 2: { verseCount: 21 }, 3: { verseCount: 29 }, 4: { verseCount: 31 }, 5: { verseCount: 26 },
      6: { verseCount: 18 }
    }
  },
  'ephesians': {
    name: 'Ephesians',
    chapters: {
      1: { verseCount: 23 }, 2: { verseCount: 22 }, 3: { verseCount: 21 }, 4: { verseCount: 32 }, 5: { verseCount: 33 },
      6: { verseCount: 24 }
    }
  },
  'philippians': {
    name: 'Philippians',
    chapters: {
      1: { verseCount: 30 }, 2: { verseCount: 30 }, 3: { verseCount: 21 }, 4: { verseCount: 23 }
    }
  },
  'colossians': {
    name: 'Colossians',
    chapters: {
      1: { verseCount: 29 }, 2: { verseCount: 23 }, 3: { verseCount: 25 }, 4: { verseCount: 18 }
    }
  },
  '1thessalonians': {
    name: '1 Thessalonians',
    chapters: {
      1: { verseCount: 10 }, 2: { verseCount: 20 }, 3: { verseCount: 13 }, 4: { verseCount: 18 }, 5: { verseCount: 28 }
    }
  },
  '2thessalonians': {
    name: '2 Thessalonians',
    chapters: {
      1: { verseCount: 12 }, 2: { verseCount: 17 }, 3: { verseCount: 18 }
    }
  },
  '1timothy': {
    name: '1 Timothy',
    chapters: {
      1: { verseCount: 20 }, 2: { verseCount: 15 }, 3: { verseCount: 16 }, 4: { verseCount: 16 }, 5: { verseCount: 25 },
      6: { verseCount: 21 }
    }
  },
  '2timothy': {
    name: '2 Timothy',
    chapters: {
      1: { verseCount: 18 }, 2: { verseCount: 26 }, 3: { verseCount: 17 }, 4: { verseCount: 22 }
    }
  },
  'titus': {
    name: 'Titus',
    chapters: {
      1: { verseCount: 16 }, 2: { verseCount: 15 }, 3: { verseCount: 15 }
    }
  },
  'philemon': {
    name: 'Philemon',
    chapters: {
      1: { verseCount: 25 }
    }
  },
  'hebrews': {
    name: 'Hebrews',
    chapters: {
      1: { verseCount: 14 }, 2: { verseCount: 18 }, 3: { verseCount: 19 }, 4: { verseCount: 16 }, 5: { verseCount: 14 },
      6: { verseCount: 20 }, 7: { verseCount: 28 }, 8: { verseCount: 13 }, 9: { verseCount: 28 }, 10: { verseCount: 39 },
      11: { verseCount: 40 }, 12: { verseCount: 29 }, 13: { verseCount: 25 }
    }
  },
  'james': {
    name: 'James',
    chapters: {
      1: { verseCount: 27 }, 2: { verseCount: 26 }, 3: { verseCount: 18 }, 4: { verseCount: 17 }, 5: { verseCount: 20 }
    }
  },
  '1peter': {
    name: '1 Peter',
    chapters: {
      1: { verseCount: 25 }, 2: { verseCount: 25 }, 3: { verseCount: 22 }, 4: { verseCount: 19 }, 5: { verseCount: 14 }
    }
  },
  '2peter': {
    name: '2 Peter',
    chapters: {
      1: { verseCount: 21 }, 2: { verseCount: 22 }, 3: { verseCount: 18 }
    }
  },
  '1john': {
    name: '1 John',
    chapters: {
      1: { verseCount: 10 }, 2: { verseCount: 29 }, 3: { verseCount: 24 }, 4: { verseCount: 21 }, 5: { verseCount: 21 }
    }
  },
  '2john': {
    name: '2 John',
    chapters: {
      1: { verseCount: 13 }
    }
  },
  '3john': {
    name: '3 John',
    chapters: {
      1: { verseCount: 14 }
    }
  },
  'jude': {
    name: 'Jude',
    chapters: {
      1: { verseCount: 25 }
    }
  },
  'revelation': {
    name: 'Revelation',
    chapters: {
      1: { verseCount: 20 }, 2: { verseCount: 29 }, 3: { verseCount: 22 }, 4: { verseCount: 11 }, 5: { verseCount: 14 },
      6: { verseCount: 17 }, 7: { verseCount: 17 }, 8: { verseCount: 13 }, 9: { verseCount: 21 }, 10: { verseCount: 11 },
      11: { verseCount: 19 }, 12: { verseCount: 17 }, 13: { verseCount: 18 }, 14: { verseCount: 20 }, 15: { verseCount: 8 },
      16: { verseCount: 21 }, 17: { verseCount: 18 }, 18: { verseCount: 24 }, 19: { verseCount: 21 }, 20: { verseCount: 15 },
      21: { verseCount: 27 }, 22: { verseCount: 21 }
    }
  }
};

function validateReadingSchedule() {
  // Read the NT reading schedule
  const scheduleData = JSON.parse(fs.readFileSync('nt_complete_schedule_fixed.json', 'utf8'));
  
  const errors = [];
  const warnings = [];
  let validCount = 0;
  
  console.log(`Validating ${scheduleData.length} daily readings...\n`);
  
  scheduleData.forEach((day, index) => {
    const dayNum = day.dayNumber;
    const date = day.date;
    
    if (!day.portions || day.portions.length === 0) {
      warnings.push(`Day ${dayNum} (${date}): No portions found`);
      return;
    }
    
    day.portions.forEach((portion, portionIdx) => {
      const bookId = portion.bookId.toLowerCase();
      const bookData = bibleBooks[bookId];
      
      if (!bookData) {
        errors.push(`Day ${dayNum} (${date}): Unknown book '${portion.bookName}' (id: ${bookId})`);
        return;
      }
      
      // Check start chapter
      if (!bookData.chapters[portion.startChapter]) {
        errors.push(`Day ${dayNum} (${date}): ${portion.bookName} does not have chapter ${portion.startChapter} (max: ${Object.keys(bookData.chapters).length})`);
        return;
      }
      
      // Check end chapter
      if (!bookData.chapters[portion.endChapter]) {
        errors.push(`Day ${dayNum} (${date}): ${portion.bookName} does not have chapter ${portion.endChapter} (max: ${Object.keys(bookData.chapters).length})`);
        return;
      }
      
      // Check start verse
      const startChapterVerses = bookData.chapters[portion.startChapter].verseCount;
      if (portion.startVerse > startChapterVerses) {
        errors.push(`Day ${dayNum} (${date}): ${portion.bookName} ${portion.startChapter}:${portion.startVerse} - verse ${portion.startVerse} exceeds chapter ${portion.startChapter} verse count (${startChapterVerses})`);
      }
      
      // Check end verse (if not 999 which means "end of chapter")
      if (portion.endVerse !== 999) {
        const endChapterVerses = bookData.chapters[portion.endChapter].verseCount;
        if (portion.endVerse > endChapterVerses) {
          errors.push(`Day ${dayNum} (${date}): ${portion.bookName} ${portion.endChapter}:${portion.endVerse} - verse ${portion.endVerse} exceeds chapter ${portion.endChapter} verse count (${endChapterVerses})`);
        }
      }
      
      // If endVerse is 999, update it to actual last verse
      if (portion.endVerse === 999) {
        const actualLastVerse = bookData.chapters[portion.endChapter].verseCount;
        portion.endVerse = actualLastVerse;
        warnings.push(`Day ${dayNum}: Updated ${portion.bookName} ${portion.endChapter} end verse from 999 to ${actualLastVerse}`);
      }
      
      validCount++;
    });
  });
  
  // Report results
  console.log('=== VALIDATION RESULTS ===\n');
  console.log(`Total readings validated: ${validCount}`);
  console.log(`Errors found: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(err => console.log(`  - ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.slice(0, 10).forEach(warn => console.log(`  - ${warn}`));
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more warnings`);
    }
  }
  
  if (errors.length === 0) {
    console.log('\n✅ All verse references are valid!');
    
    // Save the corrected data (with 999 replaced with actual verse counts)
    fs.writeFileSync('nt_reading_schedule_validated.json', JSON.stringify(scheduleData, null, 2));
    console.log('\nSaved validated data to nt_reading_schedule_validated.json');
  }
  
  return errors.length === 0;
}

if (require.main === module) {
  const isValid = validateReadingSchedule();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateReadingSchedule, bibleBooks };