const fs = require('fs');
const { newTestamentBooks } = require('./validate_nt_coverage');

function validateCrossBookCoverage() {
  const scheduleData = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  console.log(`Validating complete NT coverage with cross-book schema across ${scheduleData.length} daily readings...\n`);
  
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
  
  // Mark covered verses from the schedule (now supporting multiple portions per day)
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
            coverage[bookId][ch][v].push(`${day.dayNumber}p${portion.portionOrder}`);
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
  console.log('=== CROSS-BOOK COVERAGE VALIDATION RESULTS ===\n');
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
    duplicatesFound.slice(0, 10).forEach(dup => console.log(`  - ${dup.verse} (${dup.days.join(', ')})`));
    if (duplicatesFound.length > 10) console.log(`  ... and ${duplicatesFound.length - 10} more duplicates`);
    console.log();
  }
  
  // Check book boundaries
  console.log('=== BOOK BOUNDARIES ===');
  const firstDay = scheduleData[0];
  const lastDay = scheduleData[scheduleData.length - 1];
  
  console.log(`First reading: Day ${firstDay.dayNumber} - ${firstDay.startBookName} ${firstDay.portions[0].startChapter}:${firstDay.portions[0].startVerse}`);
  console.log(`Last reading: Day ${lastDay.dayNumber} - ${lastDay.endBookName} ${lastDay.portions[lastDay.portions.length - 1].endChapter}:${lastDay.portions[lastDay.portions.length - 1].endVerse}`);
  
  // Summary
  const isComplete = gapsFound.length === 0 && errors.length === 0;
  
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
  const result = validateCrossBookCoverage();
  process.exit(result.isComplete && result.errors === 0 ? 0 : 1);
}

module.exports = { validateCrossBookCoverage };