# Workout Tracker

Sample solution for the [workout tracker](https://roadmap.sh/projects/fitness-workout-tracker) challenge from [roadmap.sh](https://roadmap.sh/).

# Testing

This project uses Jest for comprehensive testing including unit tests, integration tests, and end-to-end tests.

## Test Structure

```
__tests__/
├── setup.js                    # Global test configuration
├── controllers/                # Controller unit tests
├── services/                   # Service layer tests
├── models/                     # Model tests
├── middleware/                 # Middleware tests
├── integration/                # Integration tests
├── e2e/                       # End-to-end tests
├── performance/               # Performance tests
├── security/                  # Security tests
├── validation/                # Input validation tests
├── fixtures/                  # Test data
└── utils/                     # Test utilities

```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Run tests in CI mode
npm run test:ci
```

