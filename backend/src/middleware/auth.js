const jwt = require('jsonwebtoken');
const User = require('../models/User');
const CareCircle = require('../models/CareCircle');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'carecircle_jwt_secret_dev_key_2026');

      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) {
        return res.status(401).json({ message: 'User not found or deleted' });
      }

      req.user = user;

      // Find care circle where user is either patient or member
      let circle = await CareCircle.findOne({
        $or: [{ patientId: user._id }, { 'members.userId': user._id }],
        status: 'active',
      }).populate('patientId', 'fullName email conditions phone');

      req.circle = circle || null;

      return next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
