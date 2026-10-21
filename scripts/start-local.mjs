import {spawn,spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createMurvikServer} from '../server/murvik-server.mjs';
const workspace=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(workspace);
console.log('Готовлю актуальную версию сайта…');
const build=spawnSync(process.execPath,['node_modules/vite/bin/vite.js','build'],{encoding:'utf8',windowsHide:true});
writeFileSync('artifacts/murvik-local-build.log',(build.stdout||'')+(build.stderr||''));
if(build.status!==0){console.error('Сборка не выполнена. Подробности: artifacts/murvik-local-build.log');process.exit(1);}
const server=createMurvikServer();
server.listen(4173,'127.0.0.1',()=>{console.log('\nСайт открыт: http://127.0.0.1:4173\nМодель: qwen3:8b. Оставьте Ollama и это окно работающими.\nПервый ответ может занять больше времени: модель загружается в память.\nДля остановки нажмите Ctrl+C.');if(process.platform==='win32')spawn('powershell.exe',['-NoProfile','-WindowStyle','Hidden','-Command',"Start-Process 'http://127.0.0.1:4173'"],{windowsHide:true,stdio:'ignore'});});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Порт 4173 занят: возможно, сайт уже запущен. Откройте http://127.0.0.1:4173 или закройте прежнее окно.':error.message);process.exitCode=1;});
