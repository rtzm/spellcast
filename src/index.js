import Spellcast from "./Spellcast";

import("draw-from-video").then((drawFromVideo) => {
  let spellcast = new Spellcast(drawFromVideo);
  document.body.onload = spellcast.boot.bind(spellcast);
});

