import { apiGet, apiPost, APIError } from './src/lib/api-client.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// 1. Mock LocalStorage & Window environment
const storage: Record<string, string> = {};
const localWindow = {
  location: {
    pathname: '/dashboard',
    href: 'http://localhost:3000/dashboard'
  }
};

global.window = localWindow as any;

global.localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => { for (const k in storage) delete storage[k]; }
} as any;

// 2. Mock Global Fetch
let lastUrl = '';
let lastOptions: RequestInit = {};
let mockResponseStatus = 200;
let mockResponseBody: any = {};
let mockResponseHeaders = new Headers();

global.fetch = async (url: any, options: any) => {
  lastUrl = url.toString();
  lastOptions = options || {};
  return {
    status: mockResponseStatus,
    ok: mockResponseStatus >= 200 && mockResponseStatus < 300,
    headers: mockResponseHeaders,
    text: async () => typeof mockResponseBody === 'string' ? mockResponseBody : JSON.stringify(mockResponseBody),
    json: async () => mockResponseBody,
  } as any;
};

async function runTests() {
  console.log('Running API Client verification tests...');

  // Test 1: Request with token insertion
  storage['token'] = 'test-token-123';
  mockResponseStatus = 200;
  mockResponseBody = { success: true };
  mockResponseHeaders = new Headers({ 'Content-Type': 'application/json' });

  const res1 = await apiGet('/test-route');
  assert(res1.success === true, 'Response JSON should be parsed');
  assert(lastUrl === 'http://localhost:8000/test-route', 'URL mapping should fall back to localhost:8000');
  assert(lastOptions.headers instanceof Headers, 'Headers should be a Headers object');
  assert((lastOptions.headers as Headers).get('Authorization') === 'Bearer test-token-123', 'Token should be auto-inserted');

  // Test 2: Request with custom body (POST)
  const res2 = await apiPost('/post-route', { data: 'hello' });
  assert(res2.success === true, 'Post response should be parsed');
  assert((lastOptions.headers as Headers).get('Content-Type') === 'application/json', 'Content-Type should be JSON');
  assert(lastOptions.body === JSON.stringify({ data: 'hello' }), 'Body should be serialized to JSON');

  // Test 3: Structured Error Parsing (APIError)
  mockResponseStatus = 400;
  mockResponseBody = { detail: 'Missing required field' };

  try {
    await apiGet('/bad-route');
    assert(false, 'Should have thrown APIError');
  } catch (err: any) {
    assert(err instanceof APIError, 'Error should be instance of APIError');
    assert(err.status === 400, 'Error status should be 400');
    assert(err.detail === 'Missing required field', 'Error detail should be extracted');
    assert(err.message === 'Missing required field', 'Error message should be stringified detail');
  }

  // Test 4: 401 Redirect and storage clear
  mockResponseStatus = 401;
  mockResponseBody = { detail: 'Token expired' };

  try {
    await apiGet('/secure-route');
    assert(false, 'Should have thrown APIError on 401');
  } catch (err: any) {
    assert(err instanceof APIError, 'Error should be APIError');
    assert(err.status === 401, 'Status should be 401');
    assert(storage['token'] === undefined, 'Token should be cleared from localStorage');
    assert(localWindow.location.href === '/login', 'Window location should be changed to /login');
  }

  console.log('✓ All API Client tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
