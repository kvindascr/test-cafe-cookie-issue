import { debug } from '../testcafe/log';
import { ReactSelector } from 'testcafe-react-selectors';
import {ClientFunction, Selector} from 'testcafe';

const STABLE_TEST_ROOM = 'stable-baa';
const url1 = 'google.com';
const url2 = 'news.ycombinator.com';
const url3 = 'linear.app';

const setCookiesBtn = ReactSelector('AppContainer');
const callWSBtn = ReactSelector('AppContainer').withProps({ clientId: this.clientId }).findReact('BrowserAppContainer');

export const getPageHTML = ClientFunction(() => {
    return document.documentElement.outerHTML;
});

fixture('TestFixture').beforeEach(async (t) => {
    debug('starting fixture');
});

test('add browser and test core actions', async (t) => {
    await t.navigateTo('https://local.myapp.app/');
    // await t.debug();
    await t.wait(5000);
    await t.click('#setCookiesBtn');
    await t.click('#callSocketBtn');
    await t.wait(2000);
    // await t.debug();
    await t.expect(Selector('#result').textContent).contains('Cookies found');
});
