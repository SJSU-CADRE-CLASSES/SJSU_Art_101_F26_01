const page = document.querySelector('#page');
const links = document.querySelectorAll('[data-page]');

const views = {
  edition: () => `<section class="page"><div class="dateline">Breaking / the city is listening</div><div class="lead-grid"><div class="lead"><h1>What if privacy became a <em>public utility?</em></h1><p class="dek">A new generation of civic technology is being developed to give people control over the emotional systems built to watch them.</p><p class="byline">By Mara Venn / Future Systems Desk</p></div><div class="scene"><span class="scanner"></span><div class="scene-caption">A responsive concourse in Zone 04. The yellow line represents the moment a sensor asks permission.</div></div></div><div class="section-title">The question of the day <span>01</span></div><div class="briefs"><article class="brief"><span class="tag">The premise</span><h3>The city can feel you.</h3><p>Wearables and architecture translate stress into changes in light, temperature, sound and air. Help can arrive before a person asks for it.</p></article><article class="brief"><span class="tag">The problem</span><h3>But who owns the signal?</h3><p>A nervous body is not a public resource. When the atmosphere changes around you, comfort starts to look like a broadcast.</p></article><article class="brief"><span class="tag">The proposal</span><h3>Build the pause.</h3><p>Veil is a counter-system: a small layer of technology that lets a person interrupt detection, soften the room and choose what care looks like.</p></article></div><div class="section-title" style="margin-top:48px">Read the prototype <span>02</span></div><p class="intro">The first Veil prototype does not try to make the city less intelligent. It tries to make intelligence answerable to the person being measured.</p></section>`,

  prototype: () => `<section class="page article-page"><div class="dateline">The underground / field report 02</div><article class="feature-article"><header><p class="tag">Counter-surveillance / wearable systems</p><h1>The Black Market for Being Unreadable</h1><p class="article-dek">Inside the hidden trade in garments, jewelry and skin-safe devices designed to confuse the machines that claim to know what we feel.</p><p class="byline">By Mara Venn / Independent Systems Desk</p></header><div class="article-body"><p class="dropcap">The first rule of the underground market is that nobody calls it a market. They call it a fitting, a repair, a favor between friends. In the back room of a shuttered alterations shop, a woman known only as Sable opens a metal case and lays out the things people wear when they want to disappear from a machine.</p><p>There is a black mesh scarf threaded with conductive fiber. A pair of smoked lenses that scatter the tiny reflections used to estimate pupil movement. A soft collar, no wider than a watchband, that emits a shifting field of harmless noise whenever a municipal scanner tries to read the wearer’s pulse, temperature or facial tension.</p><blockquote>“They say the sensors are reading public feeling,” Sable tells me. “But public feeling is just a polite name for a private body being treated like evidence.”</blockquote><p>Over the past three years, the government’s ambient sensing network has moved from cameras at transit gates to something harder to see. Streetlights sample voice stress. Storefronts map faces against behavioral profiles. Building entrances estimate agitation before deciding whether to open, slow or summon assistance. The official language is prevention: early intervention, safer crowds, responsive services.</p><p>The leaked procurement documents use a different vocabulary. <em>Inference.</em> <em>Compliance probability.</em> <em>Emotional volatility.</em> The systems do not read thoughts in the science-fiction sense, but they make a powerful claim all the same: that a person’s body can be translated into a prediction, and that prediction can be used to make decisions before the person has spoken.</p><div class="article-break"><span>✳</span><span>THE FITTING ROOM / 23:10 LOCAL</span><span>✳</span></div><p>The devices sold through Sable’s network are crude compared with the state systems. That is their appeal. They are repairable, legible and deliberately limited. A brooch called a <strong>blanker</strong> creates enough visual noise to make a camera uncertain about the direction of a glance. A woven undershirt interrupts the clean skin-temperature readings used by the newest sidewalk arrays. A ceramic charm, worn against the sternum, broadcasts nothing at all; it simply reminds its wearer when a nearby sensor has started paying attention.</p><p>“People think we are selling invisibility,” says Sable. “We are selling friction. A second look. A bad reading. A moment where the system has to admit it does not know.”</p><p>Demand has grown among people who work in monitored buildings, people with protest histories, people whose grief has been flagged as instability, and teenagers who learned early that a school corridor could change color when its sensors decided they were a threat. The buyers are not anti-technology. Most carry phones, use navigation and depend on networked care. What they reject is the idea that participation in public life requires surrendering the right to remain ambiguous.</p><blockquote>“The government invented the vocabulary of emotional tracking,” says one courier who asked to be called Finch. “The underground is inventing a grammar of refusal.”</blockquote><p>There is risk in the trade. Some countermeasures are scams. Others interfere with medical devices or trigger security responses of their own. The sellers know this, which is why their instructions are handwritten, their warranties verbal and their best products passed quietly from one trusted wearer to another. The market survives by staying small enough to stay human.</p><p>At the end of the fitting, Sable asks whether I want the collar switched on. I decline. She nods, closes the case and turns off the room’s single lamp. In the dark, the city continues measuring the building from the street: heat, motion, probable mood. For a few seconds, inside a room with no cameras, the machine has nothing to say about us.</p></div><footer class="article-footer"><span>Filed under: civic technology / privacy / Zone 04</span><span>Illustration: reconstructed from seized devices</span></footer></article></section>`,

  dispatches: () => `<section class="page"><div class="dateline">Dispatches from the not-yet / reports 04—07</div><div class="dispatch"><article><span class="tag">04 / architecture</span><h2>The softest room in the city has no cameras.</h2><p>At the Quiet Field pilot, sensors are replaced by user-declared thresholds. The room is less accurate, but participants say they can finally stop performing wellness.</p></article><article><span class="tag">05 / policy</span><h2>New civic code calls for an emotional off-switch.</h2><p>A proposed amendment would make public sensing opt-in by default and require buildings to display exactly what they can infer.</p></article><article><span class="tag">06 / culture</span><h2>Are we ready to be unreadable?</h2><p>Young residents are trading “blank mode” accessories that scramble the assumptions of personalization systems. The trend is less anti-technology than pro-mystery.</p></article><article><span class="tag">07 / editorial</span><h2>Care is not control with a nicer interface.</h2><p>Technology can notice a person without owning the meaning of what it notices. The difference is a pause, a prompt, and a way out.</p></article><div class="pullquote">“The future of safety may depend on giving people the right to remain emotionally unremarkable.”</div></div></section>`
};

