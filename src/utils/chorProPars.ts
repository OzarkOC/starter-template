'use strict';
/*
 * Copyright (c) 2014-16 Greg Schoppe <gschoppe@gmail.com>
 * Copyright (c) 2011 Jonathan Perkin <jonathan@perkin.org.uk>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

/* Parse a ChordPro template */
// const divChordProTemp = document.querySelector(`[chordPro="template"]`);
// const divDisplay = document.querySelector("[chordPro='display']");
// const chordProTempValue = divChordProTemp.textContent;

export function parseChordPro(template, transpose) {
  const chordregex = /\[([^\]]*)\]/;
  const inword = /[a-z]$/;
  const buffer = [];
  const transpose_chord = function (chord, trans) {
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    const regex = /([A-Z][b#]?)/g;

    const modulo = function (n, m) {
      return ((n % m) + m) % m;
    };

    return chord.replace(regex, function ($1) {
      if ($1.length > 1 && $1[1] == 'b') {
        if ($1[0] == 'A') {
          $1 = 'G#';
        } else {
          $1 = String.fromCharCode($1[0].charCodeAt() - 1) + '#';
        }
      }

      const index = notes.indexOf($1);
      if (index != -1) {
        return notes[modulo(index + trans, notes.length)];
      }
      return 'XX';
    });
  };

  if (!template) return '';

  template.split('\n').forEach(function (line, linenum) {
    if (line.match(/^#/)) {
      return '';
    }

    if (line.match(chordregex)) {
      if (!buffer.length) {
        buffer.push('<div class="lyric_block">');
      } else {
        buffer.push('</div><div class="lyric_block">');
      }

      let chords = '';
      let lyrics = '';
      let chordlen = 0;

      line.split(chordregex).forEach(function (word, pos) {
        let dash = 0;

        if (pos % 2 == 0) {
          lyrics = lyrics + word.replace(' ', '&nbsp;');

          if (word.match(inword)) {
            dash = 1;
          }

          if (word && word.length < chordlen) {
            chords = chords + '&nbsp;';
            lyrics = dash == 1 ? lyrics + '-&nbsp;' : lyrics + '&nbsp&nbsp;';

            for (let i = chordlen - word.length - dash; i != 0; i--) {
              lyrics = lyrics + '&nbsp;';
            }
          } else if (word && word.length == chordlen) {
            chords = chords + '&nbsp;';
            lyrics = dash == 1 ? lyrics + '-' : lyrics + '&nbsp;';
          } else if (word && word.length > chordlen) {
            for (let i = word.length - chordlen; i != 0; i--) {
              chords = chords + '&nbsp;';
            }
          }
        } else {
          const chord = word.replace(/[[]]/, '');
          if (transpose !== false) {
            chords =
              chords +
              '<span class="chord" data-original-val="' +
              chord +
              '">' +
              transpose_chord(chord, transpose) +
              '</span>';
          } else {
            chords =
              chords + '<span class="chord" data-original-val="' + chord + '">' + chord + '</span>';
          }

          chordlen = chord.length;
        }
      });

      buffer.push('<span class="chorProLine">' + chords + '<br/>\n' + lyrics + '</span>');
      return;
    }

    if (line.match(/^{.*}/)) {
      if (!buffer.length) {
        buffer.push('<div class="command_block">');
      } else {
        buffer.push('</div><div class="command_block">');
      }

      const matches = line.match(/^{(title|t|subtitle|st|comment|c):\s*(.*)}/i);
      if (matches && matches.length >= 3) {
        const command = matches[1];
        const text = matches[2];
        let wrap = '';

        switch (command) {
          case 'title':
          case 't':
            wrap = 'h1';
            break;
          case 'subtitle':
          case 'st':
            wrap = 'h4';
            break;
          case 'comment':
          case 'c':
            wrap = 'em';
            break;
        }

        if (wrap) {
          buffer.push(`<${wrap} class="${command}">${text}</${wrap}>`);
        }
      }

      return;
    }

    buffer.push(line + '<br/>');
  });

  return buffer.join('\n');
}

document.addEventListener('DOMContentLoaded', function () {
  const the_timeout = '';
  const textarea = document.querySelector('textarea');
  const renderingTarget = document.querySelector('.rendering-target');
  const transposeLevel = document.querySelector('.transpose .transpose-level');

  //   textarea.addEventListener('keyup', function () {
  //     clearTimeout(the_timeout);
  //     the_timeout = setTimeout(function () {
  //       const template = textarea.value;
  //       const transpose = parseInt(transposeLevel.dataset.transpose) || 0;
  //       const html = parseChordPro(template, transpose);
  //       renderingTarget.innerHTML = html;
  //     }, 10);
  //   });

  document.querySelector('.transpose .transpose-up').addEventListener('click', function (e) {
    e.preventDefault();
    const oldVal = parseInt(transposeLevel.dataset.transpose) || 0;
    const newVal = oldVal + 1;
    transposeLevel.dataset.transpose = newVal;
    const newText = (newVal > 0 ? '+' : '') + newVal;
    transposeLevel.innerHTML = newText;
    textarea.dispatchEvent(new Event('keyup'));
  });

  document.querySelector('.transpose .transpose-down').addEventListener('click', function (e) {
    e.preventDefault();
    const oldVal = parseInt(transposeLevel.dataset.transpose) || 0;
    const newVal = oldVal - 1;
    transposeLevel.dataset.transpose = newVal;
    const newText = (newVal > 0 ? '+' : '') + newVal;
    transposeLevel.innerHTML = newText;
    textarea.dispatchEvent(new Event('keyup'));
  });
});

// function updateDisplay() {
//   const transpose = $(".transpose .transpose-level").data("transpose");
//   const html = parseChordPro(chordProTempValue, transpose);
//   divDisplay.innerHTML = html;
// }
// updateDisplay();
