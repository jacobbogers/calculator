import { createSlice } from '@reduxjs/toolkit';
import type { RecordedActions } from '../actions';
import { createAction } from '../actions';
import { isMathOperatorAction, lastIsValidNumberPartial, pruneKeyStrokes, createSyntheticError } from '../utils';

const initialState: RecordedActions[] = [];

function subtract(state: RecordedActions[]) {
    const lastAction = state[state.length - 1];
    if (lastAction?.type === 'error') {
        state = [createAction('digit', '-')];
        return;
    }
    if (
        // no keystrokes yet
        state.length === 0 ||
        //
        (lastAction?.type !== 'subtract' && lastAction?.type !== 'add' && isMathOperatorAction(lastAction))
    ) {
        state.push(createAction('digit', '-'));
        return;
    }
    // avoid 2x negative sign
    if (lastAction?.type === 'digit' && lastAction?.payload === '-') {
        return;
    }
    // any other digit, other then negative sign is ok
    if (lastIsValidNumberPartial(state) || lastAction?.type === 'value') {
        state.push(createAction('subtract'));
        return;
    }
    if (lastAction?.type === 'add') {
        // replace
        state[state.length - 1] = createAction('subtract');
        return;
    }
}

function addDivMultiply(state: RecordedActions[]) {
    const lastAction = state[state.length - 1];
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
}

export const commandLineSlice = createSlice({
    name: 'commandLine',
    initialState,
    reducers: {
        subtract
    }
});

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
