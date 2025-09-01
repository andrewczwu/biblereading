# API Test Scripts

This directory contains test scripts to validate all API endpoints documented in the Bible Reading Schedule API.

## Prerequisites

1. **Node.js** installed (v14 or higher)
2. **Firebase project** configured with Firestore
3. **API server** running (typically on `http://localhost:3000`)
4. **Test data** - The tests will create and clean up their own test data

## Setup

1. Install dependencies (if not already installed):
```bash
cd E:\Project\biblereading
npm install axios
npm install --save-dev jest
```

2. Update the API base URL in test files if your server runs on a different port:
   - Look for `const API_BASE_URL` in each test file
   - Default is `http://localhost:3000/api`

3. Ensure your Firebase configuration is set up and the server can connect to Firestore

## Running Tests

### Run All Tests
```bash
# From the project root directory
cd E:\Project\biblereading
node tests/run-all-tests.js
```

### Run Individual Test Suites
```bash
# User Profile Tests
node tests/test-user-profile.js

# Individual Schedule Tests  
node tests/test-individual-schedules.js

# Group Schedule Tests
node tests/test-group-schedules.js

# Reading Progress Tests
node tests/test-reading-progress.js

# Reading Retrieval Tests
node tests/test-reading-retrieval.js
```

## Test Coverage

### User Profile Management ✅ (10/10 tests passing)
- ✅ Create user profile (with reactivation of soft-deleted profiles)
- ✅ Get user profile
- ✅ Update user profile (with nested object merging)
- ✅ Delete user profile (soft delete)
- ✅ Error handling (validation, duplicates, not found)
- ✅ Email format validation
- ✅ Date format validation
- ✅ Required fields validation

### Individual Reading Schedules ✅ (8/8 tests passing)
- ✅ Create individual schedule from template
- ✅ Prevent duplicate schedule creation
- ✅ Create schedules with different start dates
- ✅ Handle non-existent templates
- ✅ Validate required fields and date formats
- ✅ Multi-user schedule creation
- ✅ End date calculation validation

### Group Reading Schedules ✅ (12/13 tests passing)
- ✅ Create group schedule
- ✅ Join group schedule
- ✅ Leave group schedule
- ✅ Handle various error scenarios
- ✅ Custom group ID support
- ✅ Admin permission handling
- ❌ 1 test failing: "Handle leaving non-existent group" (returns expected 404)

### Reading Progress Tracking (Implementation exists, tests not found)
- 🔧 Mark reading as completed/incomplete
- 🔧 Support for both individual and group schedules  
- 🔧 Optional notes and time tracking

### Reading Retrieval (Implementation exists, tests not found)
- 🔧 Get all readings with progress
- 🔧 Get specific day's reading (by day number and date)
- 🔧 Pagination support
- 🔧 Progress statistics calculation

## Test Data

The tests use the following test data:
- **Test User**: `test-user-12345` with email `test@example.com`
- **Test Template**: `bellevueYPNT` (must exist in Firestore)
- **Test Group**: `test-group-12345`

All test data is automatically cleaned up after tests complete.

## Expected Output

Successful test runs will show:
```
🧪 Testing User Profile Endpoints...
✅ Create user profile
✅ Get user profile  
✅ Update user profile
✅ Prevent duplicate user profile creation
✅ Handle non-existent user profile
✅ Handle update of non-existent user profile
✅ Reject invalid email format
✅ Reject invalid date format
✅ Reject missing required fields
✅ Delete user profile
📊 User Profile Tests Summary:
   Passed: 10/10

🧪 Testing Individual Schedule Endpoints...
✅ Create individual reading schedule
✅ Prevent duplicate schedule creation
✅ Create schedule with different start date
✅ Handle non-existent template
✅ Reject missing required fields
✅ Reject invalid date format
✅ Create schedule for different user
✅ Validate end date calculation
📊 Individual Schedule Tests Summary:
   Passed: 8/8

🧪 Testing Group Schedule Endpoints...
✅ Create group reading schedule
... (12 more passing tests)
❌ Handle leaving non-existent group
📊 Group Schedule Tests Summary:
   Passed: 12/13
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Make sure your API server is running
   - Check the API_BASE_URL in test files

2. **Firebase/Firestore Errors**
   - Verify Firebase configuration in `scripts/config/firebase.js`
   - Ensure Firestore rules allow read/write operations

3. **Template Not Found**
   - Make sure the `bellevueYPNT` template exists in Firestore
   - Run the template creation scripts if needed

4. **Test Data Conflicts**
   - Tests should clean up after themselves
   - Manually delete test documents if cleanup fails

### Debug Mode

Add `DEBUG=true` as an environment variable to see detailed request/response logs:
```bash
DEBUG=true node tests/run-all-tests.js
```

## File Structure

```
tests/
├── README.md                    # This file
├── run-all-tests.js            # Main test runner
├── test-user-profile.js        # User profile endpoint tests
├── test-individual-schedules.js # Individual schedule tests
├── test-group-schedules.js     # Group schedule tests  
├── test-reading-progress.js    # Reading progress tests
├── test-reading-retrieval.js   # Reading retrieval tests
└── test-helpers.js             # Shared test utilities
```

## Contributing

When adding new endpoints:
1. Add corresponding test cases
2. Update this README with new test coverage
3. Ensure tests clean up any created data
4. Follow the existing test pattern for consistency