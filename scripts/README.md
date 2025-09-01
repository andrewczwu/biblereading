# Bible Reading Schedule Scripts

This folder contains all utility scripts used to process and validate the Young People's New Testament reading schedule.

## Folder Structure

### `/extraction`
Python scripts for extracting data from the Excel source file:
- `extract_excel_data.py` - Initial extraction script
- `extract_excel_data_fixed.py` - Fixed version with checkbox filtering
- `extract_complete_nt.py` - Complete extraction through Revelation

### `/validation`
Scripts for validating the reading schedule coverage:
- `validate_reading_schedule.js` - Basic validation of verse references
- `validate_nt_coverage.js` - Complete NT coverage validation
- `validate_crossbook_coverage.js` - Validation with cross-book support
- `final_validation.js` - Comprehensive final validation checks

### `/fixes`
Scripts for fixing specific issues in the data:
- `fix_crossbook_refs.js` - Fix cross-book reference issues
- `fix_2peter_attribution.js` - Fix 2 Peter book attribution
- `fix_corinthians_transition.js` - Fix 1-2 Corinthians transition (Day 163)
- `update_crossbook_schema.js` - Update schema with cross-book transitions

### `/utilities`
General utility scripts:
- `analyze_duplicates.js` - Analyze duplicate verse coverage
- `cleanup_excess_days.js` - Remove excess days from Firebase
- `check_specific_days.js` - Check specific days for debugging
- `ensure_all_book_fields.js` - Ensure all days have book fields
- `get_books_data.js` - Get Bible book structure data

## Key Files in Root

### Essential Files (Keep in root)
- `upload_nt_schedule.js` - Main script to upload schedule to Firebase
- `nt_reading_schedule_crossbook.json` - Final validated schedule data
- `firebase-bible-schema.js` - Firebase schema reference
- `.env` - Environment variables (API keys)
- `config/` - Firebase configuration
- `server.js` - Express server
- `package.json` - Node dependencies

### Temporary Data
The `/temp_data` folder contains intermediate JSON files from processing steps. These can be deleted if not needed for debugging.

## Usage

1. **Extract data from Excel**: Run extraction scripts from `/extraction`
2. **Validate coverage**: Run validation scripts from `/validation`
3. **Fix issues**: Use scripts in `/fixes` as needed
4. **Upload to Firebase**: Run `upload_nt_schedule.js` from root

## Final Schedule Details

- **Total Days**: 299 (Sept 16, 2024 - July 11, 2025)
- **Coverage**: Complete NT (Matthew 1:1 - Revelation 22:21)
- **Cross-book days**: 21 transitions properly handled
- **Duplicate verses**: 117 (mostly at book transitions)