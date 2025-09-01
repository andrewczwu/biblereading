const fs = require('fs');

// Complete New Testament structure with verse counts
const newTestamentBooks = [
  { id: 'matthew', name: 'Matthew', chapters: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20] },
  { id: 'mark', name: 'Mark', chapters: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20] },
  { id: 'luke', name: 'Luke', chapters: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53] },
  { id: 'john', name: 'John', chapters: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25] },
  { id: 'acts', name: 'Acts', chapters: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31] },
  { id: 'romans', name: 'Romans', chapters: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27] },
  { id: '1corinthians', name: '1 Corinthians', chapters: [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24] },
  { id: '2corinthians', name: '2 Corinthians', chapters: [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14] },
  { id: 'galatians', name: 'Galatians', chapters: [24, 21, 29, 31, 26, 18] },
  { id: 'ephesians', name: 'Ephesians', chapters: [23, 22, 21, 32, 33, 24] },
  { id: 'philippians', name: 'Philippians', chapters: [30, 30, 21, 23] },
  { id: 'colossians', name: 'Colossians', chapters: [29, 23, 25, 18] },
  { id: '1thessalonians', name: '1 Thessalonians', chapters: [10, 20, 13, 18, 28] },
  { id: '2thessalonians', name: '2 Thessalonians', chapters: [12, 17, 18] },
  { id: '1timothy', name: '1 Timothy', chapters: [20, 15, 16, 16, 25, 21] },
  { id: '2timothy', name: '2 Timothy', chapters: [18, 26, 17, 22] },
  { id: 'titus', name: 'Titus', chapters: [16, 15, 15] },
  { id: 'philemon', name: 'Philemon', chapters: [25] },
  { id: 'hebrews', name: 'Hebrews', chapters: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25] },
  { id: 'james', name: 'James', chapters: [27, 26, 18, 17, 20] },
  { id: '1peter', name: '1 Peter', chapters: [25, 25, 22, 19, 14] },
  { id: '2peter', name: '2 Peter', chapters: [21, 22, 18] },
  { id: '1john', name: '1 John', chapters: [10, 29, 24, 21, 21] },
  { id: '2john', name: '2 John', chapters: [13] },
  { id: '3john', name: '3 John', chapters: [14] },
  { id: 'jude', name: 'Jude', chapters: [25] },
  { id: 'revelation', name: 'Revelation', chapters: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21] }
];

