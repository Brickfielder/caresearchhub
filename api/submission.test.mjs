import assert from 'node:assert/strict';
import test from 'node:test';
import requestLink from './request-link.js';
import verifyLink from './verify.js';
import submit from './submit.js';

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    end() {},
    json(body) {
      this.body = body;
    },
    send(body) {
      this.body = body;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    redirect(code, location) {
      this.statusCode = code;
      this.headers.Location = location;
    }
  };
}

test('verification and submission complete with mocked external services', async (t) => {
  const settings = {
    ALLOWED_SUBMITTER_EMAIL: 'contributor@example.com',
    AUTH_SECRET: 'test-only-secret',
    RESEND_API_KEY: 'test-only-email-key',
    RESEND_FROM: 'test@example.com',
    GITHUB_WORKFLOW_TOKEN: 'test-only-workflow-key'
  };
  const original = { ...process.env };
  Object.assign(process.env, settings);
  t.after(() => {
    for (const key of Object.keys(settings)) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  });

  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return { ok: true };
  });
  const host = 'intake.example.com';
  const doi = '10.1000/test-paper';
  const emailResponse = response();
  await requestLink(
    { method: 'POST', headers: { host }, body: { email: settings.ALLOWED_SUBMITTER_EMAIL, doi } },
    emailResponse
  );
  assert.equal(emailResponse.statusCode, 202);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.deepEqual(calls[0].body.to, [settings.ALLOWED_SUBMITTER_EMAIL]);

  const link = new URL(calls[0].body.html.match(/href="([^"]+)"/)[1]);
  const verificationResponse = response();
  verifyLink({ query: { token: link.searchParams.get('token') } }, verificationResponse);
  assert.equal(verificationResponse.statusCode, 302);
  assert.match(verificationResponse.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Lax/);
  const session = verificationResponse.headers['Set-Cookie'].split(';')[0].split('=')[1];

  const submissionResponse = response();
  await submit(
    {
      method: 'POST',
      headers: { host, origin: `https://${host}` },
      cookies: { caresearch_session: session },
      body: { doi }
    },
    submissionResponse
  );
  assert.equal(submissionResponse.statusCode, 202);
  assert.equal(calls.length, 2);
  assert.match(calls[1].url, /\/bulk-add-papers\.yml\/dispatches$/);
  assert.deepEqual(calls[1].body, {
    ref: 'main',
    inputs: { identifiers: doi, preview_only: 'false' }
  });
});

test('invalid verification and unauthenticated submissions are rejected without external calls', async (t) => {
  t.mock.method(globalThis, 'fetch', () => assert.fail('External service must not be called'));
  const invalidLink = response();
  verifyLink({ query: { token: 'invalid' } }, invalidLink);
  assert.equal(invalidLink.statusCode, 400);

  const unauthenticated = response();
  await submit(
    {
      method: 'POST',
      headers: { host: 'intake.example.com', origin: 'https://intake.example.com' }
    },
    unauthenticated
  );
  assert.equal(unauthenticated.statusCode, 401);

  const crossOrigin = response();
  await submit(
    {
      method: 'POST',
      headers: { host: 'intake.example.com', origin: 'https://other.example.com' }
    },
    crossOrigin
  );
  assert.equal(crossOrigin.statusCode, 403);
});
