const fs = require('fs');

function fixProperTransition() {
  console.log('Fixing proper 1 Cor → 2 Cor transition to match Excel...\n');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  // The correct sequence should be:
  // Day 162: 1 Cor 15:50 - 16:24, then 2 Cor 1:1-14 (cross-book)
  // Day 163: 2 Cor 1:15 - 2:11 (single book)
  // Day 164: 2 Cor 2:12 - 3:12 (and so on...)
  
  // Fix Day 162 to be the cross-book transition
  const day162 = data.find(d => d.dayNumber === 162);
  if (day162) {
    day162.rawReading = "15:50 – 2 Cor. 1:14";
    day162.startBookName = "1 Corinthians";
    day162.startBookId = "1corinthians";
    day162.endBookName = "2 Corinthians";
    day162.endBookId = "2corinthians";
    day162.portions = [
      {
        bookName: "1 Corinthians",
        bookId: "1corinthians",
        startChapter: 15,
        startVerse: 50,
        endChapter: 16,
        endVerse: 24,
        portionOrder: 1
      },
      {
        bookName: "2 Corinthians", 
        bookId: "2corinthians",
        startChapter: 1,
        startVerse: 1,
        endChapter: 1,
        endVerse: 14,
        portionOrder: 2
      }
    ];
    console.log(`✓ Fixed Day 162: 1 Cor 15:50-16:24, then 2 Cor 1:1-14 (cross-book)`);
  }
  
  // Fix Day 163 to be single book 2 Corinthians
  const day163 = data.find(d => d.dayNumber === 163);
  if (day163) {
    day163.rawReading = "1:15 – 2:11";
    day163.startBookName = "2 Corinthians";
    day163.startBookId = "2corinthians";
    day163.endBookName = "2 Corinthians";
    day163.endBookId = "2corinthians";
    day163.portions = [{
      bookName: "2 Corinthians",
      bookId: "2corinthians",
      startChapter: 1,
      startVerse: 15,
      endChapter: 2,
      endVerse: 11,
      portionOrder: 1
    }];
    console.log(`✓ Fixed Day 163: 2 Cor 1:15 - 2:11 (single book)`);
  }
  
  // The rest of the days should already be correct from previous fix
  console.log('Days 164+ should already be correct from previous fixes');
  
  // Save the data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  
  console.log('\n✅ Fixed proper cross-book transition to match Excel');
  console.log('✅ Day 162 is now the cross-book day (1 Cor → 2 Cor)');
  console.log('✅ Day 163 is now single-book 2 Corinthians as per Excel');
  
  return data;
}

if (require.main === module) {
  fixProperTransition();
}

module.exports = { fixProperTransition };