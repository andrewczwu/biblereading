const fs = require('fs');

const originalData = JSON.parse(fs.readFileSync('temp_data/nt_complete_schedule.json', 'utf8'));

console.log('=== CHECKING ORIGINAL EXCEL FOR OVERLAP DAYS ===\n');

const daysToCheck = [196, 197, 218, 219, 221, 222, 241, 242, 254, 255];

daysToCheck.forEach(dayNum => {
  const day = originalData.find(d => d.dayNumber === dayNum);
  if (day) {
    console.log(`Day ${dayNum}: "${day.rawReading}"`);
    if (day.portions && day.portions[0]) {
      const p = day.portions[0];
      console.log(`  Parsed as: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
    }
  }
});

console.log('\n=== ANALYSIS ===');
console.log('Looking at the Excel raw readings:');
console.log('- Day 197 shows "1:19 – 2:4" (should be Phil 1:19, not 1:1)');
console.log('- Day 219 shows "1:15 – 2:26" (should be 2 Tim 1:15, not 1:1)');
console.log('- Day 222 shows "1:5 – 2:9" (should be Titus 1:5, not 1:1)');
console.log('- Day 242 shows "1:2 – 1:25" (should be James 1:2, not 1:1)');
console.log('- Day 255 shows "2 Pet. 1:1 – 1:4" (this one might actually start at 1:1)');