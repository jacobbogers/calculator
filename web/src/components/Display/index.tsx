import styles from './display.module.scss';

import HistoryButton from './HistoryButton';
import LastHistoryLine from './LastHistoryLine';
import CommandLine from './CommandLine';

export default function Display() {
    return (
        <div tabIndex={1} className={styles.display}>
            <div className={styles.theGrid}>
                <HistoryButton />
                <LastHistoryLine />
                <CommandLine />
            </div>
        </div>
    );
}
