import { escapeHtml } from '@site/shared/html-escape.ts';

const JSON_TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g;
const SHELL_ASSIGNMENT = /^([A-Z_]+)=(.*)$/;
const SHELL_ENV_FLAG = /^(\s*--env\s+)([A-Z_]+)=(.*)$/;

const wrap = (tokenClass: string, text: string): string =>
  `<span class="${tokenClass}">${escapeHtml(text)}</span>`;

/** One line of JSON as colored HTML. */
export const highlightJsonLine = (line: string): string => {
  let html = '';
  let lastEnd = 0;
  for (const match of line.matchAll(JSON_TOKEN)) {
    const [fullMatch, quoted, colon] = match;
    if (match.index > lastEnd) html += wrap('tk-p', line.slice(lastEnd, match.index));
    if (quoted) {
      html += wrap(colon ? 'tk-k' : 'tk-s', quoted);
      if (colon) html += wrap('tk-p', colon);
    } else {
      html += wrap('tk-n', fullMatch);
    }
    lastEnd = match.index + fullMatch.length;
  }
  if (lastEnd < line.length) html += wrap('tk-p', line.slice(lastEnd));

  return html;
};

/** One line of a shell snippet as colored HTML. */
export const highlightShellLine = (line: string): string => {
  if (line.startsWith('#')) return wrap('tk-c', line);
  const assignment = SHELL_ASSIGNMENT.exec(line);
  if (assignment) {
    return (
      wrap('tk-k', assignment[1] ?? '') + wrap('tk-p', '=') + wrap('tk-s', assignment[2] ?? '')
    );
  }
  const envFlag = SHELL_ENV_FLAG.exec(line);
  if (envFlag) {
    return (
      wrap('tk-p', envFlag[1] ?? '') +
      wrap('tk-k', envFlag[2] ?? '') +
      wrap('tk-p', '=') +
      wrap('tk-s', envFlag[3] ?? '')
    );
  }

  return wrap('tk-n', line);
};

/** Whole code blocks, one line per span, ready to place inside a pre element. */
export const highlightJson = (jsonText: string): string =>
  jsonText.split('\n').map(highlightJsonLine).join('\n');

export const highlightShell = (shellText: string): string =>
  shellText.split('\n').map(highlightShellLine).join('\n');
