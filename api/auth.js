const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const cookie = require('cookie');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password required' });

  const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.setHeader('Set-Cookie', cookie.serialize('admin_token', token, {
    httpOnly: true,
    secure:   true,
    sameSite: 'strict',
    maxAge:   86400,
    path:     '/',
  }));

  return res.status(200).json({ ok: true });
};
