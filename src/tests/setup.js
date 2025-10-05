// Global test setup
process.env.JWT_SECRET = 'q8v1GZ3Yt7+uR9kL4pQ2sFvW0xZc6nH1b3Jr9MvT0Q=';
process.env.ENCRYPTION_KEY = 'X7kP2tV9aQ4rW6nZ1mS8bF0yH3cE5jUq';
process.env.NODE_ENV = 'test';

// Increase timeout for blockchain tests
jest.setTimeout(30000);