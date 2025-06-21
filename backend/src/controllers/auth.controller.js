import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';
import { createUserDefaultFileSystem } from '../services/fileSystem.services.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = '7d';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    user.tokens.push({ token });
    await user.save();
    
    // **NEW: Create default file system for new user**
    try {
      await createUserDefaultFileSystem(user._id);
      console.log(`✅ Default file system created for user: ${user.username}`);
    } catch (fileSystemError) {
      console.error('❌ Error creating default file system:', fileSystemError);
      // Don't fail registration if file system creation fails
    }
    
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email },message: 'Registration successful' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    user.tokens.push({ token });
    await user.save();
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } , message: 'Login successful'});
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.token;
    const user = await User.findById(req.user.id);
    user.tokens = user.tokens.filter(t => t.token !== token);
    await user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
}; 