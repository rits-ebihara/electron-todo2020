import { contextBridge } from 'electron';
import core from './core';

contextBridge.exposeInMainWorld('core', core);