function validateCompleteCoverage() {
  // Read the validated schedule
  const scheduleData = JSON.parse(fs.readFileSync('nt_reading_schedule_validated.json', 'utf8'));
  
  console.log(`Validating complete NT coverage across ${scheduleData.length} daily readings...\n`);
  
  // Track coverage for each verse
  const coverage = {};
  const errors = [];
  
  // Initialize coverage tracking
  newTestamentBooks.forEach(book => {
    coverage[book.id] = {};
    book.chapters.forEach((verseCount, chapterIndex) => {
      const chapterNum = chapterIndex + 1;
      coverage[book.id][chapterNum] = {};
      for (let verse = 1; verse <= verseCount; verse++) {
        coverage[book.id][chapterNum][verse] = [];
      }
    });
  });
  
  // Mark covered verses from the schedule
  scheduleData.forEach((day, index) => {
    if (!day.portions || day.portions.length === 0) {
      errors.push(`Day ${day.dayNumber}: No portions found`);
      return;
    }
    
    day.portions.forEach(portion => {
      const bookId = portion.bookId;
      const book = newTestamentBooks.find(b => b.id === bookId);
      
      if (!book) {
        errors.push(`Day ${day.dayNumber}: Unknown book ID '${bookId}'`);
        return;
      }
      
      // Mark all verses in the range as covered
      for (let ch = portion.startChapter; ch <= portion.endChapter; ch++) {
        if (!book.chapters[ch - 1]) {
          errors.push(`Day ${day.dayNumber}: ${book.name} chapter ${ch} doesn't exist`);
          continue;
        }
        
        const maxVerse = book.chapters[ch - 1];
        let startV = 1, endV = maxVerse;
        
        if (ch === portion.startChapter) startV = portion.startVerse;
        if (ch === portion.endChapter) endV = Math.min(portion.endVerse, maxVerse);
        
        for (let v = startV; v <= endV; v++) {
          if (coverage[bookId][ch] && coverage[bookId][ch][v] !== undefined) {
            coverage[bookId][ch][v].push(day.dayNumber);
          }
        }
      }
    });
  });
  
  // Check for gaps and duplicates
  let totalVerses = 0;
  let coveredVerses = 0;
  let duplicateVerses = 0;
  let gapsFound = [];
  let duplicatesFound = [];
  
  newTestamentBooks.forEach(book => {
    book.chapters.forEach((verseCount, chapterIndex) => {
      const chapterNum = chapterIndex + 1;
      for (let verse = 1; verse <= verseCount; verse++) {
        totalVerses++;
        const days = coverage[book.id][chapterNum][verse];
        
        if (days.length === 0) {
          gapsFound.push(`${book.name} ${chapterNum}:${verse}`);
        } else if (days.length === 1) {
          coveredVerses++;
        } else {
          duplicateVerses++;
          duplicatesFound.push({
            verse: `${book.name} ${chapterNum}:${verse}`,
            days: days
          });
        }
      }
    });
  });
  
  // Report results
  console.log('=== COVERAGE VALIDATION RESULTS ===\n');
  console.log(`Total NT verses: ${totalVerses}`);
  console.log(`Properly covered: ${coveredVerses}`);
  console.log(`Gaps (uncovered): ${gapsFound.length}`);
  console.log(`Duplicates: ${duplicateVerses}`);
  console.log(`Errors: ${errors.length}\n`);
  
  if (errors.length > 0) {
    console.log('❌ ERRORS:');
    errors.slice(0, 10).forEach(err => console.log(`  - ${err}`));
    if (errors.length > 10) console.log(`  ... and ${errors.length - 10} more errors`);
    console.log();
  }
  
  if (gapsFound.length > 0) {
    console.log('❌ GAPS (uncovered verses):');
    gapsFound.slice(0, 20).forEach(gap => console.log(`  - ${gap}`));
    if (gapsFound.length > 20) console.log(`  ... and ${gapsFound.length - 20} more gaps`);
    console.log();
  }
  
  if (duplicatesFound.length > 0) {
    console.log('⚠️  DUPLICATES (verses covered multiple times):');
    duplicatesFound.slice(0, 10).forEach(dup => console.log(`  - ${dup.verse} (days: ${dup.days.join(', ')})`));
    if (duplicatesFound.length > 10) console.log(`  ... and ${duplicatesFound.length - 10} more duplicates`);
    console.log();
  }
  
  // Check book boundaries
  console.log('=== BOOK BOUNDARIES ===');
  const firstDay = scheduleData[0];
  const lastDay = scheduleData[scheduleData.length - 1];
  
  console.log(`First reading: Day ${firstDay.dayNumber} - ${firstDay.portions[0].bookName} ${firstDay.portions[0].startChapter}:${firstDay.portions[0].startVerse}`);
  console.log(`Last reading: Day ${lastDay.dayNumber} - ${lastDay.portions[0].bookName} ${lastDay.portions[0].endChapter}:${lastDay.portions[0].endVerse}`);
  
  const expectedStart = 'Matthew 1:1';
  const expectedEnd = 'Revelation 22:21';
  const actualStart = `${firstDay.portions[0].bookName} ${firstDay.portions[0].startChapter}:${firstDay.portions[0].startVerse}`;
  const actualEnd = `${lastDay.portions[0].bookName} ${lastDay.portions[0].endChapter}:${lastDay.portions[0].endVerse}`;
  
  console.log(`Expected start: ${expectedStart} | Actual: ${actualStart} ${actualStart === expectedStart ? '✓' : '❌'}`);
  console.log(`Expected end: ${expectedEnd} | Actual: ${actualEnd} ${actualEnd === expectedEnd ? '✓' : '❌'}`);
  
  // Summary
  const isComplete = gapsFound.length === 0 && errors.length === 0 && 
                     actualStart === expectedStart && actualEnd === expectedEnd;
  
  console.log('\n=== SUMMARY ===');
  if (isComplete) {
    console.log('✅ COMPLETE COVERAGE: All NT verses from Matthew 1:1 to Revelation 22:21 are covered!');
    if (duplicatesFound.length > 0) {
      console.log(`⚠️  Note: ${duplicatesFound.length} verses have duplicate coverage`);
    }
  } else {
    console.log('❌ INCOMPLETE COVERAGE: Issues found that need to be addressed');
  }
  
  return {
    isComplete,
    totalVerses,
    coveredVerses,
    gaps: gapsFound.length,
    duplicates: duplicatesFound.length,
    errors: errors.length
  };
}

if (require.main === module) {
  const result = validateCompleteCoverage();
  process.exit(result.isComplete && result.errors === 0 ? 0 : 1);
}

module.exports = { validateCompleteCoverage, newTestamentBooks };