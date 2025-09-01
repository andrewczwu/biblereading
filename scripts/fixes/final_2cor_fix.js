const fs = require('fs');

function final2CorFix() {
  console.log('Final 2 Corinthians fix to match Excel exactly...\n');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  // The correct sequence according to original Excel:
  // Day 162: 1 Cor 15:50 - 16:24, then 2 Cor 1:1-14 (cross-book) [already done]
  // Day 163: 2 Cor 1:15 - 2:11 [already done]
  // Now fix the rest to match Excel exactly:
  
  const correctSequence = [
    {
      dayNumber: 164,
      rawReading: "2:12 – 3:12",
      startChapter: 2,
      startVerse: 12,
      endChapter: 3,
      endVerse: 12
    },
    {
      dayNumber: 165,
      rawReading: "3:13 – 4:2",
      startChapter: 3,
      startVerse: 13,
      endChapter: 4,
      endVerse: 2
    },
    {
      dayNumber: 166,
      rawReading: "4:3 – 4:13",
      startChapter: 4,
      startVerse: 3,
      endChapter: 4,
      endVerse: 13
    },
    {
      dayNumber: 167,
      rawReading: "4:14 – 5:15",
      startChapter: 4,
      startVerse: 14,
      endChapter: 5,
      endVerse: 15
    },
    {
      dayNumber: 168,
      rawReading: "5:16 – 6:13",
      startChapter: 5,
      startVerse: 16,
      endChapter: 6,
      endVerse: 13
    },
    {
      dayNumber: 169,
      rawReading: "6:14 – 7:16",
      startChapter: 6,
      startVerse: 14,
      endChapter: 7,
      endVerse: 16
    },
    {
      dayNumber: 170,
      rawReading: "8:1 – 9:5",
      startChapter: 8,
      startVerse: 1,
      endChapter: 9,
      endVerse: 5
    },
    {
      dayNumber: 171,
      rawReading: "9:6 – 11:15",
      startChapter: 9,
      startVerse: 6,
      endChapter: 11,
      endVerse: 15
    },
    {
      dayNumber: 172,
      rawReading: "11:16 – 12:10",
      startChapter: 11,
      startVerse: 16,
      endChapter: 12,
      endVerse: 10
    },
    {
      dayNumber: 173,
      rawReading: "12:11 – 13:14",
      startChapter: 12,
      startVerse: 11,
      endChapter: 13,
      endVerse: 14
    }
  ];
  
  correctSequence.forEach(fix => {
    const day = data.find(d => d.dayNumber === fix.dayNumber);
    if (day) {
      // Update the day's properties
      day.rawReading = fix.rawReading;
      day.startBookName = "2 Corinthians";
      day.startBookId = "2corinthians";
      day.endBookName = "2 Corinthians";
      day.endBookId = "2corinthians";
      
      // Update portions
      day.portions = [{
        bookName: "2 Corinthians",
        bookId: "2corinthians",
        startChapter: fix.startChapter,
        startVerse: fix.startVerse,
        endChapter: fix.endChapter,
        endVerse: fix.endVerse,
        portionOrder: 1
      }];
      
      console.log(`✓ Fixed Day ${fix.dayNumber}: 2 Cor ${fix.startChapter}:${fix.startVerse} - ${fix.endChapter}:${fix.endVerse}`);
    }
  });
  
  // Save the corrected data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  
  console.log('\n✅ Final 2 Corinthians sequence matches Excel exactly');
  console.log('✅ All gaps should now be covered');
  
  return data;
}

if (require.main === module) {
  final2CorFix();
}

module.exports = { final2CorFix };