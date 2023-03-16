export const MIME_APPLICATION_JSON = 'application/json';

export const ERR_RESPONSE_ERR_NO_JSON = 9300;
export const ERR_RESPONSE_ERR_NO_VALID_JSON = 9400;

export const ERR_RESPONSE_OK_NO_JSON = 9500;
export const ERR_RESPONSE_OK_NO_VALID_JSON = 9600;
export const ERR_INVALID_REQUEST = 9700;

export const errMsgMap = {
    [ERR_RESPONSE_ERR_NO_JSON]: 'Server responded with an error. The response was not in json format: %text',
    [ERR_RESPONSE_ERR_NO_VALID_JSON]:
        'Server responded with an error. The response was in json, but unknown format: %text',
    [ERR_RESPONSE_OK_NO_JSON]: 'Server responded ok. The response was not in json format: %text',
    [ERR_RESPONSE_OK_NO_VALID_JSON]: 'Server responded ok. THe response was in json, but unknown format: %text',
    [ERR_INVALID_REQUEST]: 'CLIENT ERROR: outgoing request invalid, %text'
};

export function getErr<K extends keyof typeof errMsgMap>(errNo: K, detail: string): string {
    return errMsgMap[errNo].replace('%text', detail);
}
