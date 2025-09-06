export interface BibleBookInfo {
  number: number;
  name: string;
  abbreviation: string;
}

export const bibleBooks: Record<string, BibleBookInfo> = {
  // Old Testament
  'Genesis': { number: 1, name: 'Genesis', abbreviation: 'Gen' },
  'Exodus': { number: 2, name: 'Exodus', abbreviation: 'Exo' },
  'Leviticus': { number: 3, name: 'Leviticus', abbreviation: 'Lev' },
  'Numbers': { number: 4, name: 'Numbers', abbreviation: 'Num' },
  'Deuteronomy': { number: 5, name: 'Deuteronomy', abbreviation: 'Deu' },
  'Joshua': { number: 6, name: 'Joshua', abbreviation: 'Jos' },
  'Judges': { number: 7, name: 'Judges', abbreviation: 'Jdg' },
  'Ruth': { number: 8, name: 'Ruth', abbreviation: 'Rut' },
  '1 Samuel': { number: 9, name: '1Samuel', abbreviation: '1Sa' },
  '2 Samuel': { number: 10, name: '2Samuel', abbreviation: '2Sa' },
  '1 Kings': { number: 11, name: '1Kings', abbreviation: '1Ki' },
  '2 Kings': { number: 12, name: '2Kings', abbreviation: '2Ki' },
  '1 Chronicles': { number: 13, name: '1Chronicles', abbreviation: '1Ch' },
  '2 Chronicles': { number: 14, name: '2Chronicles', abbreviation: '2Ch' },
  'Ezra': { number: 15, name: 'Ezra', abbreviation: 'Ezr' },
  'Nehemiah': { number: 16, name: 'Nehemiah', abbreviation: 'Neh' },
  'Esther': { number: 17, name: 'Esther', abbreviation: 'Est' },
  'Job': { number: 18, name: 'Job', abbreviation: 'Job' },
  'Psalms': { number: 19, name: 'Psalms', abbreviation: 'Psa' },
  'Proverbs': { number: 20, name: 'Proverbs', abbreviation: 'Pro' },
  'Ecclesiastes': { number: 21, name: 'Ecclesiastes', abbreviation: 'Ecc' },
  'Song of Songs': { number: 22, name: 'SongofSongs', abbreviation: 'Son' },
  'Isaiah': { number: 23, name: 'Isaiah', abbreviation: 'Isa' },
  'Jeremiah': { number: 24, name: 'Jeremiah', abbreviation: 'Jer' },
  'Lamentations': { number: 25, name: 'Lamentations', abbreviation: 'Lam' },
  'Ezekiel': { number: 26, name: 'Ezekiel', abbreviation: 'Eze' },
  'Daniel': { number: 27, name: 'Daniel', abbreviation: 'Dan' },
  'Hosea': { number: 28, name: 'Hosea', abbreviation: 'Hos' },
  'Joel': { number: 29, name: 'Joel', abbreviation: 'Joe' },
  'Amos': { number: 30, name: 'Amos', abbreviation: 'Amo' },
  'Obadiah': { number: 31, name: 'Obadiah', abbreviation: 'Oba' },
  'Jonah': { number: 32, name: 'Jonah', abbreviation: 'Jon' },
  'Micah': { number: 33, name: 'Micah', abbreviation: 'Mic' },
  'Nahum': { number: 34, name: 'Nahum', abbreviation: 'Nah' },
  'Habakkuk': { number: 35, name: 'Habakkuk', abbreviation: 'Hab' },
  'Zephaniah': { number: 36, name: 'Zephaniah', abbreviation: 'Zep' },
  'Haggai': { number: 37, name: 'Haggai', abbreviation: 'Hag' },
  'Zechariah': { number: 38, name: 'Zechariah', abbreviation: 'Zec' },
  'Malachi': { number: 39, name: 'Malachi', abbreviation: 'Mal' },
  
  // New Testament
  'Matthew': { number: 40, name: 'Matthew', abbreviation: 'Mat' },
  'Mark': { number: 41, name: 'Mark', abbreviation: 'Mar' },
  'Luke': { number: 42, name: 'Luke', abbreviation: 'Luk' },
  'John': { number: 43, name: 'John', abbreviation: 'Joh' },
  'Acts': { number: 44, name: 'Acts', abbreviation: 'Act' },
  'Romans': { number: 45, name: 'Romans', abbreviation: 'Rom' },
  '1 Corinthians': { number: 46, name: '1Corinthians', abbreviation: '1Co' },
  '2 Corinthians': { number: 47, name: '2Corinthians', abbreviation: '2Co' },
  'Galatians': { number: 48, name: 'Galatians', abbreviation: 'Gal' },
  'Ephesians': { number: 49, name: 'Ephesians', abbreviation: 'Eph' },
  'Philippians': { number: 50, name: 'Philippians', abbreviation: 'Phi' },
  'Colossians': { number: 51, name: 'Colossians', abbreviation: 'Col' },
  '1 Thessalonians': { number: 52, name: '1Thessalonians', abbreviation: '1Th' },
  '2 Thessalonians': { number: 53, name: '2Thessalonians', abbreviation: '2Th' },
  '1 Timothy': { number: 54, name: '1Timothy', abbreviation: '1Ti' },
  '2 Timothy': { number: 55, name: '2Timothy', abbreviation: '2Ti' },
  'Titus': { number: 56, name: 'Titus', abbreviation: 'Tit' },
  'Philemon': { number: 57, name: 'Philemon', abbreviation: 'Phm' },
  'Hebrews': { number: 58, name: 'Hebrews', abbreviation: 'Heb' },
  'James': { number: 59, name: 'James', abbreviation: 'Jam' },
  '1 Peter': { number: 60, name: '1Peter', abbreviation: '1Pe' },
  '2 Peter': { number: 61, name: '2Peter', abbreviation: '2Pe' },
  '1 John': { number: 62, name: '1John', abbreviation: '1Jo' },
  '2 John': { number: 63, name: '2John', abbreviation: '2Jo' },
  '3 John': { number: 64, name: '3John', abbreviation: '3Jo' },
  'Jude': { number: 65, name: 'Jude', abbreviation: 'Jud' },
  'Revelation': { number: 66, name: 'Revelation', abbreviation: 'Rev' }
};

