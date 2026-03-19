process.env.JWT_SECRET = 'test-secret-32-bytes-xxxxxxxxxxxxx';

const jwt    = require('jsonwebtoken');
const cookie = require('cookie');
const handler = require('../../api/logout');

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

describe('POST /api/logout', () => {
  it('returns 405 for non-POST', async () => {
    const req = { method: 'GET', headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('returns 401 without auth cookie', async () => {
    const req = { method: 'POST', headers: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('clears the cookie and returns ok', async () => {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET);
    const req = {
      method: 'POST',
      headers: { cookie: `admin_token=${token}` },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body.ok).toBe(true);
    expect(res._headers['Set-Cookie']).toMatch(/Max-Age=0/);
  });
});
