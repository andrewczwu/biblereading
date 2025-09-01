#!/usr/bin/env python3
import pandas as pd
import json
from datetime import datetime, timedelta

def extract_nt_reading_schedule():
    # Read NT sheet 
    df = pd.read_excel(r'c:\Users\Andrew\Downloads\YP - Bible Reading Schedules 2024-2025.xlsx', sheet_name='NT - School year')
    
    reading_data = []
    day_counter = 1
    
    # The structure is:
    # Row 3: Day headers (Sunday-Saturday)
    # Row 4: First week dates (missing Sunday)
    # Row 5: First week readings (missing Sunday)
    # Row 7: Second week dates (has Sunday) 
    # Row 8: Second week readings (has Sunday)
    # Pattern continues every 3 rows: dates row, readings row, blank row
    
    current_book = 'Matthew'  # Track current book for continuations
    
    # Process first week specially (no Sunday)
    first_week_dates = df.iloc[4].values  # Monday-Saturday dates
    first_week_readings = df.iloc[5].values  # Monday-Saturday readings
    
    # Process first week (Monday-Saturday only)
    for day_idx in range(1, 7):  # Columns 1-6 for Mon-Sat
        if day_idx < len(first_week_dates) and pd.notna(first_week_dates[day_idx]):
            date_val = pd.to_datetime(first_week_dates[day_idx])
            
            if day_idx < len(first_week_readings) and pd.notna(first_week_readings[day_idx]):
                reading_val = str(first_week_readings[day_idx]).strip()
                
                # Skip invalid readings
                if '☐' not in reading_val and '\u2610' not in reading_val and reading_val != 'nan' and len(reading_val) > 2:
                    parsed_reading, current_book = parse_bible_reference(reading_val, current_book)
                    
                    if parsed_reading:
                        day_data = {
                            'dayNumber': day_counter,
                            'date': date_val.strftime('%Y-%m-%d'),
                            'dayOfWeek': date_val.strftime('%A'),
                            'rawReading': reading_val,
                            'portions': parsed_reading
                        }
                        reading_data.append(day_data)
                        day_counter += 1
    
    # Now process remaining weeks (starting from row 7)
    # Continue through the entire spreadsheet (NT continues into 2025)
    row_idx = 7
    while row_idx < len(df):
        date_row = df.iloc[row_idx].values
        reading_row = df.iloc[row_idx + 1].values if row_idx + 1 < len(df) else None
        
        if reading_row is None:
            break
            
        # Check if this is actually a date/reading pair
        has_dates = any(pd.notna(val) and isinstance(val, (datetime, pd.Timestamp)) for val in date_row)
        if not has_dates:
            # Try to find next date row - pattern is every 3 rows
            row_idx += 3
            continue
        
        # Process each day of the week (Sunday through Saturday)
        for day_idx in range(7):  # Process all 7 days (column 0-6)
            # Get date
            date_val = None
            if day_idx < len(date_row) and pd.notna(date_row[day_idx]):
                if isinstance(date_row[day_idx], (datetime, pd.Timestamp)):
                    date_val = pd.to_datetime(date_row[day_idx])
            
            # Get reading
            reading_val = None
            if day_idx < len(reading_row) and pd.notna(reading_row[day_idx]):
                reading_val = str(reading_row[day_idx]).strip()
                # Skip checkbox cells and day names
                if '☐' in reading_val or '\u2610' in reading_val:
                    reading_val = None
                elif reading_val in ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']:
                    reading_val = None
                elif reading_val == 'nan' or len(reading_val) < 2:
                    reading_val = None
            
            # If we have a date and valid reading, add it
            if date_val and reading_val:
                # Parse the reading
                parsed_reading, current_book = parse_bible_reference(reading_val, current_book)
                
                if parsed_reading:
                    day_data = {
                        'dayNumber': day_counter,
                        'date': date_val.strftime('%Y-%m-%d'),
                        'dayOfWeek': date_val.strftime('%A'),
                        'rawReading': reading_val,
                        'portions': parsed_reading
                    }
                    
                    reading_data.append(day_data)
                    day_counter += 1
        
        # Move to next week (3 rows: date row, reading row, blank row)
        row_idx += 3
    
    return reading_data

