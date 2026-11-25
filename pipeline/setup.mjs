#!/usr/bin/env node
// One-time setup: installs the pipeline's own tools into .tools/ .
//   npm run setup
// - Python environment for the local voice (Kokoro)      -> .tools/venv-voice
// - Python environment for effects and transitions (OpenCV, moderngl) -> .tools/venv-effects
// - Python environment for transcribing footage (faster-whisper) -> .tools/venv-transcribe
// - The Kokoro voice model (about 380 MB)                -> .tools/voice-models
// - The Whisper small.en speech model (about 470 MB)     -> .tools/transcribe-models
// - A headless Chrome for combining video                -> .tools/browser
// - The example and gallery videos, when the clone only has their Git LFS placeholders
// Needs `uv` and FFmpeg on PATH. Safe to run again: finished steps are skipped.
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cpSync, createReadStream, createWriteStream, existsSync, mkdirSync, openSync, readdirSync, readSync, closeSync, renameSync, rmSync, statSync} from 'node:fs';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {join} from 'node:path';
import {root, tools, paths, voiceModelFiles, findFile, browserName} from './tools.mjs';

const WIN = process.platform === 'win32';
// Windows on ARM: OpenCV, the speech tools and the voice runtime publish no ARM builds for Windows, so the environments
// use the x64 Python there (Windows runs it through its built-in emulation). Everywhere else: the machine's own Python.
const WIN_ARM = WIN && [process.arch, process.env.PROCESSOR_ARCHITECTURE, process.env.PROCESSOR_ARCHITEW6432].some(a => /arm64/i.test(a ?? ''));
const PYTHON = WIN_ARM ? 'cpython-3.13-windows-x86_64-none' : '3.13';
const run = (command, args) => { if (spawnSync(command, args, {stdio: 'inherit', shell: WIN && command === 'npx'}).status !== 0) throw Error(`${command} ${args[0]} failed`); };
const has = command => spawnSync(WIN ? 'where' : 'which', [command]).status === 0;
const sha256 = async file => { const hash = createHash('sha256'); await pipeline(createReadStream(file), hash); return hash.digest('hex'); };

// The repository keeps its videos and sounds in Git LFS. A clone made without git-lfs installed gets a three-line text
// placeholder in place of each one, so the gallery and the examples show nothing. Fetch the real files here, so nobody has
// to install git-lfs: each placeholder names its file's SHA-256, and GitHub serves the file itself over plain HTTPS.
const MEDIA = /\.(mov|mp4|webm|m4v|mkv|mp3)$/i;
function placeholder(file) {
  try {
    if (statSync(file).size > 400) return null;
    const buffer = Buffer.alloc(400), handle = openSync(file, 'r'), length = readSync(handle, buffer, 0, 400, 0); closeSync(handle);
    const text = buffer.toString('utf8', 0, length);
    return text.startsWith('version https://git-lfs') ? text.match(/oid sha256:([0-9a-f]{64})/)?.[1] ?? null : null;
  } catch { return null; }
}
// Every file under the repository, as forward-slash paths relative to it, skipping folders the pipeline writes itself.
const SKIP = new Set(['.git', '.tools', '.cache', 'node_modules', 'projects']);
function walk(dir) {
  return readdirSync(join(root, dir), {withFileTypes: true}).flatMap(entry => {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) return dir === '' && SKIP.has(entry.name) ? [] : walk(rel);   // skipped at the top level only
    return entry.isFile() ? [rel] : [];
  });
}
async function media() {
  const git = (...args) => spawnSync('git', args, {cwd: root, encoding: 'utf8', maxBuffer: 1 << 26});
  const listed = git('ls-files', '-z');
  // A downloaded zip is not a git clone but has the same placeholders: find them on disk and fetch them from the main branch.
  const clone = listed.status === 0;
  const all = clone ? listed.stdout.split('\0').filter(f => MEDIA.test(f)) : walk('').filter(f => MEDIA.test(f));
  const missing = all.map(f => ({file: f, oid: placeholder(join(root, f))})).filter(m => m.oid);
  const lfs = clone && spawnSync('git', ['lfs', 'version']).status === 0;
  // Without git-lfs, git would list every fetched file as changed: tell it to leave them alone. With git-lfs they are ordinary again.
  const settle = () => { if (!clone) return; for (let i = 0; i < all.length; i += 40) git('update-index', lfs ? '--no-skip-worktree' : '--skip-worktree', '--', ...all.slice(i, i + 40)); };
  if (!missing.length) { settle(); console.log('✓ example and gallery videos'); return; }
  if (lfs) {
    console.log(`… fetching ${missing.length} videos and sounds (git lfs pull)`);
    if (git('lfs', 'pull').status === 0 && !missing.some(m => placeholder(join(root, m.file)))) { settle(); console.log('✓ example and gallery videos'); return; }
  }
  const origin = (clone && git('remote', 'get-url', 'origin').stdout.trim().match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)?.[1]) || 'blotato/contentskills';
  const commit = (clone && git('rev-parse', 'HEAD').stdout.trim()) || 'main';   // a zip: its files match main, and the checksum below rejects any that do not
  console.log(`… downloading ${missing.length} videos and sounds (about 450 MB the first time)`);
  let failed = 0;
  for (const {file, oid} of missing) {
    const target = join(root, file), part = target + '.part';
    try {
      const response = await fetch(`https://media.githubusercontent.com/media/${origin}/${commit}/${file.split('/').map(encodeURIComponent).join('/')}`);
      if (!response.ok) throw Error(String(response.status));
      await pipeline(Readable.fromWeb(response.body), createWriteStream(part));
      if (await sha256(part) !== oid) throw Error('checksum');
      renameSync(part, target);
    } catch (error) { failed++; rmSync(part, {force: true}); console.log(`  could not fetch ${file} (${error.message})`); }
  }
  if (!lfs) settle();
  console.log(failed ? `· ${failed} of ${missing.length} videos could not be fetched; the gallery and examples will have gaps. Run setup again to retry.` : '✓ example and gallery videos');
}

