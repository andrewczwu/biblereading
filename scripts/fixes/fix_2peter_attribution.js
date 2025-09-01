const fs = require('fs');

function fix2PeterAttribution() {
  console.log('Fixing 2 Peter book attribution for days 258-259...');
  
  const data = JSON.parse(fs.readFileSync('nt_reading_schedule_crossbook.json', 'utf8'));
  
  // Fix day 258: should be 2 Peter 2:10 - 3:6
  const day258 = data.find(d => d.dayNumber === 258);
  if (day258) {
    day258.portions[0].bookName = '2 Peter';
    day258.portions[0].bookId = '2peter';
    day258.startBookName = '2 Peter';
    day258.startBookId = '2peter';
    day258.endBookName = '2 Peter';
    day258.endBookId = '2peter';
    console.log(`Fixed Day 258: 2 Peter 2:10 - 3:6`);
  }
  
  // Fix day 259: should be 2 Peter 3:7 - 3:12
  const day259 = data.find(d => d.dayNumber === 259);
  if (day259) {
    day259.portions[0].bookName = '2 Peter';
    day259.portions[0].bookId = '2peter';
    day259.startBookName = '2 Peter';
    day259.startBookId = '2peter';
    day259.endBookName = '2 Peter';
    day259.endBookId = '2peter';
    console.log(`Fixed Day 259: 2 Peter 3:7 - 3:12`);
  }
  
  // Fix day 260: should be 2 Peter 3:13 - 3:16 (not cross-book)
  const day260 = data.find(d => d.dayNumber === 260);
  if (day260) {
    day260.portions[0].bookName = '2 Peter';
    day260.portions[0].bookId = '2peter';
    day260.startBookName = '2 Peter';
    day260.startBookId = '2peter';
    day260.endBookName = '2 Peter';
    day260.endBookId = '2peter';
    console.log(`Fixed Day 260: 2 Peter 3:13 - 3:16`);
  }
  
  // Save the fixed data
  fs.writeFileSync('nt_reading_schedule_crossbook.json', JSON.stringify(data, null, 2));
  console.log('✅ Fixed 2 Peter attribution and saved updated data');
}

if (require.main === module) {
  fix2PeterAttribution();
}

module.exports = { fix2PeterAttribution };