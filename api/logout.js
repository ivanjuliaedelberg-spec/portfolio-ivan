const cookie = require('cookie');
const { requireAuth } = require('./_lib/verify-jwt');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  res.setHeader('Set-Cookie', cookie.serialize('admin_token', '', {
    httpOnly: true,
    secure:   true,
    sameSite: 'strict',
    maxAge:   0,
    path:     '/',
  }));

  return res.status(200).json({ ok: true });
};
