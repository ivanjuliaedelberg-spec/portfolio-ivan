const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const cookie = require('cookie');

process.env.JWT_SECRET          = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('correct-password', 4); // cost 4 for speed in tests

const handler = require('../../api/auth');

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status  = (s) => { res._status = s; return res; };
  res.json    = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

describe('POST /api/auth', () => {
  it('returns 405 for non-POST', async () => {
    const req = { method: 'GET',  body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('returns 401 for wrong password', async () => {
    const req = { method: 'POST', body: { password: 'wrong' } };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('sets httpOnly cookie and returns ok for correct password', async () => {
    const req = { method: 'POST', body: { password: 'correct-password' } };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body.ok).toBe(true);
    const setCookie = res._headers['Set-Cookie'];
    expect(setCookie).toMatch(/admin_token=/);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Strict/);
    const tokenValue = setCookie.match(/admin_token=([^;]+)/)[1];
    const payload = jwt.verify(tokenValue, process.env.JWT_SECRET);
    expect(payload.admin).toBe(true);
  });
});