function venv(name, python, requirements, probe) {
  if (existsSync(python) && spawnSync(python, ['-c', probe]).status === 0) { console.log(`✓ ${name} environment`); return; }
  console.log(`… installing ${name} environment`);
  const dir = join(python, '../..');
  rmSync(dir, {recursive: true, force: true});
  run('uv', ['venv', '--python', PYTHON, '--quiet', dir]);
  run('uv', ['pip', 'install', '--quiet', '--python', python, '-r', join(root, 'pipeline', requirements)]);
  if (spawnSync(python, ['-c', probe]).status !== 0) throw Error(`${name} environment installed but does not import correctly`);
  console.log(`✓ ${name} environment`);
}

try {
  if (WIN_ARM) console.log('Windows on ARM: using the x64 Python for the environments (the video tools have no ARM builds for Windows).');
  await media();
  for (const command of ['uv', 'ffmpeg']) if (!has(command)) throw Error(`"${command}" is required and was not found on PATH.`);
  mkdirSync(tools, {recursive: true});
  venv('voice', paths.voicePython, 'requirements-voice.txt', 'import kokoro_onnx, phonemizer, soundfile');
  venv('effects', paths.effectsPython, 'requirements-effects.txt', 'import cv2, numpy, moderngl');
  venv('transcribe', paths.transcribePython, 'requirements-transcribe.txt', 'import faster_whisper, av');

  // The speech model: faster-whisper downloads it the first time footage is transcribed.
  mkdirSync(paths.transcribeModels, {recursive: true});
  const speech = join(paths.transcribeModels, 'faster-whisper-small.en');
  if (existsSync(join(speech, 'model.bin'))) console.log('✓ speech model: small.en');
  else console.log('· speech model small.en will be downloaded the first time footage is transcribed');

  mkdirSync(paths.voiceModels, {recursive: true});
  for (const file of voiceModelFiles) {
    const target = join(paths.voiceModels, file.name);
    if (!existsSync(target) || await sha256(target) !== file.sha256) {
      console.log(`… downloading ${file.name}`);
      const response = await fetch(file.url);
      if (!response.ok) throw Error(`Could not download ${file.url} (${response.status})`);
      await pipeline(Readable.fromWeb(response.body), createWriteStream(target));
      if (await sha256(target) !== file.sha256) { rmSync(target); throw Error(`${file.name} does not match its expected checksum; removed it.`); }
    }
    console.log(`✓ voice model: ${file.name}`);
  }

  if (!findFile(paths.browser, browserName)) {
    console.log('… downloading headless browser'); run('npx', ['--yes', '@puppeteer/browsers', 'install', 'chrome-headless-shell@stable', '--path', paths.browser]);
  }
  console.log(`✓ headless browser`);
  console.log('\nSetup complete. Next: npm run dashboard, then ask your agent for a video (docs/REFERENCE.md has two walkthroughs).');
} catch (error) { console.error('Setup failed: ' + error.message); process.exitCode = 1; }
