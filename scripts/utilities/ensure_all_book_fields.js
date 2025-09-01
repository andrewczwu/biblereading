const fs = require('fs');

function ensureAllBookFields() {
  console.log('Ensuring all days have start/end book fields...\n');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  let missingFieldsCount = 0;
  let fixedCount = 0;
  
  data.forEach(day => {
    // Check if any book fields are missing
    const hasAllFields = day.startBookName && day.startBookId && day.endBookName && day.endBookId;
    
    if (!hasAllFields) {
      missingFieldsCount++;
      
      // For single-book days, set start/end to the same book
      if (day.portions && day.portions.length > 0) {
        const firstPortion = day.portions[0];
        const lastPortion = day.portions[day.portions.length - 1];
        
        // Set start book fields from first portion
        if (!day.startBookName || !day.startBookId) {
          day.startBookName = firstPortion.bookName;
          day.startBookId = firstPortion.bookId;
        }
        
        // Set end book fields from last portion (for cross-book) or same as start (for single-book)
        if (!day.endBookName || !day.endBookId) {
          day.endBookName = lastPortion.bookName;
          day.endBookId = lastPortion.bookId;
        }
        
        fixedCount++;
        console.log(`Fixed Day ${day.dayNumber}: ${day.startBookName} → ${day.endBookName}`);
      } else {
        console.error(`Day ${day.dayNumber}: No portions found, cannot determine book`);
      }
    }
  });
  
  // Verify all days now have the required fields
  let verificationPassed = true;
  let singleBookDays = 0;
  let crossBookDays = 0;
  
  console.log('\n=== VERIFICATION ===');
  
  data.forEach(day => {
    if (!day.startBookName || !day.startBookId || !day.endBookName || !day.endBookId) {
      console.error(`❌ Day ${day.dayNumber} still missing book fields`);
      verificationPassed = false;
    } else {
      // Count single vs cross-book days
      if (day.startBookId === day.endBookId) {
        singleBookDays++;
      } else {
        crossBookDays++;
      }
    }
  });
  
  // Save the updated data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  
  // Report results
  console.log('\n=== SUMMARY ===');
  console.log(`Total days: ${data.length}`);
  console.log(`Days missing fields before: ${missingFieldsCount}`);
  console.log(`Days fixed: ${fixedCount}`);
  console.log(`Single-book days: ${singleBookDays}`);
  console.log(`Cross-book days: ${crossBookDays}`);
  
  if (verificationPassed) {
    console.log('\n✅ SUCCESS: All ${data.length} days now have proper start/end book fields!');
  } else {
    console.log('\n❌ ERROR: Some days still missing book fields');
  }
  
  // Show sample of days with their book fields
  console.log('\n=== SAMPLE DAYS ===');
  const sampleDays = [1, 50, 98, 124, 163, 200, 250, 299];
  sampleDays.forEach(dayNum => {
    const day = data.find(d => d.dayNumber === dayNum);
    if (day) {
      const crossBook = day.startBookId !== day.endBookId ? ' (CROSS-BOOK)' : '';
      console.log(`Day ${dayNum}: ${day.startBookName} → ${day.endBookName}${crossBook}`);
    }
  });
  
  return {
    success: verificationPassed,
    totalDays: data.length,
    singleBookDays,
    crossBookDays
  };
}

if (require.main === module) {
  const result = ensureAllBookFields();
  process.exit(result.success ? 0 : 1);
}

module.exports = { ensureAllBookFields };