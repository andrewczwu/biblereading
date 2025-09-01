const fs = require('fs');
const { newTestamentBooks } = require('./validate_nt_coverage');

function analyzeDuplicates() {
  const scheduleData = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  console.log('Analyzing duplicate verse coverage...\n');
  
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
  
  // Mark covered verses from the schedule (supporting multiple portions per day)
  scheduleData.forEach((day, index) => {
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
            coverage[bookId][ch][v].push(`${day.dayNumber}p${portion.portionOrder}`);
          }
        }
      }
    });
  });
  
  // Find all duplicates
  let duplicatesFound = [];
  
  newTestamentBooks.forEach(book => {
    book.chapters.forEach((verseCount, chapterIndex) => {
      const chapterNum = chapterIndex + 1;
      for (let verse = 1; verse <= verseCount; verse++) {
        const days = coverage[book.id][chapterNum][verse];
        
        if (days.length > 1) {
          duplicatesFound.push({
            verse: `${book.name} ${chapterNum}:${verse}`,
            days: days,
            count: days.length
          });
        }
      }
    });
  });
  
  // Group duplicates by which days they appear on
  const duplicateGroups = {};
  duplicatesFound.forEach(dup => {
    const key = dup.days.sort().join(',');
    if (!duplicateGroups[key]) {
      duplicateGroups[key] = {
        days: dup.days,
        verses: [],
        count: 0
      };
    }
    duplicateGroups[key].verses.push(dup.verse);
    duplicateGroups[key].count++;
  });
  
  console.log(`=== DUPLICATE ANALYSIS ===`);
  console.log(`Total duplicate verses: ${duplicatesFound.length}`);
  console.log(`Number of duplicate groups: ${Object.keys(duplicateGroups).length}\n`);
  
  // Sort groups by number of verses
  const sortedGroups = Object.values(duplicateGroups).sort((a, b) => b.count - a.count);
  
  console.log(`=== DUPLICATE GROUPS (by size) ===\n`);
  
  sortedGroups.forEach((group, index) => {
    console.log(`Group ${index + 1}: ${group.count} verses duplicated on days ${group.days.join(', ')}`);
    
    // Show first few verses in each group
    const versesToShow = Math.min(group.verses.length, 10);
    for (let i = 0; i < versesToShow; i++) {
      console.log(`  - ${group.verses[i]}`);
    }
    if (group.verses.length > 10) {
      console.log(`  ... and ${group.verses.length - 10} more verses`);
    }
    console.log();
  });
  
  // Save detailed report
  const report = {
    totalDuplicates: duplicatesFound.length,
    duplicateGroups: sortedGroups.length,
    groups: sortedGroups.map(group => ({
      days: group.days,
      verseCount: group.count,
      verses: group.verses
    })),
    allDuplicates: duplicatesFound
  };
  
  fs.writeFileSync('duplicate_analysis.json', JSON.stringify(report, null, 2));
  console.log(`✅ Detailed analysis saved to duplicate_analysis.json`);
  
  return report;
}

if (require.main === module) {
  analyzeDuplicates();
}

module.exports = { analyzeDuplicates };