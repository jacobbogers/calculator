import type { RecordedActions, CalculatorOperationsActions, DigitAction } from './actions';

import type { MathOperatorActions, RecordedActionsSansDigit, ServerResponseError } from './shared/types';
import { createAction } from './actions';

const opCodeMap: Record<MathOperatorActions['type'], string> = {
    multiply: '×',
    divide: '÷',
    add: '+',
    subtract: '-'
};

export function createSyntheticError(code: number, message: string): ServerResponseError {
    return {
        error: {
            code,
            message,
            reqId: 'N/A'
        }
    };
}

export function hasPrevDecimalDotInCurrentNumber(actions: RecordedActions[]): boolean {
    for (let i = actions.length - 1; i >= 0; i--) {
        const current = actions[i];
        if (isMathOperatorAction(current)) {
            return false; // ok to add decimal dot
        }
        if (current.type === 'digit' && current.payload === '.') {
            return true; // do not add
        }
    }
    return false;
}

export function coalesceDigitActionPayload(keyStrokes: RecordedActions[], start: number): string {
    let stop = start + 1;
    while (stop < keyStrokes.length) {
        if (keyStrokes[stop].type !== 'digit') {
            break;
        }
        stop++;
    }
    const strValue = (keyStrokes as DigitAction[])
        .slice(start, stop)
        .map((k) => k.payload)
        .join('');
    return strValue;
}

export function isMathOperatorAction(action: CalculatorOperationsActions | undefined): action is MathOperatorActions {
    return action !== undefined && action.type in opCodeMap;
}

export function humanizeMathOperatorAction(action: MathOperatorActions): string {
    return opCodeMap[action.type];
}

// Example, of google calculator bug, it is possible to enter "-. ÷ 1" and "-. ÷ 1" in google calculator (resulting in "Error" text)
// here we avoid this error by demanding at least one numerical digit in the number
export function lastIsValidNumberPartial(actions: RecordedActions[]): boolean {
    let startOfNumber = actions.length - 1;

    while (startOfNumber >= 0) {
        const current = actions[startOfNumber];
        if (current.type !== 'digit') {
            break;
        }
        startOfNumber--;
    }

    // nothing changed, so partial does not exist at the end of the array
    if (startOfNumber === actions.length - 1) {
        return false;
    }

    // bump up to the first valid digit
    startOfNumber++;

    // cheap validation, we check for at least a number digit see notes above
    for (let i = startOfNumber; i < actions.length; i++) {
        const current = actions[i] as DigitAction;
        if (current.payload === '.' || current.payload === '-') {
            continue; // skip
        }
        // 0-9, finding one digit is enough
        return true;
    }
    return false;
}

export function canAddZero(actions: RecordedActions[]): boolean {
    let startOfNumber = actions.length - 1;

    while (startOfNumber >= 0) {
        const current = actions[startOfNumber];
        if (current.type !== 'digit') {
            startOfNumber++;
            break;
        }
        startOfNumber--;
    }

    // I am the first zero prefix in the number? accept me
    if (startOfNumber === actions.length) {
        return true;
    }

    if (startOfNumber < 0) {
        startOfNumber = 0;
    }

    // skip negative number sign
    if ((actions[startOfNumber] as DigitAction).payload === '-') {
        startOfNumber++;
    }

    // I am the first zero prefix in the number? accept me
    if (startOfNumber === actions.length) {
        return true;
    }

    for (let i = startOfNumber; i < actions.length; i++) {
        const current = actions[i] as DigitAction;
        if (current.payload === '.') {
            return true;
        }
        if (current.payload === '0') {
            continue;
        }
        return true;
    }
    return false;
}

export function copyAndAdd(prev: RecordedActions[], action: RecordedActions): RecordedActions[] {
    const newState = prev.slice();
    newState.push(action);
    return newState;
}

export function copyAndDelete(prev: RecordedActions[]): RecordedActions[] {
    const newState = prev.slice();
    newState.pop();
    return newState;
}

export function replaceLastAction(prev: RecordedActions[], action: RecordedActions): RecordedActions[] {
    const newState = prev.slice();
    newState[newState.length - 1] = action;
    return newState;
}

export function compareActions(listA: RecordedActions[], listB: RecordedActions[]): boolean {
    if (listA.length !== listB.length) {
        return false;
    }
    for (let i = 0; i < listA.length; i++) {
        // for ts inference
        const a = listA[i];
        const b = listB[i];

        if (a.type !== b.type) {
            return false;
        }
        if (a.type === 'value' && b.type === 'value') {
            if (a.payload !== b.payload) {
                return false;
            }
        }
        if (a.type === 'digit' && b.type === 'digit') {
            if (a.payload !== b.payload) {
                return false;
            }
        }
    }
    return true;
}

export function pruneKeyStrokes(input: RecordedActions[]): RecordedActionsSansDigit[] {
    const result: RecordedActionsSansDigit[] = [];
    let cursor = 0;
    while (cursor < input.length) {
        const token = input[cursor];
        if (token.type === 'error') {
            cursor++;
            continue;
        }
        if (
            token.type === 'multiply' ||
            token.type === 'add' ||
            token.type === 'divide' ||
            token.type === 'subtract' ||
            token.type === 'value'
        ) {
            result.push(token);
            cursor++;
            continue;
        }
        if (token.type === 'digit') {
            const strValue = coalesceDigitActionPayload(input, cursor);
            result.push(createAction('value', parseFloat(strValue)));
            cursor += strValue.length;
            continue;
        }
        // unreachable code
    }
    return result;
}