views.room = () => `<section class="page room-page"><div class="dateline">Live environment / Zone 04 / consent pending</div><div class="room-intro"><div><p class="tag">First-person field test</p><h1>Enter the feeling room.</h1><p class="intro">The room is listening for changes in your body. Move through the space, change the signal, and watch the environment decide what you might be feeling.</p></div><div class="room-note">This is a fictional interface. The readings are simulated, but the question is real: what happens when a room believes it knows you?</div></div><div class="room-console"><div class="room-viewport" id="room-viewport"><div class="room-ceiling"></div><div class="room-wall room-wall-back"><div class="window"><i></i><i></i><i></i></div><div class="wall-mark">care / inference / response</div></div><div class="room-wall room-wall-left"><span>YOU ARE HERE</span></div><div class="room-floor"><div class="floor-line"></div><div class="floor-line"></div><div class="floor-line"></div></div><button class="room-object room-lamp" data-room-state="lamp" aria-label="Inspect responsive lamp"><span></span></button><button class="room-object room-door" data-room-state="door" aria-label="Inspect exit door"><span>EXIT / OFFLINE</span></button><div class="room-sensor"><i></i><span>ambient sensor / active</span></div><div class="room-crosshair"></div><div class="room-prompt" id="room-prompt">the room is waiting for a signal</div></div><aside class="room-readout"><div class="readout-top"><span>veil / room 01</span><span class="status" id="room-status">● observing</span></div><div class="room-readout-main"><span class="tag">inferred emotional state</span><strong id="emotion-state">unreadable</strong><p id="emotion-copy">Choose a signal below. The room will translate it into light, distance and temperature.</p></div><div class="emotion-controls" role="group" aria-label="Simulate emotional signal"><button class="emotion-control" data-emotion="calm">calm</button><button class="emotion-control" data-emotion="wary">wary</button><button class="emotion-control" data-emotion="overwhelmed">overwhelmed</button></div><div class="signal-meter"><label><span>signal confidence</span><span id="confidence-value">00%</span></label><div><i id="confidence-bar"></i></div></div><div class="room-log" id="room-log">no intervention has been made</div></aside></div><div class="room-footnote"><span>click the lamp or door to inspect the room</span><span>no biometric data is collected</span></div></section>`;

