import { getTargetScriptEl } from './util';
import endWith from 'licia/endWith';
import safeStorage from 'licia/safeStorage';
import randomId from 'licia/randomId';
import rtrim from 'licia/rtrim';
import startWith from 'licia/startWith';

let serverUrl = location.origin;

if ((window as any).ChiiServerUrl) {
  serverUrl = (window as any).ChiiServerUrl;
} else {
  const element = getTargetScriptEl();
  if (element) {
    serverUrl = element.src.replace('target.js', '');
  }
}

if (!endWith(serverUrl, '/')) {
  serverUrl += '/';
}

if (!startWith(serverUrl, 'http')) {
  const protocol = location.protocol === 'https:' ? 'https:' : 'http:';
  if (!startWith(serverUrl, '//')) {
    serverUrl = `//${serverUrl}`;
  }
  serverUrl = `${protocol}${serverUrl}`;
}

let embedded = false;
let rtc = false;
let cdn = '';

const element = getTargetScriptEl();
if (element) {
  if (element.getAttribute('embedded') === 'true') {
    embedded = true;
  }
  if (element.getAttribute('rtc') === 'true') {
    rtc = true;
  }
  cdn = element.getAttribute('cdn') || '';
}

if (cdn && endWith(cdn, '/')) {
  cdn = rtrim(cdn, '/');
}

const sessionStore = safeStorage('session');  
const isIframe = window.parent !== window;  
const isNewWindow = window.opener || (window.name && window.name !== 'chii-target');  
  

let storageKey = 'chii-id'; // default key
if (isIframe) {  
  let depth = 0;
  let currentWindow: Window = window;
  try {
    while (currentWindow.parent !== currentWindow) {
      depth++;
      currentWindow = currentWindow.parent;
    }
  } catch {
    // Cross-origin iframe
  }
  storageKey = `chii-iframe-l${depth}-${randomId(4)}`; // different key for each iframe
}  
  
let id = sessionStore.getItem(storageKey);  
if (!id || (isNewWindow && !isIframe)) {  
  if (isIframe) {  
    // iframe generate unique id
    let iframeCount = parseInt(sessionStore.getItem('chii-iframe-count') || '0');  
    iframeCount++;  
    sessionStore.setItem('chii-iframe-count', iframeCount.toString());  
    id = `${randomId(4)}-iframe${iframeCount}`;  
  } else {  
    id = randomId(6);  
  }  
    
  sessionStore.setItem(storageKey, id);  
  if (!isIframe) {  
    window.name = 'chii-target';  
  }  
}  

export {
  // https://chii.liriliri.io/base/
  serverUrl,
  embedded,
  rtc,
  cdn,
  id,
};
