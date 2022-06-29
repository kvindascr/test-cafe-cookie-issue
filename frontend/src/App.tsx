import React, { useCallback, useState } from 'react';
import axios from 'axios';

const writeRawCookie = (name: string, value: string, expires: Date, path: string, domain?: string) => {
    document.cookie =
        name +
        '=' +
        value +
        (expires ? ';expires=' + expires.toUTCString() : '') +
        (domain ? ';domain=' + domain : '') +
        ';path=' +
        path;
};

const username = 'testUsername' + Math.floor(Math.random()*1000);
const expires = new Date('2030-12-10')
const cookieValue = Math.floor(Math.random()*10000000) ;

const App: React.FC = () => {

    const [cookiesResult, setCookiesResult] = useState('');
    const [result, setResult] = useState('');

    const handleSetCookies = () => {
        writeRawCookie('testUsername', `"${username}"`, expires, '/', '.myapp.app');
        writeRawCookie('testCookie2', `${cookieValue}`, expires, '/', '.myapp.app');
        setCookiesResult('Cookies successfuly set')
    }

    const handleCreateWebworker = useCallback(() => {
        const domain = `local.myapp.app`;
        const endpoint = `backend`;
        const url = `wss://${domain}/${endpoint}`;
        const testWorker = new Worker(new URL('./testWorker.js', import.meta.url), { name: 'testWorker' });
        testWorker.addEventListener('message', (event: any) => {
            if (event.data.action === 'result') {
                setResult(event.data.payload);
                return;
            }
            if (event.data.action === 'error') {
                setResult(event.data.payload.message);
                return;
            }
        });
        testWorker.postMessage(
            {
                action: 'initialize',
                payload: { url },
            },
            [],
        );
    }, []);

    return (
        <div style={{margin: 10}}>
            <h2>Test Cafe cookies issue repo:</h2>
            <p>
              Access this site via alias <b>local.testapp.app</b>
            </p>
            <div id="buttons" style={{marginTop: 15, marginLeft: 15}}>
                <button id="setCookiesBtn" onClick={handleSetCookies} style={{marginRight: 15}}>Set cookies</button>
                <button id="callSocketBtn" onClick={handleCreateWebworker} style={{marginRight: 15}}>Call Socket Via Worker</button>
            </div>
            <div style={{marginBottom: 15, marginTop: 15}}>
                <h5>Cookies Result</h5>
                <div id="cookiesResult" >{cookiesResult}</div>
            </div>
            <div>
                <h5>WSocket via Webworker Result</h5>
                <div id="result">{result}</div>
            </div>
        </div>
    );
};

export default App;
