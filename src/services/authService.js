const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

async function register(email, password) {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.message);
  }
}

async function login(email, password) {
  try {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        createdAt: user.createdAt.toISOString()
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message);
  }
}

async function getUserById(userId) {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id.toString(),
    email: user.email,
    createdAt: user.createdAt.toISOString()
  };
}

module.exports = {
  register,
  login,
  getUserById
};