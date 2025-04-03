import path from 'path';
import { app } from 'electron';
import { isDev } from './util.js';

export function getPreloadPath() {
  if (isDev()) {
    return path.join(app.getAppPath(), '/dist-electron/preload.cjs');
  } else {
    // In production, look for the preload script in the resources directory
    return path.join(app.getAppPath(), '../preload.cjs');
  }
}

export function getUIPath() {
  return path.join(app.getAppPath(), '/dist-react/index.html');
}

export function getAssetPath() {
  return path.join(app.getAppPath(), isDev() ? '.' : '..', '/src/assets');
}