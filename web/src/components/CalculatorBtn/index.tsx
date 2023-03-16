import React from 'react';
import { PropsWithChildren } from 'react';
import styles from './btn.module.scss';
import classNames from 'classnames';

export type CalcButtonProps = PropsWithChildren<{
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    darker?: boolean;
    bolder?: boolean;
    larger?: boolean;
    smaller?: boolean;
    submit?: boolean;
    disabled?: boolean;
    ['data-testid']?: string;
}>;

export default function CalculatorBtn(props: CalcButtonProps) {
    const className = classNames({
        [styles.btn]: true,
        [styles.darker]: props.darker,
        [styles.bolder]: props.bolder,
        [styles.larger]: props.larger,
        [styles.smaller]: props.smaller,
        [styles.submit]: props.submit,
        [styles.disabled]: props.disabled
    });

    return (
        <div className={className} onClick={props.onClick} data-testid={props['data-testid']}>
            {props.children}
        </div>
    );
}
