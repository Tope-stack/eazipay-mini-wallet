const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const path = require('path');
require('dotenv').config();

const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { authenticateToken } = require('./util/auth');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));



// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/graphql', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test UI route
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'graphql-test.html'));
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Eazipay Mini Wallet API',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      test: '/test',
      health: '/health'
    }
  });
});

// Apollo Server setup
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      introspection: true, // Enable introspection
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({ 
          includeCookies: true 
        })
      ],
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
        };
      }
    });

    await server.start();

    app.use(
      '/graphql',
      expressMiddleware(server, {
        context: async ({ req }) => {
          const token = req.headers.authorization?.replace('Bearer ', '');
          let user = null;
          
          if (token) {
            try {
              user = authenticateToken(token);
            } catch (error) {
              // Token invalid, user remains null
            }
          }
          
          return { user };
        }
      })
    );

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;