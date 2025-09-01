const fs = require('fs');

function fixDay254() {
  console.log('Fixing Day 254 to be single-book (1 Peter 5:4-14 only)...\n');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  // Find Day 254
  const day254 = data.find(d => d.dayNumber === 254);
  
  if (day254) {
    console.log('Current Day 254:');
    console.log(`  Raw: "${day254.rawReading}"`);
    console.log(`  Start: ${day254.startBookName} → End: ${day254.endBookName}`);
    console.log(`  Portions: ${day254.portions.length}`);
    
    // Fix Day 254 to be single-book 1 Peter only
    day254.rawReading = "5:4 – 5:14";
    day254.startBookName = "1 Peter";
    day254.startBookId = "1peter";
    day254.endBookName = "1 Peter";
    day254.endBookId = "1peter";
    
    // Single portion for 1 Peter 5:4-14
    day254.portions = [{
      bookName: "1 Peter",
      bookId: "1peter",
      startChapter: 5,
      startVerse: 4,
      endChapter: 5,
      endVerse: 14,
      portionOrder: 1
    }];
    
    console.log('\n✓ Fixed Day 254:');
    console.log(`  New raw: "${day254.rawReading}"`);
    console.log(`  Now single-book: 1 Peter 5:4-14`);
    console.log(`  This removes the cross-book transition and overlap with Day 255`);
  } else {
    console.log('❌ Could not find Day 254');
  }
  
  // Also need to update the cross-book schema to remove Day 254 from cross-book transitions
  console.log('\n📝 Note: Day 254 is no longer a cross-book transition day.');
  console.log('   Day 255 starts 2 Peter fresh with no overlap.');
  
  // Save the corrected data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  
  console.log('\n✅ Fixed Day 254 to single-book reading');
  console.log('✅ This should eliminate the last 4 duplicate verses');
  
  return data;
}

if (require.main === module) {
  fixDay254();
}

module.exports = { fixDay254 };