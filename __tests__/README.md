# API Unit Tests

This directory contains comprehensive unit tests for the Bible Reading Schedule API.

## Test Structure

```
__tests__/
├── setup.js                    # Test setup and Firebase mocks
├── helpers/
│   └── testHelpers.js          # Test utilities and data factories
├── api/                        # Unit tests for API endpoints
│   ├── user-profile.test.js
│   ├── create-reading-schedule.test.js
│   ├── get-user-schedules.test.js
│   ├── mark-reading-completed.test.js
│   ├── get-available-groups.test.js
│   ├── join-group-reading-schedule.test.js
│   ├── get-reading-templates.test.js
│   └── create-group-reading-schedule.test.js
└── integration/
    └── api.integration.test.js  # Integration tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npx jest __tests__/api/user-profile.test.js
```

### Verbose Output
```bash
npm test -- --verbose
```

## Test Features

### Comprehensive Coverage
- ✅ **User Profile Management**: Create, read, update, delete operations
- ✅ **Individual Schedules**: Creation with validation and edge cases
- ✅ **Group Schedules**: Creation, joining, leaving, and member management
- ✅ **Progress Tracking**: Multiple completion tasks and points calculation
- ✅ **Reading Templates**: Template retrieval and validation
- ✅ **Available Groups**: Public group listing with member counts
- ✅ **Integration Tests**: End-to-end API testing

### Test Utilities
- **Mock Data Factories**: Consistent test data generation
- **Firebase Mocking**: Complete Firebase Admin SDK mocking
- **Request/Response Helpers**: Simplified Express req/res mocking
- **Validation Helpers**: Common assertion patterns
- **Database Mocking**: Configurable Firestore response simulation

### Key Test Scenarios

#### Validation Testing
- Required field validation
- Data type validation
- Format validation (emails, dates, etc.)
- Range validation (min/max values)
- Custom business logic validation

#### Error Handling
- Database connection failures
- Non-existent resource access
- Permission/authorization errors
- Malformed request data
- Concurrent operation conflicts

#### Business Logic
- Points calculation (1 point per completion task)
- Membership status tracking (active/inactive)
- Group capacity management (full groups)
- Date calculations (current day, end dates)
- Admin permissions and restrictions

#### Edge Cases
- Empty result sets
- Boundary values
- Null/undefined handling
- Backward compatibility scenarios
- Race conditions

## Mock Strategy

### Firebase Admin SDK
All Firebase operations are mocked to avoid:
- Database dependencies during testing
- Test data pollution
- Network latency issues
- Firestore quota consumption

### Mock Data Consistency
Test data factories ensure consistent, realistic test scenarios:
```javascript
const testUser = createTestUser({
  uid: 'custom-uid-123',
  displayName: 'Custom Name'
});
```

### Database State Control
Tests can simulate various database states:
```javascript
mockDbSuccess(userData);     // Successful operations
mockDbError(new Error());    // Database failures  
mockDbEmpty();               // Empty result sets
```

## Coverage Goals

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 90%
- **Lines**: > 90%

## Best Practices Implemented

1. **Isolation**: Each test is independent with proper setup/teardown
2. **Clarity**: Descriptive test names and clear assertions
3. **Completeness**: Both happy path and error scenarios tested
4. **Maintainability**: Reusable helpers and factories
5. **Performance**: Fast execution with effective mocking
6. **Documentation**: Clear comments for complex test logic

## Test Categories

### Unit Tests (`__tests__/api/`)
Test individual API endpoints in isolation with mocked dependencies.

### Integration Tests (`__tests__/integration/`)  
Test complete request/response cycles through the Express application.

### Validation Tests
Comprehensive input validation testing for all endpoints.

### Error Handling Tests
Database errors, network failures, and exception scenarios.

### Business Logic Tests
Complex calculations, state transitions, and business rules.

## Running in CI/CD

Tests are designed to run reliably in CI environments:
- No external dependencies
- Deterministic results
- Fast execution
- Clear failure reporting

Example CI configuration:
```yaml
- name: Run Tests
  run: |
    npm test
    npm run test:coverage
```

## Debugging Tests

### Debug Individual Test
```bash
npx jest --runInBand --detectOpenHandles __tests__/api/user-profile.test.js
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand __tests__/api/user-profile.test.js
```

### Verbose Logging
```bash
DEBUG=true npm test
```

This test suite provides comprehensive coverage of the API layer with robust error handling, realistic scenarios, and maintainable test code.