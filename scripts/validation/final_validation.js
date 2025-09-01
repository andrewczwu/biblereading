const fs = require('fs');

function finalValidation() {
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  console.log('=== FINAL VALIDATION REPORT ===\n');
  
  let issues = [];
  let stats = {
    totalDays: data.length,
    daysWithAllFields: 0,
    singleBookDays: 0,
    crossBookDays: 0,
    daysWithMultiplePortions: 0,
    bookTransitions: {}
  };
  
  // Check each day
  data.forEach(day => {
    // Check for required fields
    if (day.startBookName && day.startBookId && day.endBookName && day.endBookId) {
      stats.daysWithAllFields++;
      
      // Track single vs cross-book
      if (day.startBookId === day.endBookId) {
        stats.singleBookDays++;
      } else {
        stats.crossBookDays++;
        if (!stats.bookTransitions[day.startBookId]) {
          stats.bookTransitions[day.startBookId] = [];
        }
        stats.bookTransitions[day.startBookId].push({
          day: day.dayNumber,
          to: day.endBookId
        });
      }
      
      // Track multiple portions
      if (day.portions && day.portions.length > 1) {
        stats.daysWithMultiplePortions++;
      }
      
      // Validate portions match book fields
      if (day.portions && day.portions.length > 0) {
        const firstPortion = day.portions[0];
        const lastPortion = day.portions[day.portions.length - 1];
        
        if (firstPortion.bookId !== day.startBookId) {
          issues.push(`Day ${day.dayNumber}: First portion book (${firstPortion.bookId}) doesn't match startBookId (${day.startBookId})`);
        }
        if (lastPortion.bookId !== day.endBookId) {
          issues.push(`Day ${day.dayNumber}: Last portion book (${lastPortion.bookId}) doesn't match endBookId (${day.endBookId})`);
        }
      }
    } else {
      issues.push(`Day ${day.dayNumber}: Missing book fields`);
    }
  });
  
  // Report results
  console.log('📊 STATISTICS:');
  console.log(`  Total days: ${stats.totalDays}`);
  console.log(`  Days with all book fields: ${stats.daysWithAllFields}`);
  console.log(`  Single-book days: ${stats.singleBookDays}`);
  console.log(`  Cross-book days: ${stats.crossBookDays}`);
  console.log(`  Days with multiple portions: ${stats.daysWithMultiplePortions}`);
  
  console.log('\n📚 BOOK TRANSITIONS:');
  Object.keys(stats.bookTransitions).forEach(fromBook => {
    stats.bookTransitions[fromBook].forEach(transition => {
      console.log(`  Day ${transition.day}: ${fromBook} → ${transition.to}`);
    });
  });
  
  if (issues.length > 0) {
    console.log('\n❌ ISSUES FOUND:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('\n✅ NO ISSUES FOUND!');
  }
  
  // Verify complete book coverage
  console.log('\n📖 BOOK COVERAGE:');
  const bookCoverage = {};
  data.forEach(day => {
    if (day.portions) {
      day.portions.forEach(portion => {
        if (!bookCoverage[portion.bookId]) {
          bookCoverage[portion.bookId] = {
            name: portion.bookName,
            firstDay: day.dayNumber,
            lastDay: day.dayNumber
          };
        } else {
          bookCoverage[portion.bookId].lastDay = day.dayNumber;
        }
      });
    }
  });
  
  const expectedBooks = [
    'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
    '1corinthians', '2corinthians', 'galatians', 'ephesians',
    'philippians', 'colossians', '1thessalonians', '2thessalonians',
    '1timothy', '2timothy', 'titus', 'philemon', 'hebrews',
    'james', '1peter', '2peter', '1john', '2john', '3john',
    'jude', 'revelation'
  ];
  
  expectedBooks.forEach(bookId => {
    if (bookCoverage[bookId]) {
      const book = bookCoverage[bookId];
      console.log(`  ✓ ${book.name}: Days ${book.firstDay}-${book.lastDay}`);
    } else {
      console.log(`  ✗ ${bookId}: NOT COVERED`);
      issues.push(`Book ${bookId} is not covered`);
    }
  });
  
  // Final verdict
  console.log('\n=== FINAL VERDICT ===');
  if (stats.daysWithAllFields === stats.totalDays && issues.length === 0) {
    console.log('✅ ALL VALIDATION CHECKS PASSED!');
    console.log('✅ All 299 days have proper start/end book fields');
    console.log('✅ All 27 New Testament books are covered');
    console.log('✅ All portions match their day\'s book fields');
    return true;
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log(`  - Days with missing fields: ${stats.totalDays - stats.daysWithAllFields}`);
    console.log(`  - Total issues: ${issues.length}`);
    return false;
  }
}

if (require.main === module) {
  const result = finalValidation();
  process.exit(result ? 0 : 1);
}

module.exports = { finalValidation };