/**
 * Parse a reading label (e.g., "Romans 7:1-12" or "Romans 7:1-8:5") and return the URL components
 */
export function parseReadingLabel(label: string): {
  bookNumber: number;
  bookName: string;
  chapter: number;
  startVerse: number;
  endVerse?: number;
  abbreviation: string;
} | null {
  console.log('Parsing reading label:', label);
  
  // Match patterns:
  // "Book Chapter:Verse" - single verse
  // "Book Chapter:StartVerse-EndVerse" - verses in same chapter
  // "Book Chapter:StartVerse-EndChapter:EndVerse" - verses across chapters
  const singleChapterMatch = label.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  const multiChapterMatch = label.match(/^(.+?)\s+(\d+):(\d+)-(\d+):(\d+)$/);
  
  let bookName: string, chapter: string, startVerse: string, endVerse: string | undefined;
  
  if (multiChapterMatch) {
    // Multi-chapter reference: use the first chapter and verse
    [, bookName, chapter, startVerse] = multiChapterMatch;
    console.log('Multi-chapter match:', { bookName, chapter, startVerse });
  } else if (singleChapterMatch) {
    // Single chapter reference
    [, bookName, chapter, startVerse, endVerse] = singleChapterMatch;
    console.log('Single-chapter match:', { bookName, chapter, startVerse, endVerse });
  } else {
    console.error('No match found for label:', label);
    return null;
  }

  const bookInfo = bibleBooks[bookName.trim()];
  
  if (!bookInfo) {
    console.error('Book not found:', bookName.trim());
    console.log('Available books:', Object.keys(bibleBooks));
    return null;
  }

  const result = {
    bookNumber: bookInfo.number,
    bookName: bookInfo.name,
    chapter: parseInt(chapter),
    startVerse: parseInt(startVerse),
    endVerse: endVerse ? parseInt(endVerse) : undefined,
    abbreviation: bookInfo.abbreviation
  };
  
  console.log('Parsed result:', result);
  return result;
}

/**
 * Generate the Recovery Version Bible URL from a reading label
 */
export function generateBibleUrl(label: string): string | null {
  const parsed = parseReadingLabel(label);
  if (!parsed) return null;

  const { bookNumber, bookName, chapter, startVerse, abbreviation } = parsed;
  
  // Format: 45_Romans_7.htm#Rom7-2
  const path = `${bookNumber}_${bookName}_${chapter}.htm`;
  const hash = `${abbreviation}${chapter}-${startVerse}`;
  
  return `https://text.recoveryversion.bible/${path}#${hash}`;
}