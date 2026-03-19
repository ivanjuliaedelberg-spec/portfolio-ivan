process.env.GITHUB_TOKEN  = 'fake-token';
process.env.GITHUB_REPO   = 'owner/repo';
process.env.GITHUB_BRANCH = 'main';

const { encodeContent, buildFileUrl } = require('../../../api/_lib/github');

describe('github helpers', () => {
  it('encodeContent converts string to base64', () => {
    expect(encodeContent('hello')).toBe(Buffer.from('hello').toString('base64'));
  });

  it('encodeContent converts Buffer to base64', () => {
    const buf = Buffer.from([1, 2, 3]);
    expect(encodeContent(buf)).toBe(buf.toString('base64'));
  });

  it('buildFileUrl returns correct GitHub API URL', () => {
    const url = buildFileUrl('assets/images/test/still-1.webp');
    expect(url).toBe(
      'https://api.github.com/repos/owner/repo/contents/assets/images/test/still-1.webp'
    );
  });
});
