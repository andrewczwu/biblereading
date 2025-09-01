const fs = require('fs');
const { newTestamentBooks } = require('./scripts/validation/validate_nt_coverage');

function identifyDuplicateDays() {
  const scheduleData = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  console.log('=== DUPLICATE VERSE COVERAGE - DETAILED ANALYSIS ===\n');
  
  // Track coverage for each verse
  const coverage = {};
  
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
  scheduleData.forEach((day) => {
    if (!day.portions || day.portions.length === 0) {
      return;
    }
    
    day.portions.forEach(portion => {
      const bookId = portion.bookId;
      const book = newTestamentBooks.find(b => b.id === bookId);
      
      if (!book) {
        return;
      }
      
      // Mark all verses in the range as covered
      for (let ch = portion.startChapter; ch <= portion.endChapter; ch++) {
        if (!book.chapters[ch - 1]) {
          continue;
        }
        
        const maxVerse = book.chapters[ch - 1];
        let startV = 1, endV = maxVerse;
        
        if (ch === portion.startChapter) startV = portion.startVerse;
        if (ch === portion.endChapter) endV = Math.min(portion.endVerse, maxVerse);
        
        for (let v = startV; v <= endV; v++) {
          if (coverage[bookId][ch] && coverage[bookId][ch][v] !== undefined) {
            // Store day number and portion number
            coverage[bookId][ch][v].push({
              day: day.dayNumber,
              date: day.date,
              portion: portion.portionOrder || 1,
              isCrossBook: day.startBookId !== day.endBookId
            });
          }
        }
      }
    });
  });
  
  // Find all duplicates and organize by day pairs
  const duplicatePairs = {};
  let totalDuplicates = 0;
  
  newTestamentBooks.forEach(book => {
    book.chapters.forEach((verseCount, chapterIndex) => {
      const chapterNum = chapterIndex + 1;
      for (let verse = 1; verse <= verseCount; verse++) {
        const days = coverage[book.id][chapterNum][verse];
        
        if (days.length > 1) {
          totalDuplicates++;
          // Create a key for this pair of days
          const dayNumbers = days.map(d => d.day).sort((a,b) => a-b);
          const pairKey = dayNumbers.join('-');
          
          if (!duplicatePairs[pairKey]) {
            duplicatePairs[pairKey] = {
              days: days,
              verses: [],
              count: 0,
              bookName: book.name
            };
          }
          
          duplicatePairs[pairKey].verses.push(`${book.name} ${chapterNum}:${verse}`);
          duplicatePairs[pairKey].count++;
        }
      }
    });
  });
  
  // Sort pairs by number of duplicate verses
  const sortedPairs = Object.entries(duplicatePairs)
    .sort((a, b) => b[1].count - a[1].count);
  
  console.log(`Total duplicate verses: ${totalDuplicates}\n`);
  console.log(`Number of day pairs with duplicates: ${sortedPairs.length}\n`);
  
  console.log('=== DUPLICATE DAY PAIRS (sorted by number of duplicate verses) ===\n');
  
  sortedPairs.forEach(([pairKey, data], index) => {
    const day1 = data.days[0];
    const day2 = data.days[1];
    
    // Get day details from schedule
    const day1Data = scheduleData.find(d => d.dayNumber === day1.day);
    const day2Data = scheduleData.find(d => d.dayNumber === day2.day);
    
    console.log(`${index + 1}. Days ${day1.day} & ${day2.day}: ${data.count} duplicate verses`);
    console.log(`   Day ${day1.day} (${day1.date}): ${day1Data.rawReading}`);
    if (day1.isCrossBook) {
      console.log(`      → Cross-book: ${day1Data.startBookName} → ${day1Data.endBookName}`);
    }
    console.log(`   Day ${day2.day} (${day2.date}): ${day2Data.rawReading}`);
    if (day2.isCrossBook) {
      console.log(`      → Cross-book: ${day2Data.startBookName} → ${day2Data.endBookName}`);
    }
    
    // Show verse range
    if (data.verses.length > 0) {
      const firstVerse = data.verses[0];
      const lastVerse = data.verses[data.verses.length - 1];
      console.log(`   Duplicate range: ${firstVerse} to ${lastVerse}`);
    }
    console.log();
  });
  
  // Identify patterns
  console.log('=== DUPLICATE PATTERNS ===\n');
  
  let crossBookDuplicates = 0;
  let regularDuplicates = 0;
  
  sortedPairs.forEach(([pairKey, data]) => {
    if (data.days.some(d => d.isCrossBook)) {
      crossBookDuplicates += data.count;
    } else {
      regularDuplicates += data.count;
    }
  });
  
  console.log(`Duplicates from cross-book transitions: ${crossBookDuplicates} verses`);
  console.log(`Duplicates from regular overlaps: ${regularDuplicates} verses`);
  console.log(`Total duplicates: ${totalDuplicates} verses`);
  
  // List specific problematic overlaps
  console.log('\n=== MAJOR OVERLAPS (10+ verses) ===\n');
  
  sortedPairs.filter(([_, data]) => data.count >= 10).forEach(([pairKey, data]) => {
    const day1 = data.days[0];
    const day2 = data.days[1];
    const day1Data = scheduleData.find(d => d.dayNumber === day1.day);
    const day2Data = scheduleData.find(d => d.dayNumber === day2.day);
    
    console.log(`Days ${day1.day} & ${day2.day}: ${data.count} verses`);
    
    // Determine the cause
    if (day1.isCrossBook || day2.isCrossBook) {
      console.log(`  Cause: Cross-book transition overlap`);
      if (day1.isCrossBook) {
        console.log(`    Day ${day1.day}: ${day1Data.startBookName} → ${day1Data.endBookName}`);
      }
      if (day2.isCrossBook) {
        console.log(`    Day ${day2.day}: ${day2Data.startBookName} → ${day2Data.endBookName}`);
      }
    } else {
      console.log(`  Cause: Regular reading overlap`);
      console.log(`    Day ${day1.day}: ${day1Data.rawReading}`);
      console.log(`    Day ${day2.day}: ${day2Data.rawReading}`);
    }
    console.log();
  });
  
  return {
    totalDuplicates,
    duplicatePairs: sortedPairs,
    crossBookDuplicates,
    regularDuplicates
  };
}

if (require.main === module) {
  identifyDuplicateDays();
}

module.exports = { identifyDuplicateDays };