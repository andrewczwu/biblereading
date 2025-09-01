#!/usr/bin/env python3
import pandas as pd
import json
from datetime import datetime, timedelta

def extract_nt_reading_schedule():
    # Read NT sheet 
    df = pd.read_excel(r'c:\Users\Andrew\Downloads\YP - Bible Reading Schedules 2024-2025.xlsx', sheet_name='NT - School year')
    
    reading_data = []
    day_counter = 1
    
    # Start from row 5 which has the first week's readings
    current_date = datetime(2024, 9, 16)  # Monday Sep 16, 2024
    
    for row_idx in range(5, len(df)):
        row_data = df.iloc[row_idx].values
        
        # Check if this row has actual Bible reading data
        has_readings = False
        for col_idx in range(1, 7):  # Monday to Saturday
            if col_idx < len(row_data) and pd.notna(row_data[col_idx]):
                reading = str(row_data[col_idx]).strip()
                if reading and reading != 'nan':
                    has_readings = True
                    break
        
        if not has_readings:
            continue
            
        # Process each day of the week (Monday to Saturday)
        for day_idx in range(1, 7):  # Skip Sunday (index 0)
            if day_idx < len(row_data) and pd.notna(row_data[day_idx]):
                reading = str(row_data[day_idx]).strip()
                # Skip checkbox cells and empty cells
                if reading and reading != 'nan' and '☐' not in reading and '\u2610' not in reading:
                    # Parse the reading to extract book, chapters, verses
                    parsed_reading = parse_bible_reference(reading)
                    
                    # Only add if we successfully parsed the reading
                    if parsed_reading and not (len(parsed_reading) == 1 and parsed_reading[0].get('parseError')):
                        day_data = {
                            'dayNumber': day_counter,
                            'date': current_date.strftime('%Y-%m-%d'),
                            'dayOfWeek': current_date.strftime('%A'),
                            'rawReading': reading,
                            'portions': parsed_reading
                        }
                        
                        reading_data.append(day_data)
                        day_counter += 1
                    current_date += timedelta(days=1)
                else:
                    # Skip this day but still increment date
                    current_date += timedelta(days=1)
            else:
                # Skip this day but still increment date
                current_date += timedelta(days=1)
        
        # Skip Sunday
        if current_date.weekday() == 6:  # Sunday
            current_date += timedelta(days=1)
    
    return reading_data

def parse_bible_reference(reading):
    """Parse a Bible reading reference like 'Matt. 1:1 - 1:6' or '1:7 - 1:17'"""
    # This is a simplified parser - you might need to enhance it
    portions = []
    
    # Clean up the reading string - remove special unicode characters
    reading = reading.replace('\u2013', '-').replace('\u2010', '-').replace('\u2212', '-')
    reading = ''.join(c for c in reading if ord(c) < 128 or c.isalpha() or c.isdigit() or c in '.-: ')
    reading = reading.strip()
    
    # Skip empty or invalid readings or checkbox cells or day names
    days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    if not reading or len(reading.strip()) < 2 or '☐' in reading or '\u2610' in reading or reading in days_of_week:
        return []
    
    try:
        # Handle cases like "Matt. 1:1 - 1:6" vs "1:7 - 1:17"
        if '.' in reading:
            # Full book name present
            parts = reading.split('.')
            book_part = parts[0].strip()
            verse_part = parts[1].strip() if len(parts) > 1 else ''
            
            # Map common abbreviations
            book_mapping = {
                'Matt': 'Matthew',
                'Mark': 'Mark', 
                'Luke': 'Luke',
                'John': 'John',
                'Acts': 'Acts',
                'Rom': 'Romans',
                '1 Cor': '1 Corinthians',
                '2 Cor': '2 Corinthians',
                'Gal': 'Galatians',
                'Eph': 'Ephesians',
                'Phil': 'Philippians',
                'Col': 'Colossians',
                '1 Thess': '1 Thessalonians',
                '2 Thess': '2 Thessalonians',
                '1 Tim': '1 Timothy',
                '2 Tim': '2 Timothy',
                'Titus': 'Titus',
                'Philem': 'Philemon',
                'Heb': 'Hebrews',
                'James': 'James',
                '1 Pet': '1 Peter',
                '2 Pet': '2 Peter',
                '1 John': '1 John',
                '2 John': '2 John', 
                '3 John': '3 John',
                'Jude': 'Jude',
                'Rev': 'Revelation'
            }
            
            book_name = book_mapping.get(book_part, book_part)
        else:
            # Continuation of previous book
            book_name = 'Matthew'  # Default - you'd want to track this properly
            verse_part = reading
        
        # Parse verse range like "1:1 - 1:6"
        if '-' in verse_part:
            parts = verse_part.split('-')
            start_ref = parts[0].strip()
            end_ref = parts[1].strip()
            
            # Parse start reference
            if ':' in start_ref:
                start_ch, start_v = start_ref.split(':')
                start_chapter = int(start_ch.strip())
                start_verse = int(start_v.strip())
            else:
                start_chapter = int(start_ref.strip())
                start_verse = 1
                
            # Parse end reference  
            if ':' in end_ref:
                end_ch, end_v = end_ref.split(':')
                end_chapter = int(end_ch.strip())
                end_verse = int(end_v.strip())
            else:
                end_chapter = int(end_ref.strip())
                end_verse = 999  # Assume end of chapter
        else:
            # Single verse reference
            if ':' in verse_part:
                ch, v = verse_part.split(':')
                start_chapter = end_chapter = int(ch.strip())
                start_verse = end_verse = int(v.strip())
            else:
                start_chapter = end_chapter = int(verse_part.strip())
                start_verse = 1
                end_verse = 999
        
        portion = {
            'bookName': book_name,
            'bookId': book_name.lower().replace(' ', ''),
            'startChapter': start_chapter,
            'startVerse': start_verse,
            'endChapter': end_chapter,
            'endVerse': end_verse,
            'portionOrder': 1
        }
        
        portions.append(portion)
        return portions
        
    except Exception as e:
        print(f"Error parsing reference '{reading}': {e}")
        # Return a fallback portion
        return [{
            'bookName': 'Matthew',
            'bookId': 'matthew',
            'startChapter': 1,
            'startVerse': 1,
            'endChapter': 1,
            'endVerse': 1,
            'portionOrder': 1,
            'parseError': True,
            'originalText': reading
        }]

if __name__ == "__main__":
    try:
        print("Extracting NT reading schedule...")
        reading_data = extract_nt_reading_schedule()
        
        # Save to JSON file
        with open('nt_reading_schedule.json', 'w', encoding='utf-8') as f:
            json.dump(reading_data, f, indent=2, ensure_ascii=False)
        
        print(f"Extracted {len(reading_data)} daily readings")
        print("First 3 entries:")
        for i, entry in enumerate(reading_data[:3]):
            print(f"Day {entry['dayNumber']}: {entry['date']} - {entry['rawReading']}")
        
        print("Data saved to nt_reading_schedule.json")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()