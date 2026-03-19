jest.mock('../../../api/_lib/github', () => ({
  getFile: jest.fn(),
  putFile: jest.fn().mockResolvedValue({}),
}));

const jwt = require('jsonwebtoken');
process.env.JWT_SECRET    = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.GITHUB_REPO   = 'owner/repo';
process.env.GITHUB_BRANCH = 'main';
process.env.GITHUB_TOKEN  = 'fake';

const { getFile, putFile } = require('../../../api/_lib/github');
const handler = require('../../../api/projects/reorder');

function validCookie() {
  return `admin_token=${jwt.sign({ admin: true }, process.env.JWT_SECRET)}`;
}
function mockRes() {
  const res = { _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = () => {};
  return res;
}

const projects = [
  { id: 'alpha', title: 'Alpha' },
  { id: 'beta',  title: 'Beta'  },
  { id: 'gamma', title: 'Gamma' },
];

describe('PUT /api/projects/reorder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFile.mockResolvedValue({
      content: Buffer.from(JSON.stringify(projects)),
      sha: 'sha1',
    });
  });

  it('returns 405 for non-PUT', async () => {
    const req = { method: 'POST', headers: {}, body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(405);
  });

  it('returns 401 without auth', async () => {
    const req = { method: 'PUT', headers: {}, body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('reorders projects according to submitted ids', async () => {
    const req = {
      method: 'PUT',
      headers: { cookie: validCookie() },
      body: { ids: ['gamma', 'alpha', 'beta'] },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    const committed = JSON.parse(putFile.mock.calls[0][1]);
    expect(committed.map(p => p.id)).toEqual(['gamma', 'alpha', 'beta']);
  });

  it('returns 400 if ids length does not match', async () => {
    const req = {
      method: 'PUT',
      headers: { cookie: validCookie() },
      body: { ids: ['alpha', 'beta'] }, // missing gamma
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(400);
  });
});
