import React from 'react';
import createStore from '../lib/store';
import App from '../App';

import { customRender } from './test-helper';

describe('User Interface', () => {
    it('check initial DOM structure', () => {
        const store = createStore();
        const { unmount } = customRender(<App />, store);
        expect(document.body).toMatchSnapshot();
        unmount();
    });
});
