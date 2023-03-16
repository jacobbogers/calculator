import type { Screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { render, RenderOptions } from '@testing-library/react';
import type { Store } from 'redux';

const testComponents = {
    btn7: null,
    btn8: null,
    btn9: null,
    btnDivide: null,
    btn4: null,
    btn5: null,
    btn6: null,
    btnMultiply: null,
    btn1: null,
    btn2: null,
    btn3: null,
    btnSubtract: null,
    btn0: null,
    btnDot: null,
    btnSubmit: null,
    btnAdd: null,
    commandLine: null,
    lastHistoryLine: null
};

type TestIdComponentMap = {
    [btnName in keyof typeof testComponents]: HTMLDivElement | null;
};

type ButtonName = keyof TestIdComponentMap;

export function getUIElements(screen: Screen) {
    const copy = Object.assign({}, testComponents) as Record<ButtonName, HTMLElement | null>;
    const keys: ButtonName[] = Object.keys(copy) as ButtonName[];
    keys.forEach((key) => {
        copy[key] = screen.getByTestId(key);
    });
    return copy as Record<ButtonName, HTMLElement>;
}

export const customRender = (ui: React.ReactElement, store: Store, options?: Omit<RenderOptions, 'wrapper'>) => {
    function AllTheProviders({ children }: { children: React.ReactNode }) {
        return <Provider store={store}>{children}</Provider>;
    }
    return { ...render(ui, { wrapper: AllTheProviders, ...options }), store };
};
