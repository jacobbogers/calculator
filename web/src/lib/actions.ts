import {
    ValueAction,
    MultiplyAction,
    DivideAction,
    AddAction,
    SubtractAction,
    RecordedActionsSansDigit,
    ServerResponseError
} from '../lib/shared/types';

export type ClearAllAction = {
    type: 'clearAll';
};

export type ResultAction = {
    type: 'result';
};

export type DigitAction = {
    type: 'digit';
    payload: string;
};

type ClearEntryAction = {
    type: 'clearEntry';
};

export type ErrorAction = {
    type: 'error';
};

type RpcInTransit = {
    type: 'rpcInTransit';
};

export type HistoryExpression = Exclude<RecordedActions, ErrorAction>;

export type HistoryEntry = {
    keyedInExpression: HistoryExpression[];
    result: ValueAction | ErrorAction;
};

export type AddHistoryAction = {
    type: 'addToHistory';
    payload: HistoryEntry;
};

export type ServerError = ServerResponseError | { error: undefined };

export type ServerErrorAction = {
    type: 'serverError';
    payload: ServerResponseError;
};

//export type CalculatorStateActions = ResultAction;
export type CalculatorOperationsActions =
    | MultiplyAction
    | DivideAction
    | AddAction
    | SubtractAction
    | ResultAction
    | DigitAction
    | ValueAction
    | ClearEntryAction
    | AddHistoryAction
    | ClearAllAction
    | ErrorAction
    | RpcInTransit
    | ServerErrorAction;

// lookup table
type CalculatorActionsMap = {
    [Action in CalculatorOperationsActions as Action['type']]: Action;
};

// lookup index values of the lookup table
type ActionType = keyof CalculatorActionsMap;

// this is an array of recorded keystrokes and returned results
export type RecordedActions = RecordedActionsSansDigit | DigitAction | ErrorAction;

// select a value of the lookup table by its key
type ActionOfTypeMap<T extends ActionType> = CalculatorActionsMap[T];

// optional type
type Payload<T> = T extends { payload: infer P } ? [P] : never[];

export function createAction<
    TName extends ActionType,
    TAction extends ActionOfTypeMap<TName>,
    TPayload extends Payload<TAction>
>(type: TName, ...payload: TPayload): TAction {
    if (payload.length === 0) {
        return { type } as unknown as TAction;
    }
    return { type, payload: payload[0] } as unknown as TAction;
}
