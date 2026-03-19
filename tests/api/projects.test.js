jest.mock('../../api/_lib/github', () => ({
  getFile:    jest.fn(),
  putFile:    jest.fn().mockResolvedValue({}),
  fileExists: jest.fn().mockResolvedValue(true),
}));

const jwt = require('jsonwebtoken');
process.env.JWT_SECRET    = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.GITHUB_REPO   = 'owner/repo';
process.env.GITHUB_BRANCH = 'main';
process.env.GITHUB_TOKEN  = 'fake';

const { getFile, putFile, fileExists } = require('../../api/_lib/github');
const handler = require('../../api/projects');

function validCookie() {
  return `admin_token=${jwt.sign({ admin: true }, process.env.JWT_SECRET)}`;
}

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

const existingProjects = [
  { id: 'existing', title: 'Existing', stills: ['/assets/images/existing/still-1.webp', '/assets/images/existing/still-2.webp', '/assets/images/existing/still-3.webp'] }
];

describe('POST /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFile.mockResolvedValue({
      content: Buffer.from(JSON.stringify(existingProjects)),
      sha: 'abc123',
    });
  });

  it('returns 401 without auth', async () => {
    const req = { method: 'POST', headers: {}, body: {} };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(401);
  });

  it('returns 409 on duplicate project id', async () => {
    const req = {
      method: 'POST',
      headers: { cookie: validCookie() },
      body: {
        id: 'existing', title: 'Dupe', categoryLabel: 'Music Video', category: 'music-videos',
        stills: ['/assets/images/existing/still-1.webp', '/assets/images/existing/still-2.webp', '/assets/images/existing/still-3.webp'],
      },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(409);
    expect(res._body.error).toMatch(/already exists/i);
  });

  it('adds project and commits on success', async () => {
    const req = {
      method: 'POST',
      headers: { cookie: validCookie() },
      body: {
        id: 'new-project', title: 'New', categoryLabel: 'Commercial', category: 'commercials',
        director: '', producer: '', dop: '', secdirector: '', secdop: '', year: '', vimeoId: '',
        stills: ['/assets/images/new-project/still-1.webp', '/assets/images/new-project/still-2.webp', '/assets/images/new-project/still-3.webp'],
      },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body.ok).toBe(true);
    expect(putFile).toHaveBeenCalledTimes(1);
    const committed = JSON.parse(putFile.mock.calls[0][1]);
    expect(committed).toHaveLength(2);
    expect(committed[1].id).toBe('new-project');
  });
});

describe('DELETE /api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getFile.mockResolvedValue({
      content: Buffer.from(JSON.stringify(existingProjects)),
      sha: 'abc123',
    });
  });

  it('removes project and commits on success', async () => {
    const req = {
      method: 'DELETE',
      headers: { cookie: validCookie() },
      body: { id: 'existing' },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    const committed = JSON.parse(putFile.mock.calls[0][1]);
    expect(committed).toHaveLength(0);
  });
});
