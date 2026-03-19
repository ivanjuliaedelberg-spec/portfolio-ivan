// Mock dependencies at module level (Jest hoists these)
jest.mock('../../api/_lib/github', () => ({
  putFile:    jest.fn().mockResolvedValue({}),
  fileExists: jest.fn().mockResolvedValue(false),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn().mockReturnValue(Buffer.from('fake-image-data')),
  unlinkSync:   jest.fn(),
}));

const mockWebpBuffer = Buffer.from('fake-webp');
const mockSharpChain = {
  resize: jest.fn().mockReturnThis(),
  webp:   jest.fn().mockReturnThis(),
  toBuffer: jest.fn().mockResolvedValue(mockWebpBuffer),
};
jest.mock('sharp', () => jest.fn().mockReturnValue(mockSharpChain));

const mockFormFields = { projectId: ['test-project'], index: ['1'] };
const mockFormFiles  = { file: [{ filepath: '/tmp/fake.webp', originalFilename: 'test.webp', size: 1000 }] };
jest.mock('formidable', () => {
  const mockFormidable = jest.fn().mockReturnValue({
    parse: jest.fn().mockResolvedValue([mockFormFields, mockFormFiles]),
  });
  return mockFormidable;
});

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

process.env.JWT_SECRET          = 'test-secret-32-bytes-xxxxxxxxxxxxx';
process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync('pw', 4);
process.env.GITHUB_REPO         = 'owner/repo';
process.env.GITHUB_BRANCH       = 'main';
process.env.GITHUB_TOKEN        = 'fake';

const { putFile } = require('../../api/_lib/github');
const handler = require('../../api/upload');

function validToken() {
  return jwt.sign({ admin: true }, process.env.JWT_SECRET);
}

function mockRes() {
  const res = { _headers: {}, _status: 200, _body: null };
  res.status    = (s) => { res._status = s; return res; };
  res.json      = (b) => { res._body   = b; return res; };
  res.setHeader = (k, v) => { res._headers[k] = v; };
  return res;
}

describe('POST /api/upload', () => {
  beforeEach(() => jest.clearAllMocks());

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

  it('returns hq and lq paths on successful upload', async () => {
    const token = validToken();
    const req = {
      method: 'POST',
      headers: { cookie: `admin_token=${token}`, 'content-type': 'multipart/form-data' },
    };
    const res = mockRes();
    await handler(req, res);
    expect(res._status).toBe(200);
    expect(res._body).toEqual({
      hq: '/assets/images/test-project/still-1.webp',
      lq: '/assets/images/test-project/still-1-lq.webp',
    });
    expect(putFile).toHaveBeenCalledTimes(2);
  });
});