def parse_bible_reference(reading, previous_book='Matthew'):
    """Parse a Bible reading reference like 'Matt. 1:1 - 1:6' or '1:7 - 1:17'"""
    portions = []
    current_book = previous_book
    
    # Clean up the reading string
    reading = reading.replace('\u2013', '-').replace('\u2014', '-').replace('\u2010', '-').replace('\u2212', '-')
    reading = ''.join(c for c in reading if ord(c) < 128 or c.isalpha() or c.isdigit() or c in '.-: ')
    reading = reading.strip()
    
    # Skip invalid readings
    if not reading or len(reading.strip()) < 2:
        return [], current_book
    
    try:
        # Check if a book name is embedded in the reading (like in "Mark 1:1 - 1:13")
        # This happens when transitioning to a new book
        book_found = False
        verse_part = reading
        
        # Check for book names within the reading
        for book_abbr, full_name in [
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
            ('1 Thess. ', '1 Thessalonians'),
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
        ]:
            if reading.startswith(book_abbr):
                current_book = full_name
                verse_part = reading[len(book_abbr):].strip()
                book_found = True
                break
        
        # If no embedded book name, check for traditional format with period
        if not book_found and '.' in reading:
            # Full book name present in traditional format
            parts = reading.split('.', 1)
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
            
            current_book = book_mapping.get(book_part, book_part)
        
        # Handle cross-book references like "21:19 - Acts 1:8"
        if '-' in verse_part:
            parts = verse_part.split('-')
            # Check if the second part contains a book name
            second_part = parts[1].strip() if len(parts) > 1 else ''
            for book_check in ['Acts', 'Rom', 'Cor', 'Gal', 'Eph', 'Phil', 'Col', 'Thess', 'Tim', 'Titus', 'Philem', 'Heb', 'James', 'Pet', 'John', 'Jude', 'Rev']:
                if book_check in second_part:
                    # This is a cross-book reference
                    # For now, just use the first part for this reading
                    # The next day should start with the new book
                    verse_part = parts[0].strip()
                    # Extract the new book name for the next reading
                    for book_abbr, full_name in [
                        ('Acts ', 'Acts'),
                        ('Rom. ', 'Romans'),
                        ('1 Cor. ', '1 Corinthians'),
                        ('2 Cor. ', '2 Corinthians'),
                        ('Gal. ', 'Galatians'),
                        ('Eph. ', 'Ephesians'),
                        ('Phil. ', 'Philippians'),
                        ('Col. ', 'Colossians'),
                        ('1 Thess. ', '1 Thessalonians'),
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
                    ]:
                        if book_abbr in second_part:
                            # Store this for the next reading
                            # Note: We're not actually changing the book here,
                            # just noting that the next reading will be from a new book
                            break
                    break
        
        # Parse verse range like "1:1 - 1:6"
        if '-' in verse_part:
            parts = verse_part.split('-')
            start_ref = parts[0].strip()
            end_ref = parts[1].strip() if len(parts) > 1 else start_ref
            
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
                    end_verse = 999  # Assume end of chapter
                else:
                    end_chapter = start_chapter
                    end_verse = 999
        else:
            # Single chapter or verse reference
            if ':' in verse_part:
                ch, v = verse_part.split(':', 1)
                start_chapter = end_chapter = int(ch.strip())
                start_verse = end_verse = int(v.strip())
            else:
                if verse_part.strip().isdigit():
                    start_chapter = end_chapter = int(verse_part.strip())
                    start_verse = 1
                    end_verse = 999
                else:
                    return [], current_book
        
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
        print(f"Error parsing reference '{reading}': {e}")
        return [], current_book

if __name__ == "__main__":
    try:
        print("Extracting NT reading schedule...")
        reading_data = extract_nt_reading_schedule()
        
        # Save to JSON file
        with open('nt_reading_schedule_fixed.json', 'w', encoding='utf-8') as f:
            json.dump(reading_data, f, indent=2, ensure_ascii=False)
        
        print(f"Extracted {len(reading_data)} daily readings")
        
        # Show first 15 entries to verify
        print("\nFirst 15 entries:")
        for i, entry in enumerate(reading_data[:15]):
            print(f"Day {entry['dayNumber']:3}: {entry['date']} ({entry['dayOfWeek']:9}) - {entry['rawReading']}")
        
        # Check for specific dates
        print("\nChecking specific dates:")
        for date_check in ['2024-09-22', '2024-10-06']:
            found = [d for d in reading_data if d['date'] == date_check]
            if found:
                print(f"  {date_check}: Found - {found[0]['rawReading']}")
            else:
                print(f"  {date_check}: NOT FOUND")
        
        print(f"\nData saved to nt_reading_schedule_fixed.json")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()