import React from 'react';
import { PropsWithChildren } from 'react';
import styles from './keyboard.module.scss';

export default function KeyBoard(props: PropsWithChildren<{}>) {
    return <div className={styles.keyboard}>{props.children}</div>;
}
