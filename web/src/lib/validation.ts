import { calculatorRequest, calculatorResponse, errorResponse } from './shared/schema';
import { RecordedActionsSansDigit, ValueAction, ServerResponseError } from './shared/types';
import Ajv from 'ajv';
import type { ValidateFunction } from 'ajv';

export default function setupValidation() {
    const ajv = new Ajv();
    ajv.addSchema(calculatorRequest);
    ajv.addSchema(calculatorResponse);
    ajv.addSchema(errorResponse);
    const validateRequest = ajv.getSchema(calculatorRequest.$id) as ValidateFunction<RecordedActionsSansDigit>;
    const validateServerSuccess = ajv.getSchema(calculatorResponse.$id) as ValidateFunction<ValueAction>;
    const validateServerError = ajv.getSchema(errorResponse.$id) as ValidateFunction<ServerResponseError>;
    return { ajv, validateRequest, validateServerSuccess, validateServerError };
}
