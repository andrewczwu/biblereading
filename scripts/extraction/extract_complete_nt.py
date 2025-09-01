#!/usr/bin/env python3
import pandas as pd
import json
from datetime import datetime, timedelta

def extract_complete_nt_schedule():
    # Read NT sheet 
    df = pd.read_excel(r'c:\Users\Andrew\Downloads\YP - Bible Reading Schedules 2024-2025.xlsx', sheet_name='NT - School year')
    
    reading_data = []
    day_counter = 1
    current_book = 'Matthew'  # Track current book for continuations
    
    # Start date for readings
    current_date = datetime(2024, 9, 16)  # Monday Sep 16, 2024
    
    # Process entire sheet looking for readings
    for row_idx in range(len(df)):
        row_data = df.iloc[row_idx].values
        
        # Check if this row has readings (contains : or book names)
        has_readings = False
        for val in row_data:
            if pd.notna(val) and isinstance(val, str):
                val_str = str(val)
                if ':' in val_str and not val_str in ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']:
                    has_readings = True
                    break
        
        if not has_readings:
            continue
            
        # Process each day in the row
        for day_idx in range(7):  # 0-6 for Sunday-Saturday
            if day_idx < len(row_data) and pd.notna(row_data[day_idx]):
                reading_val = str(row_data[day_idx]).strip()
                
                # Skip invalid entries
                if '☐' in reading_val or '\u2610' in reading_val:
                    continue
                if reading_val in ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']:
                    continue
                if reading_val == 'nan' or len(reading_val) < 2:
                    continue
                if not ':' in reading_val:
                    continue
                    
                # Parse the reading
                parsed_reading, current_book = parse_bible_reference(reading_val, current_book)
                
                if parsed_reading:
                    # Calculate day of week
                    day_of_week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][current_date.weekday() if current_date.weekday() < 6 else 6]
                    if day_idx == 0:
                        day_of_week = 'Sunday'
                    elif day_idx >= 1 and day_idx <= 6:
                        day_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day_idx - 1]
                    
                    day_data = {
                        'dayNumber': day_counter,
                        'date': current_date.strftime('%Y-%m-%d'),
                        'dayOfWeek': day_of_week,
                        'rawReading': reading_val,
                        'portions': parsed_reading
                    }
                    
                    reading_data.append(day_data)
                    day_counter += 1
                    current_date += timedelta(days=1)
    
    return reading_data

def parse_bible_reference(reading, previous_book='Matthew'):
    """Parse a Bible reading reference"""
    portions = []
    current_book = previous_book
    
    # Clean up the reading string
    reading = reading.replace('\u2013', '-').replace('\u2014', '-').replace('\u2010', '-').replace('\u2212', '-')
    reading = ''.join(c for c in reading if ord(c) < 128 or c.isalpha() or c.isdigit() or c in '.-: ')
    reading = reading.strip()
    
    if not reading or len(reading.strip()) < 2:
        return [], current_book
    
    try:
        # Check for book names in the reading
        book_mappings = [
            ('Matt. ', 'Matthew'),
            ('Mark ', 'Mark'),
            ('Luke ', 'Luke'),
            ('John ', 'John'),
            ('Acts ', 'Acts'),
            ('Rom. ', 'Romans'),
            ('Romans ', 'Romans'),
            ('1 Cor. ', '1 Corinthians'),
            ('2 Cor. ', '2 Corinthians'),
            ('Gal. ', 'Galatians'),
            ('Eph. ', 'Ephesians'),
            ('Phil. ', 'Philippians'),
            ('Col. ', 'Colossians'),
            ('1 Thes. ', '1 Thessalonians'),
            ('1 Thess. ', '1 Thessalonians'),
            ('2 Thes. ', '2 Thessalonians'),
            ('2 Thess. ', '2 Thessalonians'),
            ('1 Tim. ', '1 Timothy'),
            ('2 Tim. ', '2 Timothy'),
            ('Titus ', 'Titus'),
            ('Philem. ', 'Philemon'),
            ('Heb. ', 'Hebrews'),
            ('James ', 'James'),
            ('1 Pet. ', '1 Peter'),
            ('2 Pet. ', '2 Peter'),
            ('1 John ', '1 John'),
            ('2 John ', '2 John'),
            ('3 John ', '3 John'),
            ('Jude ', 'Jude'),
            ('Rev. ', 'Revelation')
        ]
        
        verse_part = reading
        for book_abbr, full_name in book_mappings:
            if book_abbr in reading:
                current_book = full_name
                # Remove book name from verse part
                verse_part = reading.replace(book_abbr, '').strip()
                break
        
        # Handle cross-book references (e.g., "21:19 - Acts 1:8")
        if '-' in verse_part:
            parts = verse_part.split('-')
            # Check if second part has a book name
            for book_abbr, full_name in book_mappings:
                if book_abbr in parts[-1]:
                    # This spans books, just use first part
                    verse_part = parts[0].strip()
                    break
        
        # Parse verse range
        if '-' in verse_part:
            parts = verse_part.split('-')
            start_ref = parts[0].strip()
            end_ref = parts[1].strip()
        else:
            start_ref = end_ref = verse_part
            
        # Parse start reference
        if ':' in start_ref:
            start_ch, start_v = start_ref.split(':', 1)
            start_chapter = int(start_ch.strip())
            start_verse = int(start_v.strip())
        else:
            start_chapter = int(start_ref.strip()) if start_ref.strip().isdigit() else 1
            start_verse = 1
            
        # Parse end reference  
        if ':' in end_ref:
            end_ch, end_v = end_ref.split(':', 1)
            end_chapter = int(end_ch.strip())
            end_verse = int(end_v.strip())
        else:
            if end_ref.strip().isdigit():
                end_chapter = int(end_ref.strip())
                end_verse = 999
            else:
                end_chapter = start_chapter
                end_verse = 999
        
        portion = {
            'bookName': current_book,
            'bookId': current_book.lower().replace(' ', ''),
            'startChapter': start_chapter,
            'startVerse': start_verse,
            'endChapter': end_chapter,
            'endVerse': end_verse,
            'portionOrder': 1
        }
        
        portions.append(portion)
        return portions, current_book
        
    except Exception as e:
        print(f"Error parsing '{reading}': {e}")
        return [], current_book

if __name__ == "__main__":
    try:
        print("Extracting complete NT reading schedule...")
        reading_data = extract_complete_nt_schedule()
        
        # Save to JSON file
        with open('nt_complete_schedule.json', 'w', encoding='utf-8') as f:
            json.dump(reading_data, f, indent=2, ensure_ascii=False)
        
        print(f"Extracted {len(reading_data)} daily readings")
        
        # Show summary
        if reading_data:
            print(f"\nFirst reading: Day {reading_data[0]['dayNumber']} ({reading_data[0]['date']}) - {reading_data[0]['rawReading']}")
            print(f"Last reading: Day {reading_data[-1]['dayNumber']} ({reading_data[-1]['date']}) - {reading_data[-1]['rawReading']}")
            
            # Check for book transitions
            books_found = []
            for day in reading_data:
                book = day['portions'][0]['bookName'] if day['portions'] else None
                if book and book not in books_found:
                    books_found.append(book)
                    print(f"  Day {day['dayNumber']}: Started {book}")
        
        print(f"\nData saved to nt_complete_schedule.json")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()