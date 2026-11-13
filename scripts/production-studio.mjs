import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { observeExports } from './production-observe.mjs';

const require=createRequire(import.meta.url);
const pkg=require.resolve('@remotion/cli/package.json');
const {bin}=require(pkg);
const cli=path.resolve(path.dirname(pkg),typeof bin==='string'?bin:bin.remotion);
const observer=await observeExports(process.cwd());
const child=spawn(process.execPath,[cli,'studio',...process.argv.slice(2)],{stdio:'inherit',windowsHide:true});
child.on('error',async error=>{console.error(error.message);await observer.close();process.exitCode=1;});
child.on('exit',async code=>{await observer.close();process.exitCode=code??1;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{child.kill(signal);});
