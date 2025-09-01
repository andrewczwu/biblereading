const { db } = require('../config/firebase');

async function createReadingTemplate() {
  try {
    console.log('Creating readingTemplates collection with bellevueYPNT template...\n');
    
    // Step 1: Read source collection
    console.log('Step 1: Reading source collection (newtestamentyporiginal)...');
    
    // Get the main document from readingPlans
    const sourceDoc = await db.collection('readingPlans').doc('newtestamentyporiginal').get();
    if (!sourceDoc.exists) {
      throw new Error('Source collection newtestamentyporiginal not found in readingPlans');
    }
    
    const planData = sourceDoc.data();
    console.log('✓ Found source plan document');
    
    // Get all daily readings
    const dailyReadingsSnapshot = await db
      .collection('readingPlans')
      .doc('newtestamentyporiginal')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ Found ${dailyReadingsSnapshot.size} daily readings to copy`);
    
    // Step 2: Create readingTemplates/bellevueYPNT
    console.log('\nStep 2: Creating readingTemplates/bellevueYPNT...');
    
    // Create the main template document with updated info
    const templateData = {
      ...planData,
      name: 'Bellevue Young People New Testament',
      description: 'Bellevue Young People Bible Reading Schedule for New Testament - Template for yearly plans',
      templateId: 'bellevueYPNT',
      isTemplate: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('readingTemplates').doc('bellevueYPNT').set(templateData);
    console.log('✓ Created bellevueYPNT template document');
    
    // Step 3: Copy all daily readings
    console.log('\nStep 3: Copying daily readings to template...');
    
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;
    let totalCopied = 0;
    
    for (const doc of dailyReadingsSnapshot.docs) {
      const dayRef = db.collection('readingTemplates')
        .doc('bellevueYPNT')
        .collection('dailyReadings')
        .doc(doc.id);
      
      // Copy the data as-is (templates preserve original structure)
      batch.set(dayRef, {
        ...doc.data(),
        // Update timestamps for template
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      batchCount++;
      totalCopied++;
      
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✓ Copied batch of ${batchCount} daily readings`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✓ Copied final batch of ${batchCount} daily readings`);
    }
    
    console.log(`✅ Successfully copied ${totalCopied} daily readings to bellevueYPNT template`);
    
    // Step 4: Verify new template
    console.log('\nStep 4: Verifying template...');
    
    const templateDoc = await db.collection('readingTemplates').doc('bellevueYPNT').get();
    if (!templateDoc.exists) {
      throw new Error('Template document not created');
    }
    
    const templateDailyReadings = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ Template has ${templateDailyReadings.size} daily readings`);
    console.log('✓ Template document data:');
    console.log(`  Name: ${templateDoc.data().name}`);
    console.log(`  Description: ${templateDoc.data().description}`);
    console.log(`  Duration: ${templateDoc.data().durationDays} days`);
    console.log(`  Testament: ${templateDoc.data().testament}`);
    console.log(`  Is Template: ${templateDoc.data().isTemplate}`);
    
    // Show a few sample readings
    const sampleReadings = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .limit(3)
      .get();
    
    console.log('\n✓ Sample readings:');
    sampleReadings.forEach(doc => {
      const data = doc.data();
      console.log(`  Day ${data.dayNumber}: ${data.rawReading || `${data.startBookName} - ${data.endBookName}`}`);
    });
    
    console.log('\n🎉 Successfully created readingTemplates/bellevueYPNT template!');
    console.log('📋 This template can now be used to generate yearly reading plans');
    
  } catch (error) {
    console.error('❌ Error creating reading template:', error);
    throw error;
  }
}

if (require.main === module) {
  createReadingTemplate()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Template creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createReadingTemplate };