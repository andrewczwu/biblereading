const fs = require('fs');

// Bible verse counts for validation
const bibleBooks = {
  'acts': { maxChapters: 28, chapters: { 28: 31 } },
  'romans': { maxChapters: 16 },
  'ephesians': { maxChapters: 6, chapters: { 6: 24 } },
  'philippians': { maxChapters: 4 },
  '1corinthians': { maxChapters: 16, chapters: { 5: 13, 13: 13 } },
  '2corinthians': { maxChapters: 13 },
  '1thessalonians': { maxChapters: 5 },
  '2thessalonians': { maxChapters: 3 },
  '1timothy': { maxChapters: 6 },
  '2timothy': { maxChapters: 4 },
  'titus': { maxChapters: 3 },
  'philemon': { maxChapters: 1 },
  'james': { maxChapters: 5 },
  '1john': { maxChapters: 5, chapters: { 2: 29 } }
};

function fixCrossBookReferences() {
  const data = JSON.parse(fs.readFileSync('nt_complete_schedule.json', 'utf8'));
  
  // Define fixes for specific problematic days
  const fixes = [
    // Day 124: Acts 28:11 - Rom 1:2 should be Acts 28:11-31
    {
      dayNumber: 124,
      book: 'Acts',
      bookId: 'acts',
      startChapter: 28,
      startVerse: 11,
      endChapter: 28,
      endVerse: 31
    },
    // Day 125 should start Romans
    {
      dayNumber: 125,
      book: 'Romans',
      bookId: 'romans'
    },
    // Day 167: 1 Cor 4:14 - 5:15 should be 4:14 - 5:13
    {
      dayNumber: 167,
      endVerse: 13
    },
    // Day 168: 1 Cor 5:16 - should start 2 Corinthians
    {
      dayNumber: 168,
      book: '2 Corinthians',
      bookId: '2corinthians',
      startChapter: 1,
      startVerse: 1
    },
    // Day 196: Eph 6:21 - Phil 1:18 should be Eph 6:21-24
    {
      dayNumber: 196,
      book: 'Ephesians',
      bookId: 'ephesians',
      startChapter: 6,
      startVerse: 21,
      endChapter: 6,
      endVerse: 24
    },
    // Day 197 should start Philippians
    {
      dayNumber: 197,
      book: 'Philippians',
      bookId: 'philippians',
      startChapter: 1,
      startVerse: 1
    },
    // Day 218: 1 Tim 6:21 - 2 Tim 1:14 should be 1 Tim 6:21 end
    {
      dayNumber: 218,
      book: '1 Timothy',
      bookId: '1timothy',
      startChapter: 6,
      startVerse: 21,
      endChapter: 6,
      endVerse: 21
    },
    // Day 219 should start 2 Timothy
    {
      dayNumber: 219,
      book: '2 Timothy',
      bookId: '2timothy',
      startChapter: 1,
      startVerse: 1
    },
    // Day 221: 2 Tim 4:9 - Titus 1:4 should be 2 Tim 4:9 end
    {
      dayNumber: 221,
      book: '2 Timothy',
      bookId: '2timothy',
      startChapter: 4,
      startVerse: 9,
      endChapter: 4,
      endVerse: 22
    },
    // Day 222 should start Titus
    {
      dayNumber: 222,
      book: 'Titus',
      bookId: 'titus',
      startChapter: 1,
      startVerse: 1
    },
    // Day 224: Titus 3:9 - Philem 1:3 should be Titus 3:9 end
    {
      dayNumber: 224,
      book: 'Titus',
      bookId: 'titus',
      startChapter: 3,
      startVerse: 9,
      endChapter: 3,
      endVerse: 15
    },
    // Day 225 should start Philemon
    {
      dayNumber: 225,
      book: 'Philemon',
      bookId: 'philemon',
      startChapter: 1,
      startVerse: 1
    },
    // Day 241: Heb 13:13 - James 1:1 should be Heb 13:13 end
    {
      dayNumber: 241,
      book: 'Hebrews',
      bookId: 'hebrews',
      startChapter: 13,
      startVerse: 13,
      endChapter: 13,
      endVerse: 25
    },
    // Day 242 should start James
    {
      dayNumber: 242,
      book: 'James',
      bookId: 'james',
      startChapter: 1,
      startVerse: 1
    },
    // Day 270: 1 John 5:7-20 (then 2 John starts)
    {
      dayNumber: 270,
      book: '1 John',
      bookId: '1john',
      startChapter: 5,
      startVerse: 7,
      endChapter: 5,
      endVerse: 20
    },
    // Day 271: Complex cross-book "1:9 - Jude 1:12" = 2 John 1:9 through Jude 1:12
    // Let's just make it 2 John 1:9-13 (all of 2 John)
    {
      dayNumber: 271,
      book: '2 John',
      bookId: '2john',
      startChapter: 1,
      startVerse: 9,
      endChapter: 1,
      endVerse: 13
    }
  ];
  
  // Apply fixes
  fixes.forEach(fix => {
    const dayIndex = fix.dayNumber - 1;
    if (dayIndex < data.length) {
      const day = data[dayIndex];
      if (day.portions && day.portions.length > 0) {
        const portion = day.portions[0];
        
        if (fix.book) portion.bookName = fix.book;
        if (fix.bookId) portion.bookId = fix.bookId;
        if (fix.startChapter) portion.startChapter = fix.startChapter;
        if (fix.startVerse) portion.startVerse = fix.startVerse;
        if (fix.endChapter) portion.endChapter = fix.endChapter;
        if (fix.endVerse) portion.endVerse = fix.endVerse;
        
        console.log(`Fixed Day ${fix.dayNumber}: ${portion.bookName} ${portion.startChapter}:${portion.startVerse}-${portion.endChapter}:${portion.endVerse}`);
      }
    }
  });
  
  // Now fix book attribution errors for days after cross-book references
  let currentBook = 'Matthew';
  let currentBookId = 'matthew';
  
  for (let i = 0; i < data.length; i++) {
    const day = data[i];
    if (day.portions && day.portions.length > 0) {
      const portion = day.portions[0];
      
      // Update current book tracking when we see a new book explicitly
      const bookTransitions = [
        { dayNum: 39, book: 'Mark', id: 'mark' },
        { dayNum: 54, book: 'Luke', id: 'luke' },
        { dayNum: 76, book: 'John', id: 'john' },
        { dayNum: 98, book: 'Acts', id: 'acts' },
        { dayNum: 125, book: 'Romans', id: 'romans' },
        { dayNum: 143, book: '1 Corinthians', id: '1corinthians' },
        { dayNum: 168, book: '2 Corinthians', id: '2corinthians' },
        { dayNum: 174, book: 'Galatians', id: 'galatians' },
        { dayNum: 183, book: 'Ephesians', id: 'ephesians' },
        { dayNum: 197, book: 'Philippians', id: 'philippians' },
        { dayNum: 202, book: 'Colossians', id: 'colossians' },
        { dayNum: 207, book: '1 Thessalonians', id: '1thessalonians' },
        { dayNum: 211, book: '2 Thessalonians', id: '2thessalonians' },
        { dayNum: 212, book: '1 Timothy', id: '1timothy' },
        { dayNum: 219, book: '2 Timothy', id: '2timothy' },
        { dayNum: 222, book: 'Titus', id: 'titus' },
        { dayNum: 225, book: 'Philemon', id: 'philemon' },
        { dayNum: 226, book: 'Hebrews', id: 'hebrews' },
        { dayNum: 242, book: 'James', id: 'james' },
        { dayNum: 246, book: '1 Peter', id: '1peter' },
        { dayNum: 255, book: '2 Peter', id: '2peter' },
        { dayNum: 258, book: '1 John', id: '1john' },
        { dayNum: 271, book: '2 John', id: '2john' },
        { dayNum: 272, book: '3 John', id: '3john' },
        { dayNum: 273, book: 'Jude', id: 'jude' },
        { dayNum: 274, book: 'Revelation', id: 'revelation' }
      ];
      
      const transition = bookTransitions.find(t => t.dayNum === day.dayNumber);
      if (transition) {
        currentBook = transition.book;
        currentBookId = transition.id;
      }
      
      // Apply current book if the portion has wrong book
      if (portion.bookName !== currentBook) {
        console.log(`Day ${day.dayNumber}: Correcting book from ${portion.bookName} to ${currentBook}`);
        portion.bookName = currentBook;
        portion.bookId = currentBookId;
      }
    }
  }
  
  // Save the fixed data
  fs.writeFileSync('nt_complete_schedule_fixed.json', JSON.stringify(data, null, 2));
  console.log(`Fixed schedule saved to nt_complete_schedule_fixed.json`);
}

if (require.main === module) {
  fixCrossBookReferences();
}