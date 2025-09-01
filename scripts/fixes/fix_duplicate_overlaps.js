const fs = require('fs');

function fixDuplicateOverlaps() {
  console.log('Fixing duplicate verse overlaps at cross-book transitions...\n');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  // Fix each day that starts with duplicate verses
  const fixes = [
    {
      dayNumber: 197,
      description: "Philippians - should start at 1:19, not 1:1",
      startChapter: 1,
      startVerse: 19,
      rawReading: "1:19 – 2:4"
    },
    {
      dayNumber: 219,
      description: "2 Timothy - should start at 1:15, not 1:1",
      startChapter: 1,
      startVerse: 15,
      rawReading: "1:15 – 2:26"
    },
    {
      dayNumber: 222,
      description: "Titus - should start at 1:5, not 1:1",
      startChapter: 1,
      startVerse: 5,
      rawReading: "1:5 – 2:9"
    },
    // Note: Day 255 is CORRECT starting at 1:1 according to Excel "2 Pet. 1:1 – 1:4"
    // This is an intentional 4-verse overlap, so we skip it
    {
      dayNumber: 242,
      description: "James - should start at 1:2, not 1:1",
      startChapter: 1,
      startVerse: 2,
      rawReading: "1:2 – 1:25"
    }
  ];
  
  fixes.forEach(fix => {
    const day = data.find(d => d.dayNumber === fix.dayNumber);
    if (day && day.portions && day.portions.length > 0) {
      const oldStart = `${day.portions[0].startChapter}:${day.portions[0].startVerse}`;
      
      // Update the raw reading
      day.rawReading = fix.rawReading;
      
      // Update the portion's start verse
      day.portions[0].startChapter = fix.startChapter;
      day.portions[0].startVerse = fix.startVerse;
      
      const newStart = `${fix.startChapter}:${fix.startVerse}`;
      console.log(`✓ Fixed Day ${fix.dayNumber} (${fix.description})`);
      console.log(`  Changed from ${day.portions[0].bookName} ${oldStart} to ${newStart}`);
    } else {
      console.log(`❌ Could not find Day ${fix.dayNumber}`);
    }
  });
  
  // Also need to check the original Excel to verify these are correct
  console.log('\n📝 Note: These fixes assume the Excel shows these as the correct start verses.');
  console.log('   The cross-book days (196, 218, 221, 254, 241) end at the verses shown,');
  console.log('   and the next days should continue from there without overlap.');
  
  // Save the corrected data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  
  console.log('\n✅ Fixed duplicate overlaps in cross-book transitions');
  console.log('✅ Updated data saved to nt_reading_schedule_crossbook.json');
  
  return data;
}

if (require.main === module) {
  fixDuplicateOverlaps();
}

module.exports = { fixDuplicateOverlaps };