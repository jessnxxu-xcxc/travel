/* Cover / hero illustrations per trip theme (flat picture-book style, 3px ink outline). */
window.__THEMES = (function () {
  const S = '<svg class="hero-svg" viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg" stroke="#3E3A39" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">';
  const sky = '<g class="a-sun"><circle cx="300" cy="38" r="20" fill="#F6D27A"/></g><g class="a-cloud1"><path d="M40 46c0-9 8-15 16-13 3-8 15-10 21-2 9-2 15 6 12 14z" fill="#fff"/></g><g class="a-cloud2"><path d="M222 30c0-7 6-11 12-10 3-6 12-7 16-1 7-1 11 5 9 11z" fill="#fff"/></g>';
  const plane = '<g class="a-plane"><path d="M120 40 l34 -6 l10 -10 l6 2 l-6 12 l18 2 l4 -4 l4 1 l-3 7 l-55 6 z" fill="#fff"/></g>';
  const ground = '<path d="M0 132 H360" fill="none"/>';
  const E = '</svg>';
  return {
    travel: { label: '旅行', svg: S + sky + plane +
      '<rect x="40" y="78" width="70" height="54" rx="10" fill="#F2A497"/><path d="M60 78v-10h30v10M40 100h70" fill="none"/><circle cx="55" cy="132" r="0"/>' +
      '<circle cx="190" cy="100" r="32" fill="#A8D3E6"/><path d="M160 92c12 4 20-6 30 0s18 6 28-2M170 118c10-6 22 2 34-4" fill="none"/>' +
      '<rect x="250" y="84" width="76" height="48" rx="6" fill="#fff"/><path d="M262 98h30M262 110h22" fill="none"/><rect x="300" y="92" width="18" height="18" rx="3" fill="#B9DAA5"/>' + ground + E },
    tokyo: { label: '東京', svg: S + sky + plane +
      '<path d="M0 132 L70 66 Q78 58 86 66 L160 132 Z" fill="#A8D3E6"/><path d="M58 77 L70 66 Q78 58 86 66 L98 77 L88 84 L78 76 L68 84 Z" fill="#fff"/>' +
      '<g class="a-tower"><path d="M196 132 L214 50 L232 132" fill="#F2A497"/><path d="M214 50 L214 26M203 98 H225M207 78 H221" fill="none"/><path d="M201 106 L227 106 L229 114 L199 114 Z" fill="#F2A497"/></g>' +
      '<g><path d="M268 132 L274 52 L280 132" fill="#fff"/><rect x="268" y="66" width="12" height="6" rx="2" fill="#A8D3E6"/><path d="M274 52 L274 30" fill="none"/></g>' + ground + E },
    kyoto: { label: '京都', svg: S + sky +
      '<path d="M90 132V70M190 132V70" fill="none" stroke-width="8"/><path d="M70 62 Q140 50 210 62 L206 72 Q140 62 74 72 Z" fill="#F2A497"/><path d="M84 86H196" fill="none" stroke-width="6"/>' +
      '<path d="M250 132l20-40 20 40z" fill="#B9DAA5"/><path d="M280 132l24-52 24 52z" fill="#B9DAA5"/>' +
      '<g class="a-petal" fill="#F2A497" stroke-width="2"><path d="M40 90c4-6 10-2 6 4-2 3-6 2-6-4z"/><path d="M230 70c4-6 10-2 6 4-2 3-6 2-6-4z"/></g>' + ground + E },
    snow: { label: '北國雪景', svg: S + '<g class="a-cloud1"><path d="M40 46c0-9 8-15 16-13 3-8 15-10 21-2 9-2 15 6 12 14z" fill="#fff"/></g>' +
      '<path d="M0 132 L90 54 L180 132Z" fill="#A8D3E6"/><path d="M68 73 L90 54 L112 73 L100 80 L90 72 L80 80Z" fill="#fff"/><path d="M150 132 L240 70 L330 132Z" fill="#A8D3E6"/><path d="M222 82 L240 70 L258 82 L248 88 L240 82 L232 88Z" fill="#fff"/>' +
      '<g class="a-petal" fill="#fff" stroke-width="2"><circle cx="40" cy="80" r="4"/><circle cx="300" cy="50" r="4"/><circle cx="200" cy="40" r="4"/><circle cx="130" cy="30" r="4"/></g>' + ground + E },
    island: { label: '海島', svg: S + sky + plane +
      '<path d="M0 132 Q90 112 180 132 T360 132" fill="#A8D3E6"/><path d="M60 132 Q120 104 200 132Z" fill="#F6D27A"/>' +
      '<path d="M120 116 Q116 80 126 60" fill="none" stroke-width="5"/><path d="M126 60 q-26 -6 -36 10 M126 60 q22 -12 36 4 M126 60 q-8 -22 -26 -24 M126 60 q14 -20 32 -18" fill="#B9DAA5"/>' + E },
    city: { label: '城市', svg: S + sky + plane +
      '<rect x="40" y="70" width="44" height="62" rx="4" fill="#A8D3E6"/><rect x="96" y="44" width="50" height="88" rx="4" fill="#F6D27A"/><rect x="158" y="80" width="40" height="52" rx="4" fill="#F2A497"/><rect x="210" y="56" width="46" height="76" rx="4" fill="#B9DAA5"/><rect x="268" y="88" width="50" height="44" rx="4" fill="#fff"/>' +
      '<path d="M54 86h16M54 102h16M110 62h22M110 80h22M110 98h22M224 74h18M224 92h18" fill="none"/>' + ground + E },
    nature: { label: '山林', svg: S + sky +
      '<path d="M0 132 L80 70 L160 132Z" fill="#B9DAA5"/><path d="M120 132 L210 52 L300 132Z" fill="#B9DAA5"/><path d="M190 70 L210 52 L230 70 L220 76 L210 68 L200 76Z" fill="#fff"/>' +
      '<path d="M300 132v-24M300 108l-12 14h24z" fill="#B9DAA5"/><path d="M40 132v-16M40 116l-10 12h20z" fill="#B9DAA5"/>' + ground + E }
  };
})();
