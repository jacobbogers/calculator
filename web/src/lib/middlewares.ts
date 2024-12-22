import type { Middleware, Dispatch, AnyAction } from 'redux';

import type { CalculatorOperationsActions } from './actions';
import type { StoreType } from './reducers';
import setupValidation from './validation';

import { isMathOperatorAction, lastIsValidNumberPartial, pruneKeyStrokes, createSyntheticError } from './utils';
import { createAction, HistoryEntry, HistoryExpression } from './actions';
import { ValueAction, ServerResponseError, FinalvalueAction } from './shared/types';
import {
    MIME_APPLICATION_JSON,
    ERR_RESPONSE_ERR_NO_JSON,
    ERR_RESPONSE_ERR_NO_VALID_JSON,
    ERR_RESPONSE_OK_NO_JSON,
    ERR_RESPONSE_OK_NO_VALID_JSON,
    getErr
} from './constants';

import { API_REST_PATH_SUFFIX, ERR_APP_CALCULATOR_REJECT } from './shared/constants';

function handleErrors(error: ServerResponseError, next: Dispatch, historyExpression: HistoryExpression[]): AnyAction {
    const serverErrorAction = createAction('serverError', error);

    const errorAction = createAction('error');
    const historyAction = createAction('addToHistory', {
        keyedInExpression: historyExpression,
        result: errorAction
    });
    next(serverErrorAction);
    next(historyAction);
    return next(errorAction);
}

export const calculateResultMiddleware: Middleware = ({ getState }: StoreType) => {
    const { validateServerSuccess, validateServerError } = setupValidation();
    return (next) => {
        return async (action: CalculatorOperationsActions) => {
            if (action.type !== 'result') {
                return next(action);
            }
            const { commandLine, history } = getState();
            const lastTokenOnCommandLine = commandLine[commandLine.length - 1];
            const lastHistoryExpression = history[history.length - 1];

            // don't send to backend if there is a dangling operator at the end
            if (isMathOperatorAction(lastTokenOnCommandLine)) {
                return;
            }
            if (lastTokenOnCommandLine.type !== 'error') {
                if (lastTokenOnCommandLine.type === 'value') {
                    return next(createAction('result'));
                }
                if (!lastIsValidNumberPartial(commandLine)) {
                    // unlike google calculator, no visual cue.
                    return;
                }
            }

            const serverError = getState().serverError;

            // previous error was an API reject (not due to network err, etc)
            const doNotReSubmit =
                lastTokenOnCommandLine?.type === 'error' && serverError.error?.code === ERR_APP_CALCULATOR_REJECT;
            if (doNotReSubmit) {
                // do not re-attempt to submit
                // mimic google visual behavior
                return next(createAction('error'));
            }

            // convert all occurrences of "digits" to "values", remove all "error"
            const prunedRecords =
                lastTokenOnCommandLine?.type !== 'error'
                    ? pruneKeyStrokes(commandLine)
                    : lastHistoryExpression.keyedInExpression.slice();

            // prepare command line keystrokes for storage in history
            const historyExpression =
                lastTokenOnCommandLine?.type !== 'error'
                    ? (commandLine.filter((token) => token.type !== 'error') as HistoryEntry['keyedInExpression'])
                    : lastHistoryExpression.keyedInExpression.slice();

            // is the prunedRecords a singular type="value" token?
            if (prunedRecords.length === 1 && prunedRecords[0].type === 'value') {
                const historyAction = createAction('addToHistory', {
                    keyedInExpression: historyExpression,
                    result: prunedRecords[0]
                });
                next(historyAction);
                return next(createAction('result'));
            }

            const requestBody = JSON.stringify(prunedRecords);

            next(createAction('rpcInTransit'));

            const response = await fetch(API_REST_PATH_SUFFIX, {
                method: 'POST',
                mode: 'same-origin',
                credentials: 'same-origin',
                redirect: 'follow',
                keepalive: true,
                body: requestBody,
                headers: {
                    accept: MIME_APPLICATION_JSON,
                    'content-type': MIME_APPLICATION_JSON
                }
            });
            if (!response.ok) {
                // make a backup, later we want to potentially get as text
                const responseBackup = response.clone();
                let errorAsJson: ServerResponseError;
                try {
                    errorAsJson = (await response.json()) as ServerResponseError;
                } catch (err) {
                    const text = await responseBackup.text();
                    const error = createSyntheticError(
                        ERR_RESPONSE_ERR_NO_JSON,
                        getErr(ERR_RESPONSE_ERR_NO_JSON, text)
                    );
                    return handleErrors(error, next, historyExpression);
                }
                if (!validateServerError(errorAsJson)) {
                    const text = await responseBackup.text();
                    const error = createSyntheticError(
                        ERR_RESPONSE_ERR_NO_VALID_JSON,
                        getErr(ERR_RESPONSE_ERR_NO_VALID_JSON, text)
                    );
                    return handleErrors(error, next, historyExpression);
                }
                return handleErrors(errorAsJson, next, historyExpression);
            }
            // response is ok, but it could be an invalid json
            const responseBackup = response.clone();
            let replyAsJson: ValueAction;
            try {
                const finalValueAction: FinalvalueAction = await response.json();
                replyAsJson = {
                    ...finalValueAction,
                    payload: parseFloat(finalValueAction.payload)
                };
            } catch (err) {
                const text = await responseBackup.text();
                const error = createSyntheticError(ERR_RESPONSE_OK_NO_JSON, getErr(ERR_RESPONSE_OK_NO_JSON, text));
                return handleErrors(error, next, historyExpression);
            }
            if (!validateServerSuccess(replyAsJson)) {
                const text = await responseBackup.text();
                const error = createSyntheticError(
                    ERR_RESPONSE_OK_NO_VALID_JSON,
                    getErr(ERR_RESPONSE_OK_NO_VALID_JSON, text)
                );
                return handleErrors(error, next, historyExpression);
            }
            const historyAction = createAction('addToHistory', {
                keyedInExpression: historyExpression,
                result: replyAsJson
            });
            next(historyAction);
            return next(createAction('result'));
        };
    };
};
