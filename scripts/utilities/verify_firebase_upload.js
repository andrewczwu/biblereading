const { db } = require('./config/firebase');

async function verifyUpload() {
  try {
    console.log('Verifying Firebase upload with latest crossbook data...\n');
    
    // Check specific days that were corrected
    const criticalDays = [163, 164, 167, 258, 259, 260];
    
    for (const dayNum of criticalDays) {
      const docId = `day-${String(dayNum).padStart(3, '0')}`;
      const doc = await db.collection('readingPlans')
        .doc('newtestamentyp')
        .collection('dailyReadings')
        .doc(docId)
        .get();
      
      if (doc.exists) {
        const data = doc.data();
        console.log(`Day ${dayNum}:`);
        console.log(`  Start: ${data.startBookName} (${data.startBookId})`);
        console.log(`  End: ${data.endBookName} (${data.endBookId})`);
        if (data.portions && data.portions.length > 1) {
          console.log(`  Cross-book: YES (${data.portions.length} portions)`);
          data.portions.forEach((p, i) => {
            console.log(`    Portion ${i+1}: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
          });
        } else if (data.portions && data.portions.length === 1) {
          const p = data.portions[0];
          console.log(`  Single book: ${p.bookName} ${p.startChapter}:${p.startVerse}-${p.endChapter}:${p.endVerse}`);
        }
        console.log();
      } else {
        console.log(`Day ${dayNum}: NOT FOUND`);
      }
    }
    
    // Count cross-book days
    const allDocs = await db.collection('readingPlans')
      .doc('newtestamentyp')
      .collection('dailyReadings')
      .get();
    
    let crossBookCount = 0;
    let missingFieldsCount = 0;
    
    allDocs.forEach(doc => {
      const data = doc.data();
      if (!data.startBookName || !data.startBookId || !data.endBookName || !data.endBookId) {
        missingFieldsCount++;
      }
      if (data.startBookId !== data.endBookId) {
        crossBookCount++;
      }
    });
    
    console.log('=== SUMMARY ===');
    console.log(`Total documents: ${allDocs.size}`);
    console.log(`Cross-book days: ${crossBookCount}`);
    console.log(`Days missing book fields: ${missingFieldsCount}`);
    
    if (missingFieldsCount === 0) {
      console.log('\n✅ All days have proper book fields!');
    } else {
      console.log('\n❌ Some days are missing book fields');
    }
    
    // Verify Day 163 specifically (should be 1 Cor -> 2 Cor)
    const day163 = allDocs.docs.find(d => d.id === 'day-163');
    if (day163) {
      const data = day163.data();
      if (data.startBookId === '1corinthians' && data.endBookId === '2corinthians') {
        console.log('✅ Day 163 correctly shows 1 Corinthians → 2 Corinthians transition');
      } else {
        console.log('❌ Day 163 not correctly set up');
      }
    }
    
    // Verify Days 164-167 (should all be 2 Corinthians)
    let corinthiansCorrect = true;
    for (let i = 164; i <= 167; i++) {
      const doc = allDocs.docs.find(d => d.id === `day-${String(i).padStart(3, '0')}`);
      if (doc) {
        const data = doc.data();
        if (data.startBookId !== '2corinthians' || data.endBookId !== '2corinthians') {
          corinthiansCorrect = false;
          console.log(`❌ Day ${i} is not 2 Corinthians`);
        }
      }
    }
    if (corinthiansCorrect) {
      console.log('✅ Days 164-167 correctly show 2 Corinthians only');
    }
    
  } catch (error) {
    console.error('Error verifying upload:', error);
  }
}

if (require.main === module) {
  verifyUpload()
    .then(() => {
      console.log('\n🎉 Verification completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyUpload };