import React from 'react';
import type { Store } from 'redux';
import type { MockResponseInit } from 'jest-fetch-mock';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import createStore from '../lib/store';
import App from '../App';

import { getUIElements, customRender } from './test-helper';
import type { StoreLayout } from '../lib/reducers';

describe('Errors and edge cases/User input', () => {
    let store: Store<StoreLayout>;

    beforeEach(() => {
        store = createStore();
        fetchMock.enableMocks();
    });

    afterEach(() => {
        cleanup();
        fetchMock.resetMocks();
    });

    it('click AC button, right after start, taints the buffer, replaced by CE button', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine } = getUIElements(screen);

        expect(() => screen.getByTestId('btnClearEntry')).toThrowError();
        const btnClearAll = screen.getByTestId('btnClearAll');
        {
            const { tainted } = store.getState() as StoreLayout;
            expect(tainted).toBe(false);
        }

        await user.click(btnClearAll);
        {
            const { tainted } = store.getState() as StoreLayout;
            expect(tainted).toBe(true);
        }

        expect(lastHistoryLine.textContent).toBe('Ans = 0');
        expect(commandLine.textContent).toBe('0');

        // clear Button is gone
        expect(() => screen.getByTestId('btnClearAll')).toThrowError();
        // assert, throws if not exist
        screen.getByTestId('btnClearEntry');
        unmount();
    });
    it('check lastHistory line after: Enter 2 expressions in succession first result is ok, second result is an error, press number button', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btn0, btn9, btn8, btnDot, btn4, btn2, btnAdd, btnDivide, lastHistoryLine, commandLine, btnSubmit } =
            getUIElements(screen);
        expect(lastHistoryLine.textContent).toBe('');
        expect(commandLine.textContent).toBe('0');

        await user.click(btn9);
        await user.click(btnAdd);
        await user.click(btn4);
        await user.click(btnDivide);
        await user.click(btn8);
        await user.click(btnDot);
        await user.click(btn2);

        // set up response
        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    }
                },
                body: JSON.stringify({
                    type: 'value',
                    payload: 9.487804878048781
                })
            });
        });

        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('9 + 4 ÷ 8.2 =');
        expect(commandLine.textContent).toBe('9.487804878');
        expect(store.getState()).toMatchSnapshot();

        // history has now state we want
        // submit invalid calculation

        user.click(btn0);
        user.click(btnDivide);
        user.click(btn0);

        // set up response
        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 400,
                    statusText: 'Bad Request'
                },
                body: '{ "error": { "code": 1000, "message": "Expression between 1 and 3 yielded a NaN", "reqId": "req-3" }}'
            });
        });

        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('0 ÷ 0 =');
        expect(commandLine.textContent).toBe('Error');

        // submit again
        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('0 ÷ 0 =');
        expect(commandLine.textContent).toBe('Error');
        expect(store.getState().tainted).toBe(false);

        // start entering new expression
        await user.click(btn4);
        expect(store.getState().tainted).toBe(true);

        // "lastHistoryLine" should now display NOT the last previous calculated result (it was an error)
        // but instead find the previous last CORRECT calculated expression
        expect(lastHistoryLine.textContent).toBe('Ans = 9.487804878');
        expect(commandLine.textContent).toBe('4');
        unmount();
    });
    it('check lastHistory line when entering incomplete expression (after submit expression resulting  in an error)', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btn0, btnDivide, lastHistoryLine, commandLine, btnSubmit } = getUIElements(screen);
        expect(lastHistoryLine.textContent).toBe('');
        expect(commandLine.textContent).toBe('0');
        //
        await user.click(btn0);
        await user.click(btnDivide);
        await user.click(btn0);
        await user.click(btnSubmit);
        //
        expect(lastHistoryLine.textContent).toBe('0 ÷ 0 =');
        expect(commandLine.textContent).toBe('Error');
        //
        // start by entering a new expression (not pressing submit)
        await user.click(btnDivide);
        expect(commandLine.textContent).toBe('0 ÷');

        // there is no previously correctly calculated expression
        expect(lastHistoryLine.textContent).toBe('Ans = 0');
        unmount();
    });
    it('Prevent User error: Cannot enter a decimal number with 2 "." dots, (7.56.1)', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn7, btnDot, btn5, btn6, btn1 } = getUIElements(screen);
        expect(lastHistoryLine.textContent).toBe('');
        expect(commandLine.textContent).toBe('0');

        await user.click(btn7);
        await user.click(btnDot);
        await user.click(btn5);
        await user.click(btn6);
        await user.click(btnDot); // user mistake
        await user.click(btn1);

        expect(lastHistoryLine.textContent).toBe('Ans = 0');
        expect(commandLine.textContent).toBe('7.561'); // second dot correctly omitted
        unmount();
    });
    it('Prevent User error: Cannot submit incomplete calculation, 3 x 5 - 6[CE](backspace)', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn3, btn5, btnMultiply, btnSubtract, btn6, btnSubmit } =
            getUIElements(screen);

        expect(lastHistoryLine.textContent).toBe('');
        expect(commandLine.textContent).toBe('0');

        await user.click(btn3);
        await user.click(btnMultiply);
        await user.click(btn5);
        await user.click(btnSubtract);
        await user.click(btn6);

        // btnClearEntry exist now
        expect(commandLine.textContent).toBe('3 × 5 - 6');
        const btnClearEntry = screen.getByTestId('btnClearEntry');
        await user.click(btnClearEntry);
        expect(commandLine.textContent).toBe('3 × 5 -');

        // submit incomplete expression
        await user.click(btnSubmit);

        // nothing happened
        expect(commandLine.textContent).toBe('3 × 5 -');
        unmount();
    });
    it('User re-submits (double click) after entering correct expression, should not lead to network request', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn3, btn5, btnMultiply, btnSubmit } = getUIElements(screen);
        await user.click(btn3);
        await user.click(btnMultiply);
        await user.click(btn5);

        // set up response
        await fetchMock.mockResponses(
            (request: Request) => {
                return Promise.resolve<MockResponseInit>({
                    init: {
                        headers: {
                            'content-type': 'application/json'
                        },
                        status: 200,
                        statusText: 'Ok'
                    },
                    body: '{"type":"value","payload":15}'
                });
            },
            (request: Request) => {
                return Promise.resolve<MockResponseInit>({
                    init: {
                        headers: {
                            'content-type': 'application/json'
                        },
                        status: 200,
                        statusText: 'Ok'
                    },
                    body: '{"type":"value","payload":45}'
                });
            }
        );

        await user.click(btnSubmit);

        expect(store.getState().tainted).toBe(false);
        expect(lastHistoryLine.textContent).toBe('3 × 5 =');
        expect(commandLine.textContent).toBe('15');

        fetchMock.mockClear();

        await user.click(btnSubmit);
        expect(store.getState().tainted).toBe(false);
        expect(lastHistoryLine.textContent).toBe('3 × 5 =');
        expect(commandLine.textContent).toBe('15');

        // NO!! network call was made
        expect(fetchMock.mock.lastCall).toBeUndefined();

        // continue with 15 x 5 = 45
        await user.click(btnMultiply);
        await user.click(btn5);
        await user.click(btnSubmit);

        // network call was made
        expect(fetchMock.mock.lastCall).not.toBeUndefined();
        expect(lastHistoryLine.textContent).toBe('15 × 5 =');
        expect(commandLine.textContent).toBe('45');
        unmount();
    });
    it('User re-submits (double click) after entering an "errored" expression, should not lead to network request', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { lastHistoryLine, commandLine, btn0, btnDivide, btnSubmit } = getUIElements(screen);
        await user.click(btn0);
        await user.click(btnDivide);
        await user.click(btn0);

        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 400,
                    statusText: 'Bad Request'
                },
                body: '{ "error": { "code": 1000, "message": "Expression between 1 and 3 yielded a NaN", "reqId": "req-3" }}'
            });
        });

        await user.click(btnSubmit);
        expect(lastHistoryLine.textContent).toBe('0 ÷ 0 =');
        expect(commandLine.textContent).toBe('Error');

        await fetchMock.mockClear();

        // should not lead to network request
        await user.click(btnSubmit);
        expect(fetchMock.mock.lastCall).toBeUndefined();

        expect(lastHistoryLine.textContent).toBe('0 ÷ 0 =');
        expect(commandLine.textContent).toBe('Error');
        unmount();
    });
    it('User does not enters a complete number, submit is dis-allowed', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn4, btnSubtract, btnDot, btnSubmit } = getUIElements(screen);
        await user.click(btn4);
        await user.click(btnSubtract);
        await user.click(btnDot);

        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 200,
                    statusText: 'Ok'
                },
                body: '{ "type": "value", payload: 123345 }'
            });
        });

        await user.click(btnSubmit);
        const { tainted } = store.getState();
        expect(tainted).toBe(true);
        expect(commandLine.textContent).toBe('4 - .');
        expect(fetchMock.mock.lastCall).toBeUndefined();
        unmount();
    });
    it('User does not enters a "-" after receiving an error', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn0, btnDivide, btnSubmit, btnSubtract } = getUIElements(screen);
        await user.click(btn0);
        await user.click(btnDivide);
        await user.click(btn0);

        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 400,
                    statusText: 'Bad Request'
                },
                body: '{ "error": { "code": 1000, "message": "Expression between 1 and 3 yielded a NaN", "reqId": "req-3" }}'
            });
        });

        await user.click(btnSubmit);
        {
            const { tainted } = store.getState();
            expect(tainted).toBe(false);
        }
        expect(commandLine.textContent).toBe('Error');
        await user.click(btnSubtract);
        expect(commandLine.textContent).toBe('-');
        {
            const { tainted } = store.getState();
            expect(tainted).toBe(true);
        }
        unmount();
    });

    it('cannot input ".-2" (allowed in google calc)', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn2, btnDot, btnSubtract, btnSubmit } = getUIElements(screen);
        await user.click(btnDot);
        await user.click(btnSubtract);
        await user.click(btn2);
        expect(commandLine.textContent).toBe('.2');
        await fetchMock.mockResponse((request: Request) => {
            return Promise.resolve<MockResponseInit>({
                init: {
                    headers: {
                        'content-type': 'application/json'
                    },
                    status: 400,
                    statusText: 'Bad Request'
                },
                body: '{ "error": { "code": 1000, "message": "Expression between 1 and 3 yielded a NaN", "reqId": "req-3" }}'
            });
        });

        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('0.2');
        unmount();
    });

    it('cannot type 2x "-"', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btnSubtract } = getUIElements(screen);
        await user.click(btnSubtract);
        await user.click(btnSubtract);
        expect(commandLine.textContent).toBe('-'); // only once "-"
        unmount();
    });
    it('Enter "3 +" then Press "-" key, last "+" is replaced by "-"', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btnSubtract, btn3, btnAdd } = getUIElements(screen);
        await user.click(btn3);
        await user.click(btnAdd);
        expect(commandLine.textContent).toBe('3 +');
        await user.click(btnSubtract);
        expect(commandLine.textContent).toBe('3 -');
        unmount();
    });
    it('Enter "3 x" then Press "÷", key, last "x" is replaced by "÷"', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn3, btnMultiply, btnDivide } = getUIElements(screen);
        await user.click(btn3);
        await user.click(btnMultiply);
        expect(commandLine.textContent).toBe('3 ×');
        await user.click(btnDivide);
        expect(commandLine.textContent).toBe('3 ÷');
        unmount();
    });
    it('Enter "3 x" then Press "+", or "x" is replaced by "+"', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn3, btnMultiply, btnAdd } = getUIElements(screen);
        await user.click(btn3);
        await user.click(btnMultiply);
        expect(commandLine.textContent).toBe('3 ×');
        await user.click(btnAdd);
        expect(commandLine.textContent).toBe('3 +');
        unmount();
    });
    it('Ignore "+","×","÷","-" after an (not valid) partially entered number, trying to enter 3+.-', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn3, btnDot, btnAdd, btnMultiply, btnDivide, btnSubtract } = getUIElements(screen);
        await user.click(btn3);
        await user.click(btnAdd);
        await user.click(btnDot);
        expect(commandLine.textContent).toBe('3 + .');
        await user.click(btnAdd);
        expect(commandLine.textContent).toBe('3 + .');
        await user.click(btnMultiply);
        expect(commandLine.textContent).toBe('3 + .');
        await user.click(btnDivide);
        expect(commandLine.textContent).toBe('3 + .');
        await user.click(btnSubtract);
        expect(commandLine.textContent).toBe('3 + .');
        unmount();
    });
    it('Cannot enter 2x "0" as beginning of a number', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn0 } = getUIElements(screen);
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0');
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0'); // no 2x "0"
        unmount();
    });
    it('Can add  multiple zeros after nonzero or dot 1[0000] or 0.[0000]', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn0, btnDot, btnMultiply } = getUIElements(screen);
        await user.click(btnMultiply);
        expect(commandLine.textContent).toBe('0 ×');
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0 × 0');
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0 × 0'); // zero not added
        await user.click(btnDot);
        expect(commandLine.textContent).toBe('0 × 0.');
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0 × 0.0'); // zero is added because of "."
        unmount();
    });
    it('Only add a a "value" add  multiple zeros after nonzero or dot 1[0000] or 0.[0000]', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn0, btnDot, btnMultiply } = getUIElements(screen);
        await user.click(btnMultiply);
        expect(commandLine.textContent).toBe('0 ×');
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0 × 0');
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0 × 0'); // zero not added
        await user.click(btnDot);
        expect(commandLine.textContent).toBe('0 × 0.');
        await user.click(btn0);
        expect(commandLine.textContent).toBe('0 × 0.0'); // zero is added because of "."
        unmount();
    });
    it('Click CE (backspace) on an empty commandline', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btnMultiply } = getUIElements(screen);
        expect(() => screen.getByTestId('btnClearEntry')).toThrowError();
        // taint the command line
        await user.click(btnMultiply);
        expect(commandLine.textContent).toBe('0 ×');
        // CE now exist
        const btnCE = screen.getByTestId('btnClearEntry');
        await user.click(btnCE);
        expect(commandLine.textContent).toBe('0');
        expect(store.getState().commandLine).toEqual([{ type: 'digit', payload: '0' }]);
        await user.click(btnCE);
        expect(commandLine.textContent).toBe('0'); // just visual entry for human, nothing on command-line
        expect(store.getState().commandLine).toEqual([]);
        // empty stack press again CE
        await user.click(btnCE);
        expect(commandLine.textContent).toBe('0');
        expect(store.getState().commandLine).toEqual([]);
        unmount();
    });
    it('Enter 2 valid (the same) calculation, if first time results in an error, but second attempt is ok, second attempt replaces first attempt in history stack', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn2, btn4, btnMultiply, btnSubmit } = getUIElements(screen);

        // first attempt
        await user.click(btn2);
        await user.click(btnMultiply);
        await user.click(btn4);

        // nginx configured wrongly, does not hit api
        await fetchMock.mockResponses(
            (request: Request) => {
                // first request: network routing failure
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
            },
            // second request: ok
            (request: Request) => {
                return Promise.resolve<MockResponseInit>({
                    init: {
                        headers: {
                            'content-type': 'application/json'
                        },
                        status: 200,
                        statusText: 'Ok'
                    },
                    body: '{ "type": "value", "payload": 8 }'
                });
            }
        );

        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('Error');

        // history stack should look like this
        expect(store.getState().history).toEqual([
            {
                keyedInExpression: [
                    {
                        type: 'digit',
                        payload: '2'
                    },
                    {
                        type: 'multiply'
                    },
                    {
                        type: 'digit',
                        payload: '4'
                    }
                ],
                result: {
                    type: 'error'
                }
            }
        ]);
        // now click submit again, the network issue has been resolved
        await user.click(btnSubmit);
        expect(commandLine.textContent).toBe('8');
        unmount();
    });
    it('Enter 2 valid (the same) calculation, both succeed, the history is only updated once', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { btn2, btn4, btnMultiply, btnSubmit } = getUIElements(screen);

        // first attempt
        await user.click(btn2);
        await user.click(btnMultiply);
        await user.click(btn4);

        // nginx configured wrongly, does not hit api
        await fetchMock.mockResponses(
            (request: Request) => {
                return Promise.resolve<MockResponseInit>({
                    init: {
                        headers: {
                            'content-type': 'application/json'
                        },
                        status: 200,
                        statusText: 'Ok'
                    },
                    body: '{ "type": "value", "payload": 8 }'
                });
            },
            // second request: ok
            (request: Request) => {
                return Promise.resolve<MockResponseInit>({
                    init: {
                        headers: {
                            'content-type': 'application/json'
                        },
                        status: 200,
                        statusText: 'Ok'
                    },
                    body: '{ "type": "value", "payload": 8 }'
                });
            }
        );

        await user.click(btnSubmit);
        // check result #1
        {
            const { commandLine, changeOnReadyOrError, history } = store.getState();
            expect(changeOnReadyOrError).toBe(1);
            expect(commandLine).toEqual([{ type: 'value', payload: 8 }]);
            expect(history).toEqual([
                {
                    keyedInExpression: [
                        {
                            type: 'digit',
                            payload: '2'
                        },
                        {
                            type: 'multiply'
                        },
                        {
                            type: 'digit',
                            payload: '4'
                        }
                    ],
                    result: {
                        type: 'value',
                        payload: 8
                    }
                }
            ]);
        }

        await user.click(btnSubmit); // no network request
        // check result #2
        {
            const { commandLine, changeOnReadyOrError, history } = store.getState();
            expect(changeOnReadyOrError).toBe(2);
            expect(commandLine).toEqual([{ type: 'value', payload: 8 }]);
            expect(history).toEqual([
                {
                    keyedInExpression: [
                        {
                            type: 'digit',
                            payload: '2'
                        },
                        {
                            type: 'multiply'
                        },
                        {
                            type: 'digit',
                            payload: '4'
                        }
                    ],
                    result: {
                        type: 'value',
                        payload: 8
                    }
                }
            ]);
        }

        // enter the exact same calculations again
        await user.click(btn2);
        await user.click(btnMultiply);
        await user.click(btn4);

        await user.click(btnSubmit); // 2nd network request made
        // check result #3
        {
            const { commandLine, changeOnReadyOrError, history } = store.getState();
            expect(changeOnReadyOrError).toBe(1);
            expect(commandLine).toEqual([{ type: 'value', payload: 8 }]);
            expect(history).toEqual([
                {
                    keyedInExpression: [
                        {
                            type: 'digit',
                            payload: '2'
                        },
                        {
                            type: 'multiply'
                        },
                        {
                            type: 'digit',
                            payload: '4'
                        }
                    ],
                    result: {
                        type: 'value',
                        payload: 8
                    }
                }
            ]);
        }
        unmount();
    });
    it('submitting 2 exact same results, second one results in an error  2 different errors will update the "serverError" prop in the store', async () => {
        const { unmount } = customRender(<App />, store);
        const user = userEvent.setup({ delay: 0.4 });
        const { commandLine, btn2, btn4, btnMultiply, btnSubmit } = getUIElements(screen);

        // mock 2 different errors
        await fetchMock.mockResponses(
            (request: Request) => {
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
            },
            (request: Request) => {
                return Promise.resolve<MockResponseInit>({
                    init: {
                        headers: {
                            'content-type': 'application/json'
                        },
                        status: 400,
                        statusText: 'Bad Request'
                    },
                    body: '{ "error": { "code": 1000, "message": "Expression between 1 and 3 yielded a NaN", "reqId": "req-3" }}'
                });
            }
        );

        // first attempt
        await user.click(btn2);
        await user.click(btnMultiply);
        await user.click(btn4);
        await user.click(btnSubmit);
        // check #1
        {
            const { serverError, history } = store.getState();
            expect(serverError).toEqual({
                error: {
                    code: 9300,
                    message:
                        'Server responded with an error. The response was not in json format: <html><head></head><body>Error</body></head>',
                    reqId: 'N/A'
                }
            });
            expect(commandLine.textContent).toBe('Error');
            expect(history).toEqual([
                {
                    keyedInExpression: [
                        {
                            type: 'digit',
                            payload: '2'
                        },
                        {
                            type: 'multiply'
                        },
                        {
                            type: 'digit',
                            payload: '4'
                        }
                    ],
                    result: {
                        type: 'error'
                    }
                }
            ]);
        }
        // 2nd attempt (will perform network call since it was not an API_REJECT error)
        await user.click(btnSubmit);
        // check #1
        {
            const { serverError, history } = store.getState();
            expect(serverError).toEqual({
                error: {
                    code: 1000,
                    message: 'Expression between 1 and 3 yielded a NaN',
                    reqId: 'req-3'
                }
            });
            expect(commandLine.textContent).toBe('Error');
            expect(history).toEqual([
                {
                    keyedInExpression: [
                        {
                            type: 'digit',
                            payload: '2'
                        },
                        {
                            type: 'multiply'
                        },
                        {
                            type: 'digit',
                            payload: '4'
                        }
                    ],
                    result: {
                        type: 'error'
                    }
                }
            ]);
        }
        unmount();
    });
});
