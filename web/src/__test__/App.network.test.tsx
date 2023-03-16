import React from 'react';
import type { Store } from 'redux';
import type { MockResponseInit } from 'vitest-fetch-mock';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import createStore from '../lib/store';
import App from '../App';

import { getUIElements, customRender } from './test-helper';
import type { StoreLayout } from '../lib/reducers';

describe('Network fetch', () => {
    let store: Store<StoreLayout>;

    beforeEach(() => {
        store = createStore();
        fetchMock.enableMocks();
    });

    afterEach(() => {
        cleanup();
        fetchMock.resetMocks();
    });
    it('Non http-ok response, Non JSON response', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn4, btnSubtract, btnDot, btnSubmit } = getUIElements(screen);
        await user.click(btn4);
        await user.click(btnSubtract);
        await user.click(btnDot);
        await user.click(btn4);

        expect(lastHistoryLine.textContent).toBe('Ans = 0');
        expect(commandLine.textContent).toBe('4 - .4');
        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'text/html'
                    },
                    status: 500,
                    statusText: 'Not Found'
                },
                body: '<html><head></head><body>Error</body></head>'
            });
        });

        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('4 - .4 =');
        expect(commandLine.textContent).toBe('Error');
        await user.click(btnSubmit);
        expect(store.getState().serverError).toMatchSnapshot();
        unmount();
    });
    it('Non http-ok response, it is JSON response, but rejected by schema', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn4, btnSubtract, btnDot, btnSubmit } = getUIElements(screen);
        await user.click(btn4);
        await user.click(btnSubtract);
        await user.click(btnDot);
        await user.click(btn4);

        expect(lastHistoryLine.textContent).toBe('Ans = 0');
        expect(commandLine.textContent).toBe('4 - .4');
        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 400,
                    statusText: 'Not Found'
                },
                body: '{ "hello":"world" }'
            });
        });

        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('4 - .4 =');
        expect(commandLine.textContent).toBe('Error');
        await user.click(btnSubmit);
        expect(store.getState().serverError).toMatchSnapshot();

        unmount();
    });
    it('http-ok response, but non JSON response', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn4, btnSubtract, btnDot, btnSubmit } = getUIElements(screen);
        await user.click(btn4);
        await user.click(btnSubtract);
        await user.click(btnDot);
        await user.click(btn4);

        expect(lastHistoryLine.textContent).toBe('Ans = 0');
        expect(commandLine.textContent).toBe('4 - .4');
        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'text/html'
                    },
                    status: 200,
                    statusText: 'Ok'
                },
                body: '<html><head></head><body>Welcome to nginx</body></head>'
            });
        });

        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('4 - .4 =');
        expect(commandLine.textContent).toBe('Error');
        await user.click(btnSubmit);
        expect(store.getState().serverError).toMatchSnapshot();

        unmount();
    });
    it('http-ok response, but JSONschema rejects response', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn4, btnSubtract, btnDot, btnSubmit } = getUIElements(screen);
        await user.click(btn4);
        await user.click(btnSubtract);
        await user.click(btnDot);
        await user.click(btn4);

        expect(lastHistoryLine.textContent).toBe('Ans = 0');
        expect(commandLine.textContent).toBe('4 - .4');
        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 200,
                    statusText: 'Ok'
                },
                body: '{ "schema":"reject" }'
            });
        });

        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('4 - .4 =');
        expect(commandLine.textContent).toBe('Error');
        await user.click(btnSubmit);
        expect(store.getState().serverError).toMatchSnapshot();

        unmount();
    });
});
