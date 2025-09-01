const fs = require('fs');

// Read the original extracted data
const originalData = JSON.parse(fs.readFileSync('temp_data/nt_complete_schedule.json', 'utf8'));
const currentData = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));

console.log('=== 2 CORINTHIANS DAYS COMPARISON ===\n');
console.log('Comparing original Excel extraction vs current data:\n');

// Filter for 2 Corinthians days (163-175)
for (let dayNum = 163; dayNum <= 175; dayNum++) {
  const origDay = originalData.find(d => d.dayNumber === dayNum);
  const currDay = currentData.find(d => d.dayNumber === dayNum);
  
  if (origDay && currDay) {
    console.log(`Day ${dayNum}:`);
    console.log(`  Excel raw: "${origDay.rawReading}"`);
    console.log(`  Current:   "${currDay.rawReading}"`);
    
    if (currDay.portions) {
      currDay.portions.forEach((p, i) => {
        console.log(`    Portion ${i+1}: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
      });
    }
    
    if (origDay.rawReading !== currDay.rawReading) {
      console.log(`  ⚠️  MISMATCH!`);
    }
    console.log();
  }
}

console.log('\n=== FOCUS ON DAY 164 ===');
const day164orig = originalData.find(d => d.dayNumber === 164);
const day164curr = currentData.find(d => d.dayNumber === 164);

console.log('Original Excel reading:', day164orig?.rawReading);
console.log('Current reading:', day164curr?.rawReading);
console.log('\nUser says it should be: "2 Cor 1:15 - 2:11"');

if (day164curr?.portions?.[0]) {
  const p = day164curr.portions[0];
  console.log(`Current actual range: ${p.bookName} ${p.startChapter}:${p.startVerse} - ${p.endChapter}:${p.endVerse}`);
  if (p.endChapter === 2 && p.endVerse === 4) {
    console.log('❌ Current end verse is 2:4, should be 2:11');
  }
}