const originalEdition = views.edition;
views.edition = () => originalEdition().replace(
  'A new generation of civic technology is being developed to give people control over the emotional systems built to watch them.',
  'a new generation of advanced tech is being built for us to regain control of our emotions and the systems that were developed to watch them!'
);

function render() {
  const rawKey = location.hash.slice(1) || 'edition';
  const key = rawKey === 'room' ? 'edition' : rawKey;
  page.innerHTML = (views[key] || views.edition)();
  if (key === 'edition') {
    page.querySelector('.lead h1').textContent = '*NEW* prototype for privacy in development!';
    page.querySelector('.lead .byline').textContent = 'By Shane Ordanza / Future Systems Desk';
    page.querySelector('.lead .dek').textContent = 'a new generation of advanced tech is being built for us to regain control of our emotions and the systems that were developed to watch them!';
    const prototypeVisual = page.querySelector('.scene');
    prototypeVisual.classList.add('prototype-visual');
    prototypeVisual.innerHTML = '<img src="assets/privacy-prototype.png" alt="A blueprint-style wearable privacy prototype" />';
    page.querySelector('.lead-grid').after(prototypeVisual);
    page.querySelector('.lead-grid').classList.add('single-lead');
  }
  links.forEach(link => link.classList.toggle('active', link.dataset.page === key));
  window.scrollTo(0, 0);
}

function initRoom() {
  const viewport = document.querySelector('#room-viewport');
  const state = document.querySelector('#emotion-state');
  const copy = document.querySelector('#emotion-copy');
  const prompt = document.querySelector('#room-prompt');
  const status = document.querySelector('#room-status');
  const confidence = document.querySelector('#confidence-value');
  const bar = document.querySelector('#confidence-bar');
  const log = document.querySelector('#room-log');
  const readings = {
    calm: { label: 'settled', value: 34, copy: 'The room lowers its volume. A soft perimeter opens around you.', log: 'response: ambient light softened / distance increased' },
    wary: { label: 'alert', value: 68, copy: 'The room has noticed a change. It is moving closer to ask what it means.', log: 'response: sensor focus narrowed / exit unlocked' },
    overwhelmed: { label: 'overloaded', value: 91, copy: 'The room is reading too much into the signal. Veil recommends a pause.', log: 'response: sound muted / privacy layer recommended' }
  };
  document.querySelectorAll('.emotion-control').forEach(button => button.addEventListener('click', () => {
    const reading = readings[button.dataset.emotion];
    document.querySelectorAll('.emotion-control').forEach(item => item.classList.remove('chosen'));
    button.classList.add('chosen');
    viewport.dataset.emotion = button.dataset.emotion;
    state.textContent = reading.label;
    copy.textContent = reading.copy;
    confidence.textContent = `${reading.value}%`;
    bar.style.width = `${reading.value}%`;
    log.textContent = reading.log;
    status.textContent = '● interpreting';
    prompt.textContent = `signal received / ${reading.label}`;
  }));
  document.querySelectorAll('.room-object').forEach(object => object.addEventListener('click', () => {
    const isLamp = object.dataset.roomState === 'lamp';
    prompt.textContent = isLamp ? 'the lamp is watching your face' : 'the exit is available / the room wants a reason';
    log.textContent = isLamp ? 'object: adaptive light / sensor array active' : 'object: offline door / consent required';
  }));
}

window.addEventListener('hashchange', render);
render();
