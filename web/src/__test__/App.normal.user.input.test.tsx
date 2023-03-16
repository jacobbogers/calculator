import React from 'react';
import type { Store } from 'redux';
import type { MockResponseInit } from 'jest-fetch-mock';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import createStore from '../lib/store';
import App from '../App';

import { API_REST_PATH_SUFFIX } from '../lib/shared/constants';

import { getUIElements, customRender } from './test-helper';
import type { StoreLayout } from '../lib/reducers';

describe('Normal User input', () => {
    let store: Store<StoreLayout>;

    beforeEach(() => {
        store = createStore();
        fetchMock.enableMocks();
    });

    afterEach(() => {
        cleanup();
        fetchMock.resetMocks();
    });
    it('format 1_000_000_000_000 as 1e+12', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btn0, btn1, commandLine, btnSubmit } = getUIElements(screen);
        await user.click(btn1);
        for (let i = 0; i < 12; i++) {
            await user.click(btn0);
        }
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('1e+12');
        unmount();
    });
    it('format 1_943_000_000_000 as 1e+12', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btn0, btn1, btn9, btn4, btn3, commandLine, btnSubmit } = getUIElements(screen);
        await user.click(btn1);
        await user.click(btn9);
        await user.click(btn4);
        await user.click(btn3);
        for (let i = 0; i < 9; i++) {
            await user.click(btn0);
        }
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('1.943e+12');
        unmount();
    });
    it('format 123_456_000_000 is un-adjusted', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btn0, btn1, btn2, btn3, btn4, btn5, btn6, commandLine, btnSubmit } = getUIElements(screen);
        await user.click(btn1);
        await user.click(btn2);
        await user.click(btn3);
        await user.click(btn4);
        await user.click(btn5);
        await user.click(btn6);
        for (let i = 0; i < 6; i++) {
            await user.click(btn0);
        }
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('123456000000');
        unmount();
    });
    it('format "0.123_456_000_9" to "0.123456001"', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btnDot, btn0, btn1, btn2, btn3, btn4, btn5, btn6, btn9, commandLine, btnSubmit } =
            getUIElements(screen);
        await user.click(btn0);
        await user.click(btnDot);
        await user.click(btn1);
        await user.click(btn2);
        await user.click(btn3);
        await user.click(btn4);
        await user.click(btn5);
        await user.click(btn6);
        for (let i = 0; i < 3; i++) {
            await user.click(btn0);
        }
        await user.click(btn9);
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('0.123456001');
        unmount();
    });
    it('format "1_123_456_789.000_9 to become "1_123_456_789"', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btnDot, btn0, btn1, btn2, btn3, btn4, btn5, btn6, btn7, btn8, btn9, commandLine, btnSubmit } =
            getUIElements(screen);
        await user.click(btn1);
        //
        await user.click(btn1);
        await user.click(btn2);
        await user.click(btn3);
        //
        await user.click(btn4);
        await user.click(btn5);
        await user.click(btn6);
        //
        await user.click(btn7);
        await user.click(btn8);
        await user.click(btn9);
        //
        await user.click(btnDot);
        for (let i = 0; i < 3; i++) {
            await user.click(btn0);
        }
        await user.click(btn9);
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('1123456789');
        unmount();
    });
    it('format "0.001/123_456_789_123_456_789" = "8.100000065610001e-22" becomes "8.1000001e-23"', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const {
            btnDot,
            btn0,
            btn1,
            btn2,
            btn3,
            btn4,
            btn5,
            btn6,
            btn7,
            btn8,
            btn9,
            btnDivide,
            commandLine,
            btnSubmit
        } = getUIElements(screen);

        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 200,
                    statusText: 'ok'
                },
                body: '{ "type": "value", "payload": 8.100000065610001e-23 }'
            });
        });

        await user.click(btnDot);
        for (let i = 0; i < 4; i++) {
            await user.click(btn0);
        }
        await user.click(btn1);
        // entered .0001
        await user.click(btnDivide);
        //
        for (let i = 0; i < 2; i++) {
            await user.click(btn1);
            await user.click(btn2);
            await user.click(btn3);
            //
            await user.click(btn4);
            await user.click(btn5);
            await user.click(btn6);
            //
            await user.click(btn7);
            await user.click(btn8);
            await user.click(btn9);
        }
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('8.1000001e-23');
        const { commandLine: cmdLineStore } = store.getState();
        expect(cmdLineStore).toEqual([{ type: 'value', payload: 8.100000065610001e-23 }]);
        unmount();
    });
    it('multiply 2 negative numbers', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });

        const { btnSubtract, btn9, btn5, btnDot, btn2, btnMultiply, btn6, btnSubmit, commandLine } =
            getUIElements(screen);

        // -92.5x-.6 =
        await user.click(btnSubtract);
        await user.click(btn9);
        await user.click(btn2);
        await user.click(btnDot);
        await user.click(btn5);
        await user.click(btnMultiply);
        await user.click(btnSubtract);
        await user.click(btnDot);
        await user.click(btn6);

        expect(commandLine.textContent).toEqual('-92.5 × -.6');

        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 200,
                    statusText: 'ok'
                },
                body: '{ "type": "value", "payload": 55.5 }'
            });
        });

        await user.click(btnSubmit);
        expect(commandLine.textContent).toEqual('55.5');
        unmount();
    });
    it('user journey: Entering "9 x 5.2", 2x click "=" button, x 34 =', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        // get buttons to emulate keystrokes
        const { btn9, btn5, btnDot, btn2, btn6, btnSubmit, btnDivide, btnMultiply, commandLine, lastHistoryLine } =
            getUIElements(screen);

        expect(commandLine.textContent).toBe('0');
        expect(lastHistoryLine.textContent).toBe('');

        // first key press
        await user.click(btn9);

        // after the first keypress the historyLine is now "Ans =  0"
        expect(lastHistoryLine.textContent).toBe('Ans = 0');

        await user.click(btnMultiply);
        await user.click(btn5);
        await user.click(btnDot);
        await user.click(btn2);

        expect(store.getState()).toMatchSnapshot();
        expect(commandLine.textContent).toBe('9 × 5.2');

        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    }
                },
                body: JSON.stringify({
                    type: 'value',
                    payload: 46.800000000000004
                })
            });
        });

        await user.click(btnSubmit);
        expect(fetchMock.mock.lastCall).toEqual([
            API_REST_PATH_SUFFIX,
            {
                method: 'POST',
                mode: 'same-origin',
                credentials: 'same-origin',
                redirect: 'follow',
                keepalive: true,
                body: JSON.stringify([
                    { type: 'value', payload: 9 },
                    { type: 'multiply' },
                    { type: 'value', payload: 5.2 }
                ]),
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json'
                }
            }
        ]);
        expect(store.getState()).toMatchSnapshot();
        expect(commandLine.textContent).toBe('46.8');
        expect(lastHistoryLine.textContent).toBe('9 × 5.2 =');

        // CE buttons should be displaced, AC button should not be rendered
        expect(screen.queryByTestId('btnclearEntry')).toBeNull();
        // throws if it does not exist, this is an assert by itself
        screen.getByTestId('btnClearAll');

        // user clicks = for second time
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('46.8');
        expect(lastHistoryLine.textContent).toBe('9 × 5.2 =');

        // continue with calculation using returned result
        await user.click(btnDivide);
        await user.click(btnDot);
        await user.click(btn6);
        expect(store.getState()).toMatchSnapshot();
        expect(commandLine.textContent).toBe('46.8 ÷ .6');

        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    }
                },
                body: JSON.stringify({
                    type: 'value',
                    payload: 78.00000000000001
                })
            });
        });

        await user.click(btnSubmit);

        expect(commandLine.textContent).toBe('78');
        expect(lastHistoryLine.textContent).toBe('46.8 ÷ .6 =');
        unmount();
    });
});
