type MultiplyAction = {
    type: 'multiply';
};

type DivideAction = {
    type: 'divide';
};

type AddAction = {
    type: 'add';
};

type SubtractAction = {
    type: 'subtract';
};

type ValueAction = {
    type: 'value';
    payload: number;
};

type FinalvalueAction = {
    type: 'value';
    payload: string;
}

type ServerResponseError = {
    error: {
        code: number;
        message: string;
        reqId: string;
    };
    ctx?: Record<string, unknown>;
};

type MathOperatorActions = MultiplyAction | DivideAction | AddAction | SubtractAction;
type RecordedActionsSansDigit = MathOperatorActions | ValueAction;

export type {
    MultiplyAction,
    DivideAction,
    AddAction,
    SubtractAction,
    ValueAction,
    ServerResponseError,
    MathOperatorActions,
    RecordedActionsSansDigit,
    FinalvalueAction
};
