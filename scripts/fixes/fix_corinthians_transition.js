const fs = require('fs');

function fixCorinthiansTransition() {
  console.log('Fixing 1 Corinthians to 2 Corinthians transition...');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  // Find the days to update
  const day163 = data.find(d => d.dayNumber === 163);
  const day164 = data.find(d => d.dayNumber === 164);
  const day165 = data.find(d => d.dayNumber === 165);
  const day166 = data.find(d => d.dayNumber === 166);
  const day167 = data.find(d => d.dayNumber === 167);
  
  if (!day163 || !day164 || !day165 || !day166 || !day167) {
    console.error('Could not find all required days');
    return;
  }
  
  // Fix Day 163: 1 Cor 16:19 - 2 Cor 1:14 (cross-book)
  day163.rawReading = "16:19 – 2 Cor. 1:14";
  day163.startBookName = "1 Corinthians";
  day163.startBookId = "1corinthians";
  day163.endBookName = "2 Corinthians";
  day163.endBookId = "2corinthians";
  day163.portions = [
    {
      bookName: "1 Corinthians",
      bookId: "1corinthians",
      startChapter: 16,
      startVerse: 19,
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
  console.log('✓ Fixed Day 163: 1 Cor 16:19-24, then 2 Cor 1:1-14');
  
  // Fix Day 164: 2 Cor 1:15 - 2:4
  day164.rawReading = "1:15 – 2:4";
  day164.startBookName = "2 Corinthians";
  day164.startBookId = "2corinthians";
  day164.endBookName = "2 Corinthians";
  day164.endBookId = "2corinthians";
  day164.portions = [
    {
      bookName: "2 Corinthians",
      bookId: "2corinthians",
      startChapter: 1,
      startVerse: 15,
      endChapter: 2,
      endVerse: 4,
      portionOrder: 1
    }
  ];
  console.log('✓ Fixed Day 164: 2 Cor 1:15 - 2:4');
  
  // Fix Day 165: 2 Cor 2:5 - 3:6
  day165.rawReading = "2:5 – 3:6";
  day165.startBookName = "2 Corinthians";
  day165.startBookId = "2corinthians";
  day165.endBookName = "2 Corinthians";
  day165.endBookId = "2corinthians";
  day165.portions = [
    {
      bookName: "2 Corinthians",
      bookId: "2corinthians",
      startChapter: 2,
      startVerse: 5,
      endChapter: 3,
      endVerse: 6,
      portionOrder: 1
    }
  ];
  console.log('✓ Fixed Day 165: 2 Cor 2:5 - 3:6');
  
  // Fix Day 166: 2 Cor 3:7 - 4:6
  day166.rawReading = "3:7 – 4:6";
  day166.startBookName = "2 Corinthians";
  day166.startBookId = "2corinthians";
  day166.endBookName = "2 Corinthians";
  day166.endBookId = "2corinthians";
  day166.portions = [
    {
      bookName: "2 Corinthians",
      bookId: "2corinthians",
      startChapter: 3,
      startVerse: 7,
      endChapter: 4,
      endVerse: 6,
      portionOrder: 1
    }
  ];
  console.log('✓ Fixed Day 166: 2 Cor 3:7 - 4:6');
  
  // Fix Day 167: 2 Cor 4:7 - 5:10 (no longer cross-book)
  day167.rawReading = "4:7 – 5:10";
  day167.startBookName = "2 Corinthians";
  day167.startBookId = "2corinthians";
  day167.endBookName = "2 Corinthians";
  day167.endBookId = "2corinthians";
  day167.portions = [
    {
      bookName: "2 Corinthians",
      bookId: "2corinthians",
      startChapter: 4,
      startVerse: 7,
      endChapter: 5,
      endVerse: 10,
      portionOrder: 1
    }
  ];
  console.log('✓ Fixed Day 167: 2 Cor 4:7 - 5:10');
  
  // Save the updated data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  console.log('\n✅ Fixed 1 Corinthians to 2 Corinthians transition');
  console.log('✅ Updated data saved to nt_reading_schedule_crossbook.json');
  
  return data;
}

if (require.main === module) {
  fixCorinthiansTransition();
}

module.exports = { fixCorinthiansTransition };