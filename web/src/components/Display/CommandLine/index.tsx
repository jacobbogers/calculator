import { useMemo, useLayoutEffect, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import type { StoreLayout } from '../../../lib/reducers';
import type { RecordedActions } from '../../../lib/actions';
import { instructionsAsText } from '../../../lib/instructionsAsText';

import styles from './command_line.module.scss';

export default function CommandLine() {
    const currentExpression = useSelector<StoreLayout, RecordedActions[]>((store) => store.commandLine);
    const text = useMemo(() => instructionsAsText(currentExpression), [currentExpression]);
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
        <div ref={thisRef} className={styles.command_line}>
            <div>
                <span data-testid="commandLine">{text}</span>
            </div>
        </div>
    );
}
