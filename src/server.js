const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const { typeDefs, resolvers } = require('./graphql/schema');
require('dotenv').config();

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));

const app = express();

const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: ({ req }) => {
        return {};
    }
});

// apply apollo middleware to express server
server.applyMiddleware({ app });

// port configuration 
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
});