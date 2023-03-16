import { combineReducers } from 'redux';
import type { Dispatch } from 'redux';

import type {
    CalculatorOperationsActions,
    RecordedActions,
    AddHistoryAction,
    HistoryEntry,
    ServerErrorAction,
    ServerError
} from './actions';

import { createAction, ErrorAction, ResultAction } from './actions';

import type { ServerResponseError } from './shared/types';

import {
    isMathOperatorAction,
    canAddZero,
    copyAndAdd,
    copyAndDelete,
    replaceLastAction,
    hasPrevDecimalDotInCurrentNumber,
    lastIsValidNumberPartial,
    compareActions
} from './utils';

export type StoreLayout = {
    tainted: boolean;
    commandLine: RecordedActions[];
    history: HistoryEntry[];
    inTransit: boolean;
    serverError: ServerError;
    changeOnReadyOrError: number;
};

export interface StoreType {
    dispatch: Dispatch<CalculatorOperationsActions>;
    getState(): StoreLayout;
}

export function reduceTainted(state = false, action: CalculatorOperationsActions) {
    if (
        isMathOperatorAction(action) ||
        action.type === 'digit' ||
        action.type === 'value' ||
        action.type === 'clearEntry' ||
        action.type === 'clearAll'
    ) {
        return true;
    }
    if (action.type === 'result' || action.type === 'error') {
        return false;
    }
    return state;
}

export function reduceCommandLine(
    state = [] as RecordedActions[],
    action: CalculatorOperationsActions
): RecordedActions[] {
    const lastAction = state[state.length - 1];
    switch (action.type) {
        case 'subtract':
            // subtract can be an part of a negative number
            if (lastAction?.type === 'error') {
                return [createAction('digit', '-')];
            }
            if (
                // no keystrokes yet
                state.length === 0 ||
                //
                (lastAction?.type !== 'subtract' && lastAction?.type !== 'add' && isMathOperatorAction(lastAction))
            ) {
                return copyAndAdd(state, createAction('digit', '-'));
            }
            // avoid 2x negative sign
            if (lastAction?.type === 'digit' && lastAction?.payload === '-') {
                break;
            }
            // any other digit, other then negative sign is ok

            if (lastIsValidNumberPartial(state) || lastAction?.type === 'value') {
                return copyAndAdd(state, action);
            }
            if (lastAction?.type === 'add') {
                return replaceLastAction(state, action);
            }
            break;
        case 'add':
        case 'divide':
        case 'multiply':
            if (state.length === 0 || lastAction?.type === 'error') {
                return [createAction('digit', '0'), action];
            }
            if (isMathOperatorAction(lastAction) && lastAction?.type !== action.type) {
                return replaceLastAction(state, action);
            }
            if (lastIsValidNumberPartial(state) || lastAction?.type === 'value') {
                return copyAndAdd(state, action);
            }
            break;
        case 'digit':
            if (lastAction?.type === 'error') {
                return [action];
            }
            if (lastAction?.type === 'value') {
                return [action];
            }
            if (
                state.length === 0 || // its the first entry
                isMathOperatorAction(lastAction) // first entry after an operator
            ) {
                return copyAndAdd(state, action);
            }
            // can only have one "decimal dot" in a number
            if (action.payload === '.' && hasPrevDecimalDotInCurrentNumber(state)) {
                break; // ignore
            }
            if (action.payload === '0') {
                if (canAddZero(state)) {
                    // allow
                    return copyAndAdd(state, action);
                }
                break;
            }
            return copyAndAdd(state, action);
        case 'clearEntry':
            // pop from the state
            if (lastAction) {
                return copyAndDelete(state);
            }
            break;
        case 'clearAll': {
            return [];
        }
        case 'addToHistory': {
            return [action.payload.result];
        }
    }
    return state;
}

function reduceHistory(state = [] as HistoryEntry[], action: AddHistoryAction) {
    if (action.type === 'addToHistory') {
        // adding history when there is existing history
        if (state.length) {
            const latestHistoryEntry = state[state.length - 1];
            // the current expression and prevExpressions (from history) are the same?
            if (compareActions(action.payload.keyedInExpression, latestHistoryEntry.keyedInExpression)) {
                if (action.payload.result.type === 'value' && latestHistoryEntry.result.type === 'error') {
                    // replace last entry with a good one
                    const newState = state.slice();
                    newState[newState.length - 1] = action.payload;
                    return newState;
                }
                // do not  update, incase
                // - both are error
                // - both are value (it is the same value by inference it is the same expression)
                // - recent result was an error while previous one was not for the exact same expression
                return state; // do not update
            }
        }
        // there is no previous history, add it
        // previous history entry is different then
        const newState = state.slice();
        newState.push(action.payload);
        return newState;
    }
    return state;
}

export function reduceInTransit(state = false, action: CalculatorOperationsActions) {
    if (action.type === 'rpcInTransit') {
        return true; // request over network in transit
    }
    // request completed, good or bad
    if (action.type === 'result' || action.type === 'error') {
        return false;
    }
    return state;
}

function shouldUpdateServerError(state: ServerError, actionPayload: ServerResponseError): boolean {
    if (state.error === undefined) {
        return true;
    }
    if (state.error.code === actionPayload.error.code && state.error.message === actionPayload.error.message) {
        return false;
    }
    return true;
}

export function reduceServerResponse(
    state: ServerError = { error: undefined },
    action: ServerErrorAction | AddHistoryAction
): ServerError {
    if (action.type === 'serverError') {
        if (shouldUpdateServerError(state, action.payload)) {
            return { ...action.payload };
        }
    }
    if (action.type === 'addToHistory') {
        // clear error if the next calculation was ok
        if (action.payload.result.type === 'value') {
            return Object.create(null);
        }
    }
    return state;
}

export function reduceChangeOnReadyOrError(state = 0, action: ErrorAction | ResultAction) {
    if (action.type === 'error' || action.type === 'result') {
        return (state % 2) + 1; // toggles between 1 and 2 (starting at 0): 0 - 1 - 2 - 1 - 2, etc
    }
    return state;
}

const rootReducer = combineReducers<StoreLayout>({
    tainted: reduceTainted,
    commandLine: reduceCommandLine,
    history: reduceHistory,
    inTransit: reduceInTransit,
    serverError: reduceServerResponse,
    changeOnReadyOrError: reduceChangeOnReadyOrError
});

export default rootReducer;
