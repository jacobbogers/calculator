import createFetchMock from 'vitest-fetch-mock';
import { vi } from 'vitest';
export { describe, beforeEach, afterEach, it, expect } from 'vitest';

const fetchMocker = createFetchMock(vi);

// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();
