const fs = require('fs');

const originalData = JSON.parse(fs.readFileSync('temp_data/nt_complete_schedule.json', 'utf8'));

console.log('=== ORIGINAL EXCEL 2 CORINTHIANS SEQUENCE ===\n');

for (let dayNum = 163; dayNum <= 173; dayNum++) {
  const day = originalData.find(d => d.dayNumber === dayNum);
  if (day) {
    console.log(`Day ${dayNum}: "${day.rawReading}"`);
  }
}

console.log('\n=== ANALYSIS ===');
console.log('The original Excel shows Day 163 as "1:15 – 2: 11" which suggests it was');
console.log('supposed to be 2 Corinthians 1:15 - 2:11, not a cross-book day.');
console.log('\nThis means the cross-book transition should have happened BEFORE Day 163,');
console.log('or Day 163 was supposed to continue from a cross-book Day 162.');

// Check Day 162
const day162 = originalData.find(d => d.dayNumber === 162);
console.log(`\nDay 162: "${day162?.rawReading}"`);

console.log('\nIt seems like Day 163 in Excel is already 2 Corinthians, not 1 Corinthians!');