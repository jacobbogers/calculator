import { useMemo, useLayoutEffect, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { StoreLayout } from '../../../lib/reducers';
import { HistoryEntry } from '../../../lib/actions';
import { instructionsAsText } from '../../../lib/instructionsAsText';

import styles from './last-history.module.scss';

export default function LastHistoryLine() {
    const history = useSelector<StoreLayout, HistoryEntry[]>((store) => store.history);
    const tainted = useSelector<StoreLayout, boolean>((state) => state.tainted);
    const historyText = useMemo(() => {
        const prevHistoryExpression = history[history.length - 1];
        if (tainted) {
            // there is no previous expressions stored in history, you are entering an expression for the first time
            if (prevHistoryExpression === undefined) {
                return 'Ans = 0';
            }
            // display previous expression result or expression itself (in case of previous error result)
            if (prevHistoryExpression.result.type === 'error') {
                // try to find non error result from history
                // the targetted browsers dont have findlast
                const lastNonError = history
                    .slice()
                    .reverse()
                    .find((hExpr) => hExpr.result.type !== 'error');
                if (lastNonError) {
                    return `Ans = ${instructionsAsText([lastNonError.result])}`;
                }
                return 'Ans = 0';
            }
            return `Ans = ${instructionsAsText([prevHistoryExpression.result])}`;
        }
        // you are at app initial start?
        if (prevHistoryExpression === undefined) {
            return '';
        }
        return `${instructionsAsText(prevHistoryExpression.keyedInExpression)} =`;
    }, [tainted, history]);
    const readyOrErrorReceived = useSelector<StoreLayout, number>((store) => store.changeOnReadyOrError);

    const thisRef = useRef<HTMLDivElement>(null);

    // on mount or whenever the component is set
    useEffect(() => {
        function transitionEnd(e: TransitionEvent) {
            const classList = (e.target as HTMLDivElement).classList;
            // what transition
            if (classList.contains(styles.start)) {
                classList.remove(styles.start); // will start "exit" transition
            }
            // end of "exit transition", do nothing
        }
        if (thisRef.current) {
            thisRef.current.addEventListener('transitionend', transitionEnd);
        }
        return () => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            thisRef.current && thisRef.current.removeEventListener('transitionend', transitionEnd);
        };
    }, [thisRef]);

    useLayoutEffect(() => {
        if (readyOrErrorReceived !== 0) {
            if (thisRef.current) {
                const classList = thisRef.current.classList;
                classList.add(styles.start);
            }
        }
    }, [readyOrErrorReceived]);

    return (
        <div ref={thisRef} className={styles.last_history}>
            <span data-testid="lastHistoryLine">{historyText}</span>
        </div>
    );
}
