import jwt from 'jsonwebtoken';
import { User } from '../models/user.models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: decoded.id, 'tokens.token': token });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = { id: user._id, username: user.username, email: user.email };
    req.userId = user._id;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
}; 