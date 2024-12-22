import React from 'react';
import { PropsWithChildren } from 'react';
import styles from './history-btn.module.scss';

import HistoryIcon from './History';

export type HistoryButtonProps = PropsWithChildren<{}>;

export default function HistoryButton(props: HistoryButtonProps) {
    return (
        <div className={styles.history}>
            <HistoryIcon />
        </div>
    );
}
