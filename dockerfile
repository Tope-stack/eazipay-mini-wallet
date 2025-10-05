FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 4000

CMD ["npm", "start"]
```

### 17. docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_DATABASE: wallet_db
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/wallet_db
      NODE_ENV: development
    depends_on:
      - mongodb
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  mongodb_data:
```

### 18. .github/workflows/ci.yml
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        JWT_SECRET: test-secret
        ENCRYPTION_KEY: test-encryption-key-32-chars!!
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Render/Heroku
      run: echo "Add your deployment script here"