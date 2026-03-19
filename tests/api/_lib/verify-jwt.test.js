const jwt = require('jsonwebtoken');

// Set env before requiring the module
process.env.JWT_SECRET = 'test-secret-32-bytes-xxxxxxxxxxxxx';

const { verifyJwt } = require('../../../api/_lib/verify-jwt');

describe('verifyJwt', () => {
  it('returns payload for a valid token', () => {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const payload = verifyJwt(token);
    expect(payload.admin).toBe(true);
  });

  it('throws for an invalid token', () => {
    expect(() => verifyJwt('bad.token.here')).toThrow();
  });

  it('throws for an expired token', () => {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    expect(() => verifyJwt(token)).toThrow();
  });

  it('returns null when token is undefined', () => {
    expect(verifyJwt(undefined)).toBeNull();
  });
});
