import jwt from 'jsonwebtoken';

const generateToken = (userId, role = 'gameUser') => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateToken;
