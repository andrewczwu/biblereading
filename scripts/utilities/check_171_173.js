const fs = require('fs');

const originalData = JSON.parse(fs.readFileSync('temp_data/nt_complete_schedule.json', 'utf8'));
const currentData = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));

console.log('Days 171-173 comparison:\n');

for (let dayNum = 171; dayNum <= 173; dayNum++) {
  const origDay = originalData.find(d => d.dayNumber === dayNum);
  const currDay = currentData.find(d => d.dayNumber === dayNum);
  
  console.log(`Day ${dayNum}:`);
  console.log(`  Excel: "${origDay?.rawReading}"`);
  console.log(`  Current: "${currDay?.rawReading}"`);
  if (currDay?.portions?.[0]) {
    const p = currDay.portions[0];
    console.log(`  Actual: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
  }
  console.log();
}

// Check what verses are missing
console.log('Expected sequence:');
console.log('Day 171: 2 Cor 8:1 - 9:5');
console.log('Day 172: 2 Cor 9:6 - 11:15');
console.log('Day 173: 2 Cor 11:16 - 12:10');

const day171 = currentData.find(d => d.dayNumber === 171);
const day172 = currentData.find(d => d.dayNumber === 172);

console.log('\nActual current state:');
if (day171?.portions?.[0]) {
  const p = day171.portions[0];
  console.log(`Day 171: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
}
if (day172?.portions?.[0]) {
  const p = day172.portions[0];
  console.log(`Day 172: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
}