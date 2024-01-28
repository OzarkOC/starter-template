import { parseChordPro } from '$utils/chorProPars';
import { greetUser } from '$utils/greet';

window.Webflow ||= [];
window.Webflow.push(() => {
  const display = document.querySelector(`[chordPro="display"]`);
  const chordProData = document
    .querySelector(`[chordPro="song"]`)
    ?.innerHTML.replace(/<\/?p>/g, '\n');
  if (!display || !chordProData) return;
  console.log(chordProData);

  updateDisplay(chordProData, display);
  // const chordProData =
});

function updateDisplay(chordProData, display) {
  const transpose = $('.transpose .transpose-level').data('transpose');
  const html = parseChordPro(chordProData, transpose);
  display.innerHTML = html;
}

// chordProLine - The div line
// lyric_block - each line
// chord = chord style
