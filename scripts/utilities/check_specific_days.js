const fs = require('fs');

const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));

console.log('Checking specific days for proper book fields:\n');

// Check days 164-167 (should all be 2 Corinthians)
[164, 165, 166, 167].forEach(dayNum => {
  const day = data.find(d => d.dayNumber === dayNum);
  if (day) {
    console.log(`Day ${dayNum}:`);
    console.log(`  Start: ${day.startBookName} (${day.startBookId})`);
    console.log(`  End: ${day.endBookName} (${day.endBookId})`);
    console.log(`  Raw: ${day.rawReading}`);
    if (day.portions) {
      day.portions.forEach((p, i) => {
        console.log(`  Portion ${i+1}: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
      });
    }
    console.log();
  }
});

// Check all cross-book days
console.log('\n=== ALL CROSS-BOOK DAYS ===\n');
data.forEach(day => {
  if (day.startBookId !== day.endBookId) {
    console.log(`Day ${day.dayNumber}: ${day.startBookName} → ${day.endBookName}`);
    if (day.portions && day.portions.length > 1) {
      day.portions.forEach((p, i) => {
        console.log(`  Portion ${i+1}: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
      });
    }
  }
});

// Check for any missing fields
console.log('\n=== CHECKING FOR MISSING FIELDS ===\n');
let missingCount = 0;
data.forEach(day => {
  if (!day.startBookName || !day.startBookId || !day.endBookName || !day.endBookId) {
    missingCount++;
    console.log(`Day ${day.dayNumber} missing fields:`, {
      startBookName: day.startBookName || 'MISSING',
      startBookId: day.startBookId || 'MISSING',
      endBookName: day.endBookName || 'MISSING',
      endBookId: day.endBookId || 'MISSING'
    });
  }
});

if (missingCount === 0) {
  console.log('✅ All 299 days have complete book fields!');
} else {
  console.log(`❌ ${missingCount} days are missing book fields`);
}