const fs = require('fs');

function fix2CorinthiansSequence() {
  console.log('Fixing 2 Corinthians sequence to match original Excel...\n');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  // The correct sequence should be:
  // Day 163: 1 Cor 16:19-24, then 2 Cor 1:1-14 (cross-book, already correct)
  // Day 164: 2 Cor 1:15 - 2:11
  // Day 165: 2 Cor 2:12 - 3:12  
  // Day 166: 2 Cor 3:13 - 4:2
  // Day 167: 2 Cor 4:3 - 4:13
  // Day 168: 2 Cor 4:14 - 5:15
  // Day 169: 2 Cor 5:16 - 6:13 (this should shift to match original)
  
  const fixes = [
    {
      dayNumber: 164,
      rawReading: "1:15 – 2:11",
      startChapter: 1,
      startVerse: 15,
      endChapter: 2,
      endVerse: 11
    },
    {
      dayNumber: 165,
      rawReading: "2:12 – 3:12",
      startChapter: 2,
      startVerse: 12,
      endChapter: 3,
      endVerse: 12
    },
    {
      dayNumber: 166,
      rawReading: "3:13 – 4:2",
      startChapter: 3,
      startVerse: 13,
      endChapter: 4,
      endVerse: 2
    },
    {
      dayNumber: 167,
      rawReading: "4:3 – 4:13",
      startChapter: 4,
      startVerse: 3,
      endChapter: 4,
      endVerse: 13
    },
    {
      dayNumber: 168,
      rawReading: "4:14 – 5:15",
      startChapter: 4,
      startVerse: 14,
      endChapter: 5,
      endVerse: 15
    }
  ];
  
  fixes.forEach(fix => {
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
  
  // Now fix the remaining days to match original Excel exactly
  const additionalFixes = [
    {
      dayNumber: 169,
      rawReading: "5:16 – 6:13",
      startChapter: 5,
      startVerse: 16,
      endChapter: 6,
      endVerse: 13
    },
    {
      dayNumber: 170,
      rawReading: "6:14 – 7:16",
      startChapter: 6,
      startVerse: 14,
      endChapter: 7,
      endVerse: 16
    },
    {
      dayNumber: 171,
      rawReading: "8:1 – 9:5",
      startChapter: 8,
      startVerse: 1,
      endChapter: 9,
      endVerse: 5
    },
    {
      dayNumber: 172,
      rawReading: "9:6 – 11:15",
      startChapter: 9,
      startVerse: 6,
      endChapter: 11,
      endVerse: 15
    }
  ];
  
  additionalFixes.forEach(fix => {
    const day = data.find(d => d.dayNumber === fix.dayNumber);
    if (day) {
      day.rawReading = fix.rawReading;
      day.startBookName = "2 Corinthians";
      day.startBookId = "2corinthians";
      day.endBookName = "2 Corinthians";
      day.endBookId = "2corinthians";
      
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
  
  console.log('\n✅ Fixed 2 Corinthians sequence to match original Excel');
  console.log('✅ Updated data saved to nt_reading_schedule_crossbook.json');
  
  return data;
}

if (require.main === module) {
  fix2CorinthiansSequence();
}

module.exports = { fix2CorinthiansSequence };