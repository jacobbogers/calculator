import type { RecordedActions, DigitAction } from './actions';

import { humanizeMathOperatorAction } from './utils';
// type to string map

function consumeDigits(start: number, actions: RecordedActions[]) {
    let stop = start + 1;
    while (stop < actions.length) {
        if (actions[stop].type !== 'digit') {
            break;
        }
        stop++;
    }
    return actions
        .slice(start, stop)
        .map((act) => (act as DigitAction).payload)
        .join('');
}

export function instructionsAsText(actions: RecordedActions[]) {
    if (actions.length === 0) {
        return '0';
    }

    let cursor = 0;

    const textPieces: string[] = [];

    while (cursor < actions.length) {
        const action = actions[cursor];
        // abort if you see 'error' anywhere
        // should only be one element
        if (action.type === 'error') {
            return 'Error';
        }
        if (cursor > 0) {
            textPieces.push(' ');
        }
        switch (action.type) {
            case 'digit':
                const numberAsString = consumeDigits(cursor, actions);
                textPieces.push(numberAsString);
                cursor += numberAsString.length;
                break;
            case 'multiply':
            case 'divide':
            case 'add':
            case 'subtract':
                const operatorAsString = humanizeMathOperatorAction(action);
                textPieces.push(operatorAsString);
                cursor++;
                break;
            case 'value':
                const raw = String(action.payload).toLowerCase();
                // google has non-trivial display rules, but here we mimic some of them to avoid super-long strings
                if (raw.includes('e')) {
                    textPieces.push(normalizeExponentialNotation(7, raw).toString());
                    cursor++;
                    break;
                }
                const dotPos = raw.indexOf('.');
                if (dotPos === -1) {
                    if (raw.length > 12) {
                        textPieces.push(normalizeExponentialNotation(12, action.payload.toExponential()).toString());
                        cursor++;
                        break;
                    }
                    textPieces.push(raw);
                    cursor++;
                    break;
                }
                const beforeDot = raw.slice(0, dotPos);
                const afterDot = raw.slice(dotPos + 1);
                if (beforeDot.length > 9) {
                    textPieces.push(normalizeExponentialNotation(9, action.payload.toExponential()).toString());
                    cursor++;
                    break;
                }
                if (afterDot.length > 9) {
                    const fraction = Math.round(parseFloat('0.' + afterDot) * 1e9) / 1e9;
                    textPieces.push((Math.trunc(action.payload) + fraction).toString());
                    cursor++;
                    break;
                }
                textPieces.push(raw);
                cursor++;
                break;
        }
    }
    return textPieces.join('');
}

function normalizeExponentialNotation(power: number, n: string) {
    const raw = n.toLowerCase();
    const fractionPart = raw.slice(0, raw.indexOf('e'));
    if (fractionPart.length > power) {
        const EPower = Math.pow(10, power);
        const visual = String(Math.round(parseFloat(fractionPart) * EPower) / EPower) + raw.slice(raw.indexOf('e'));
        return parseFloat(visual);
    }
    return n;
}
