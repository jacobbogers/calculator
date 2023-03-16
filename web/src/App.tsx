/* vender */
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

/* styles */
import styles from './App.module.scss';

/* components */
import CalculatorBtn from './components/CalculatorBtn';
import KeyBoard from './components/KeyBoard';
import Display from './components/Display';

/* redux */
import type { StoreLayout } from './lib/reducers';

/* misc */
import { createAction } from './lib/actions';

export default function App() {
    const dispatch = useDispatch();
    const isDirty = useSelector<{ tainted: boolean }, boolean>((state) => state.tainted);
    const networkRequestInTransit = useSelector<StoreLayout, boolean>((state) => state.inTransit);

    const safeDispatch = useCallback(
        (...args: Parameters<typeof dispatch>) => {
            if (networkRequestInTransit) {
                return;
            }
            return dispatch(...args);
        },
        [dispatch, networkRequestInTransit]
    );

    const className = useMemo(
        () =>
            classNames({
                [styles.app]: true,
                [styles.wait]: networkRequestInTransit
            }),
        [networkRequestInTransit]
    );

    return (
        <div className={className}>
            <KeyBoard>
                <Display />
                {/* row 1 */}
                <CalculatorBtn disabled darker>
                    Rad
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    Deg
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    x!
                </CalculatorBtn>

                <CalculatorBtn disabled darker>
                    (
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    )
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    %
                </CalculatorBtn>
                {isDirty ? (
                    <CalculatorBtn
                        data-testid="btnClearEntry"
                        darker
                        smaller
                        onClick={() => safeDispatch(createAction('clearEntry'))}
                    >
                        CE
                    </CalculatorBtn>
                ) : (
                    <CalculatorBtn
                        data-testid="btnClearAll"
                        darker
                        smaller
                        onClick={() => safeDispatch(createAction('clearAll'))}
                    >
                        AC
                    </CalculatorBtn>
                )}
                {/* row 2 */}

                <CalculatorBtn disabled darker>
                    Inv
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    sin
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    ln
                </CalculatorBtn>

                <CalculatorBtn data-testid="btn7" onClick={() => safeDispatch(createAction('digit', '7'))}>
                    7
                </CalculatorBtn>
                <CalculatorBtn data-testid="btn8" onClick={() => safeDispatch(createAction('digit', '8'))}>
                    8
                </CalculatorBtn>
                <CalculatorBtn data-testid="btn9" onClick={() => safeDispatch(createAction('digit', '9'))}>
                    9
                </CalculatorBtn>
                <CalculatorBtn
                    data-testid="btnDivide"
                    darker
                    larger
                    onClick={() => safeDispatch(createAction('divide'))}
                >
                    ÷
                </CalculatorBtn>

                {/* row 3 */}

                <CalculatorBtn disabled darker>
                    π
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    cos
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    log
                </CalculatorBtn>

                <CalculatorBtn data-testid="btn4" onClick={() => safeDispatch(createAction('digit', '4'))}>
                    4
                </CalculatorBtn>
                <CalculatorBtn data-testid="btn5" onClick={() => safeDispatch(createAction('digit', '5'))}>
                    5
                </CalculatorBtn>
                <CalculatorBtn data-testid="btn6" onClick={() => safeDispatch(createAction('digit', '6'))}>
                    6
                </CalculatorBtn>
                <CalculatorBtn
                    data-testid="btnMultiply"
                    darker
                    larger
                    onClick={() => safeDispatch(createAction('multiply'))}
                >
                    ×
                </CalculatorBtn>

                {/* row 4 */}

                <CalculatorBtn disabled darker>
                    e
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    tan
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    √
                </CalculatorBtn>

                <CalculatorBtn data-testid="btn1" onClick={() => safeDispatch(createAction('digit', '1'))}>
                    1
                </CalculatorBtn>
                <CalculatorBtn data-testid="btn2" onClick={() => safeDispatch(createAction('digit', '2'))}>
                    2
                </CalculatorBtn>
                <CalculatorBtn data-testid="btn3" onClick={() => safeDispatch(createAction('digit', '3'))}>
                    3
                </CalculatorBtn>
                <CalculatorBtn
                    data-testid="btnSubtract"
                    darker
                    larger
                    onClick={() => safeDispatch(createAction('subtract'))}
                >
                    −
                </CalculatorBtn>

                {/* row 5 */}

                <CalculatorBtn disabled darker>
                    Ans
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    EXP
                </CalculatorBtn>
                <CalculatorBtn disabled darker>
                    <span>xʸ</span>
                </CalculatorBtn>

                <CalculatorBtn data-testid="btn0" onClick={() => safeDispatch(createAction('digit', '0'))}>
                    0
                </CalculatorBtn>
                <CalculatorBtn data-testid="btnDot" bolder onClick={() => safeDispatch(createAction('digit', '.'))}>
                    .
                </CalculatorBtn>
                <CalculatorBtn
                    data-testid="btnSubmit"
                    bolder
                    larger
                    submit
                    onClick={() => safeDispatch(createAction('result'))}
                >
                    =
                </CalculatorBtn>
                <CalculatorBtn data-testid="btnAdd" darker larger onClick={() => safeDispatch(createAction('add'))}>
                    +
                </CalculatorBtn>
            </KeyBoard>
        </div>
    );
}
