(function () {
  'use strict';
  var cv = document.getElementById('c'), ctx = cv.getContext('2d');
  var listEl = document.getElementById('list'), detEl = document.getElementById('detail'), readout = document.getElementById('readout');
  var qEl = document.getElementById('q'), sugEl = document.getElementById('sug'), clrEl = document.getElementById('clr'), countEl = document.getElementById('count');

  var TYPES = {
    Body: [226,114,26], Bond: [160,50,70], Nature: [40,120,80], Mind: [28,100,190], World: [110,70,150]
  };

  // Chronological: [name, life stage, type, description]
  var RAW = [
    ['First breath', 'Infancy', 'Body', 'The first lungful of air outside the womb. TADPOLE is not yet implanted, so this one is stored from a parent\'s shared recollection.'],
    ['First time hearing a heartbeat', 'Infancy', 'Bond', 'Held against a parent\'s chest, the steady rhythm is the first pattern the mind learns to trust.'],
    ['First bath', 'Infancy', 'Body', 'Warm water and a steady hand. The first time the body is held by something other than arms.'],
    ['First time hearing music', 'Infancy', 'Mind', 'Erik Satie - Gymnopédie No.1, drifting in from another room. The first song ever heard, and the first pattern that feels like it was made for you.'],
    ['First smile', 'Infancy', 'Bond', 'A reflex that turns into a reply. The first time a face smiles back and it means something.'],
    ['First taste of cow\'s milk', 'Infancy', 'Body', 'Cold, creamy and unfamiliar after the warmth of before. A new flavor, and a first step toward the table.'],
    ['First time seeing a dog', 'Infancy', 'Nature', 'A warm, wet nose and a wagging tail. Before the animal-link existed this was just wonder; now the dog remembers it too.'],
    ['First steps', 'Infancy', 'Body', 'Three wobbling steps across a floor into open arms, and the thrill of moving under your own power.'],
    ['First scraped knee', 'Infancy', 'Body', 'Sting, tears and a kiss to make it better. Pain learned as something that passes.'],
    ['First word', 'Infancy', 'Mind', 'Spoken aloud, one of the last words a child will say before telepathic speech takes over everyday talk.'],
    ['First bedtime story', 'Infancy', 'Mind', 'The words mean nothing yet, but the voice carries a shape the mind begins to follow into sleep.'],
    ['First time seeing snow', 'Infancy', 'Nature', 'Silent, cold and falling from nowhere. A whole street goes soft and strange.'],
    ['First time recognizing the wind in the trees', 'Infancy', 'Nature', 'Core memory. Psithurism: the whisper of wind moving through leaves. Heard from a blanket under an old tree, it became a favorite sound, and the one the mind returns to when it needs calm.', 3],
    ['First time seeing a cat', 'Infancy', 'Nature', 'A slow blink from across the room, and the strange sense of being studied back.'],
    ['First rain on skin', 'Childhood', 'Nature', 'Cold drops on bare arms. The first time weather is felt as something alive.'],
    ['First time seeing the ocean', 'Childhood', 'Nature', 'A horizon with no edge. The size of it is felt before it is understood.'],
    ['First time swimming', 'Childhood', 'Nature', 'Held up by water, then letting go. Weight vanishes and the body discovers a second element.'],
    ['First ice cream', 'Childhood', 'Body', 'Cold, sweet and dripping down the wrist. A small, perfect, entirely sensory record.'],
    ['First night under the stars', 'Childhood', 'Nature', 'No ceiling, no glow from a screen. Just a sky full of distant suns and the question of what is out there.'],
    ['First friend', 'Childhood', 'Bond', 'Someone chosen rather than assigned. The first time another mind feels like a place you can visit.'],
    ['First day of school', 'Childhood', 'World', 'A new room, new faces and a first taste of belonging to something bigger than a family.'],
    ['Learning to ride a bike', 'Childhood', 'Body', 'A hand lets go without telling you. Balance clicks in, and the world gets bigger.'],
    ['First lost tooth', 'Childhood', 'Body', 'A gap, a coin and a quiet sense that the body is changing without asking.'],
    ['First book finished', 'Childhood', 'Mind', 'A whole world held in the head for days. The last memory many people have of reading from paper.'],
    ['First birthday cake', 'Childhood', 'Bond', 'Candles, a crowd of faces and a wish made in silence. The first time a day is made just for you.'],
    ['First time climbing a tree', 'Childhood', 'Body', 'Rough bark, a branch just out of reach and the view from the top. Fear and pride in the same breath.'],
    ['First thunderstorm', 'Childhood', 'Nature', 'A flash, a count and a rumble that shakes the floor. Hiding under a blanket and loving it.'],
    ['First time drawing a picture', 'Childhood', 'Mind', 'A crooked house and a sun with a face. The first thing made that was never there before.'],
    ['First time feeding a bird', 'Childhood', 'Nature', 'Crumbs on an open palm and a sparrow who decides to trust you.'],
    ['First campfire', 'Childhood', 'Nature', 'Orange light, woodsmoke and stories told in the dark. Older than any technology.'],
    ['First sleepover', 'Childhood', 'Bond', 'Whispering past bedtime in a house that smells different. Independence, in small doses.'],
    ['First time catching a fish', 'Childhood', 'Nature', 'A tug on the line and a silver flash. Wonder, followed by the quiet decision to let it go.'],
    ['First time telling a lie', 'Childhood', 'Mind', 'A small false thing said to see what happens. The first discovery that minds can be separate.'],
    ['Losing a loved one (grandmother)', 'Youth', 'Bond', 'Everyone who loved her feels it at once, and the grief is carried by many. The first loss that stays.', 13],
    ['First TADPOLE implant', 'Youth', 'Mind', 'A tiny, painless procedure. Then a faint hum, and the sense of a second horizon opening behind the eyes.'],
    ['First telepathic word', 'Youth', 'Mind', 'A sentence carried between two minds with no voice and no screen. Stored as the feeling of being understood before the words finished.'],
    ['The last screen', 'Youth', 'World', 'A household display switched off for good after data linked screens to declining vision and wellbeing. Images now arrive directly in the mind.'],
    ['First shared emotion', 'Youth', 'Bond', 'With both minds open by choice, a friend\'s joy arrives inside you. For a moment, it is hard to tell where theirs ends and yours begins.'],
    ['First time flying', 'Youth', 'Body', 'A glider ride with the pilot\'s sense of lift shared directly. Falling, but upward.'],
    ['First crush', 'Youth', 'Bond', 'A flush, a stumble and a name that suddenly feels heavy to say. Private, by choice.'],
    ['First time performing on stage', 'Youth', 'Body', 'Bright lights, a held breath and a room of minds leaning in. The nerves turn into joy halfway through.'],
    ['First backpacking trip', 'Youth', 'Nature', 'Three days on foot with everything carried on your back. Blisters, a cold stream and a summit camp under open stars.'],
    ['First time meeting a sentient animal', 'Youth', 'Nature', 'A genetically modified crow lands on a bench, looks you in the eye and says hello in your own head.'],
    ['First time feeling a stranger\'s joy', 'Youth', 'Bond', 'A crowd laughing at once, and a laugh that is not yours rising in your chest anyway.'],
    ['First time dancing', 'Youth', 'Body', 'Music shared into every mind in the room, so that all bodies move to the same beat.'],
    ['First time cooking a meal', 'Youth', 'Body', 'Burnt edges, a lopsided result and the pride of feeding someone you care about.'],
    ['First argument', 'Youth', 'Bond', 'Heat, hurt and the horror of feeling the other side of it. Neither of you could hide behind words.'],
    ['First apology', 'Youth', 'Bond', 'Saying sorry and feeling it land. Forgiveness arrives as relief that is shared by both.'],
    ['First time seeing a whale', 'Youth', 'Nature', 'A back rising out of gray water, and a song heard in your own head. The ocean knew you were there.'],
    ['First night alone in the city', 'Youth', 'World', 'A million minds humming around you, and no one you know among them.'],
    ['First time moving away from home', 'Youth', 'World', 'A packed bag, a long hug and the first real silence in a room of your own. One chair, one plant and a quiet that slowly feels like company.', 20],
    ['First time mentoring someone', 'Youth', 'Mind', 'Passing on something you learned, and watching it take root in another mind.'],
    ['First time meeting a mind from far away', 'Youth', 'Mind', 'Someone on the other side of the planet, closer than the person next to you.'],
    ['Graduation', 'Adulthood', 'World', 'Knowledge is limitless through the AI link, so the ceremony celebrates what a person made of it.'],
    ['Moving back home', 'Adulthood', 'World', 'Boxes in the hallway and a childhood room that feels smaller. Awkward at first, then oddly comforting.', 22],
    ['First time moving to college', 'Adulthood', 'World', 'A dorm key, a stranger for a roommate and a campus full of minds to meet.', 23],
    ['Borrowed grief', 'Adulthood', 'Bond', 'A stranger\'s grief shared by choice through TADPOLE. Remembered as weight in the chest that belonged to someone else.'],
    ['First job', 'Adulthood', 'World', 'Joining the civic network as a contributing mind. The first paycheck arrives as a number glowing at the edge of thought.'],
    ['Primate conversation', 'Adulthood', 'Nature', 'A genetically modified primate speaks its first full thought to a human, and the human feels the reply as well as hears it.'],
    ['Cephalopod dialogue', 'Adulthood', 'Nature', 'A cephalopod shares color-thought across the water. Its experience is shown as pattern and pressure rather than language.'],
    ['First time sharing a dream', 'Adulthood', 'Mind', 'Two sleepers walk the same invented city, and wake knowing the same street names.'],
    ['Moving into a first home', 'Adulthood', 'World', 'Bare walls, a single chair and the quiet thrill of a space that belongs to you.'],
    ['Best friend\'s wedding', 'Adulthood', 'Bond', 'Two hundred guests feel the same happiness at once. Nobody has ever been this understood by a room.'],
    ['Hive convergence', 'Adulthood', 'Mind', 'Thousands of minds choose to think together. During deep convergence, identity thins at the edges; afterwards, each mind returns to itself.'],
    ['First visit to the deep sea', 'Adulthood', 'Nature', 'A dive to the dark with an octopus guide, glowing signals passing between you in the black water.'],
    ['Birth of a niece', 'Adulthood', 'Bond', 'Time stops, and every emotion arrives together. The new aunt or uncle feels the baby\'s first fear and first calm.'],
        ['First solo trip abroad', 'Adulthood', 'World', 'A new city, a language loaded overnight and the freedom of answering to no one.'],
    ['Dropping out of college', 'Adulthood', 'World', 'A hard conversation, a cleared desk and the odd lightness of choosing a different path.', 25],
    ['First Hetero-sapien', 'Adulthood', 'World', 'The first engineered life form intended as the next step after Homo sapiens. Its birth record is among the most visited in the archive.'],
    ['Teaching a cousin to swim', 'Adulthood', 'Nature', 'Holding a small body above the water, and feeling their trust as your own.'],
    ['A dog\'s memory of you', 'Adulthood', 'Nature', 'Shared by choice for the first time: you, from knee height, as the center of someone\'s whole world.'],
    ['The private thought', 'Adulthood', 'Mind', 'Even in the shared field, a mind keeps one thought to itself. This memory is stored as proof that connection leaves room for a private self.'],
    ['First time falling in love', 'Adulthood', 'Bond', 'Two minds choosing to share what they feel, and the happiest and most exposed feeling there is.', 26],
    ['First heartbreak', 'Adulthood', 'Bond', 'The first time empathy hurts. Both sides felt it clearly, and neither could look away.'],
    ['First promotion', 'Adulthood', 'World', 'Trust from the network arrives as a quiet change in how others\' minds meet yours.'],
    ['Climbing a mountain', 'Adulthood', 'Body', 'Burning lungs, thin air and a summit shared live with every friend who could not come.'],
    ['Planting a first garden', 'Adulthood', 'Nature', 'Dirt under the nails and a row of seeds. Weeks of waiting, then one green shoot.'],
    ['Adopting a rescued animal', 'Adulthood', 'Nature', 'A frightened animal that slowly stops being afraid, and tells you so in its own words.'],
    ['Learning a language in a night', 'Adulthood', 'Mind', 'A whole tongue loaded through the AI link, and the first sentence spoken to a stranger who understood.'],
    ['Meeting a Hetero-sapien neighbor', 'Adulthood', 'World', 'Next door lives the next step of humanity. They bring over bread and ask about the weather.'],
    ['A first trip to orbit', 'Adulthood', 'World', 'The whole planet in one view, with no borders drawn on it and no screen between you and it.'],
    ['Building a home with my hands', 'Adulthood', 'Body', 'Timber, nails and a roof raised by friends. A house that remembers who built it.'],
    ['Forgiving an old enemy', 'Adulthood', 'Bond', 'Opening a mind that had been closed for years, and finding both of you were afraid.'],
    ['Singing with a whale pod', 'Adulthood', 'Nature', 'A low, rolling chorus that TADPOLE translates into feeling. No words, only belonging.'],
    ['A quiet morning', 'Adulthood', 'Mind', 'Nothing urgent, nothing shared. Coffee, light on the floor and a mind that is only yours.'],
    ['Reconciling with a friend', 'Adulthood', 'Bond', 'A long gap closed in a single moment. Both of you remembered the good years first.'],
    ['Disconnecting for a week', 'Adulthood', 'Mind', 'A chosen silence in the hills. The first days feel like missing a limb, the last feel like returning home.'],
    ['Dancing in the crowd mind', 'Adulthood', 'Body', 'A festival of ten thousand, one rhythm and no one out of step.'],
    ['Wellbeing zenith', 'Young adult', 'World', 'Data-driven rule-utilitarianism reaches an all-time peak of flourishing across every conscious creature, measured and recorded through TADPOLE.'],
        ['Technocratic charter', 'Young adult', 'World', 'The founding record of the world government that rules by data, ratified within living memory. Subjective experience is quantified and logged from this point on.'],
    ['Meeting a friend\'s newborn', 'Young adult', 'Bond', 'A tiny mind with no memories yet, and the strange honor of being one of its first.'],
    ['Return to the childhood ocean', 'Young adult', 'Nature', 'The same shoreline as a grown adult. The sea remembers nothing, and you remember everything.'],
    ['Last walk with a grandparent', 'Young adult', 'Bond', 'Few words, many shared silences and a lifetime of understanding laid bare.'],
    ['Letting a memory go', 'Young adult', 'Mind', 'Choosing to archive a heavy memory rather than carry it. The weight lifts, and its record remains.'],
    ['First gray hair', 'Young adult', 'Body', 'A single silver strand in the mirror at thirty-one. Acceptance arrives faster than expected.'],
    ['Changing careers', 'Young adult', 'World', 'Walking away from a safe path toward a stranger one. Terrifying for a week, then it feels like breathing.'],
    ['Visiting the first home', 'Young adult', 'World', 'Smaller rooms than remembered, and a doorframe still marked with heights.'],
    ['Reading a letter on paper', 'Young adult', 'Mind', 'Ink, folded creases and a voice from years ago. An object that no signal can replace.'],
    ['Reunion of old friends', 'Young adult', 'Bond', 'A decade falls away, and everyone feels how little has changed underneath.'],
    ['Planting a tree', 'Young adult', 'Nature', 'A sapling and a hand-dug hole. A promise made to a future that will outlast you.'],
    ['Saying goodbye to a childhood dog', 'Young adult', 'Nature', 'Slow steps, a shared silence and the memory of the first day you met, held by both of you.'],
    ['Sharing a memory with a sibling', 'Young adult', 'Mind', 'Passing a cherished moment across, so that it lives in two minds instead of one.'],
    ['Reviewing the archive so far', 'Young adult', 'Mind', 'Thirty-three years laid out on the galaxy, and the quiet surprise at how much is still ahead.'],
    ['Today', 'Young adult', 'Mind', 'This moment, still being recorded. The newest memory in the bank, not yet complete.']
  ];
  var RAW2 = [
    ['First time tasting honey', 'Infancy', 'Body', 'A single golden drop on a finger. Sweetness arrives as a surprise, and the face says everything.', 1],
    ['First time feeling grass', 'Infancy', 'Nature', 'Cool blades under bare feet. The ground is alive, and ticklish.', 2],
    ['First time hearing a bird sing', 'Infancy', 'Nature', 'A bright run of notes from a branch. The first time a voice came from something that was not a person.', 2],
    ['First time splashing in a puddle', 'Infancy', 'Body', 'Both feet, all at once. Water everywhere, and a laugh that carries down the street.', 3],
    ['First stuffed animal', 'Infancy', 'Bond', 'A worn companion that goes everywhere, and is the first thing ever loved without being asked to.', 2],
    ['First time being carried on shoulders', 'Infancy', 'Bond', 'Suddenly tall, with the whole street spread out below. The world is a different size from up here.', 3],
    ['First time seeing a horse', 'Childhood', 'Nature', 'Enormous, warm and calm. Its breath fogs in the cold, and the sentient link makes it feel curious back.', 4],
    ['First time planting a seed', 'Childhood', 'Nature', 'A bean in a cup of soil on a windowsill. Every morning a check, until the first green curl appears.', 4],
    ['First time blowing out a candle', 'Childhood', 'Bond', 'A held breath and a silent wish. The smoke curls up like a small ghost.', 4],
    ['First puppet show', 'Childhood', 'Mind', 'Felt hands and a squeaky voice, and a whole audience agreeing to believe in them.', 5],
    ['First time skipping a stone', 'Childhood', 'Body', 'Three bounces on a still lake, and a grin that lasts the whole walk home.', 6],
    ['First time building a sandcastle', 'Childhood', 'Body', 'Walls, a moat and a flag made from a feather. The tide arrives and takes it back, politely.', 5],
    ['First time seeing a firefly', 'Childhood', 'Nature', 'A slow green blink in the dusk, then dozens. The garden turns into a map of tiny stars.', 6],
    ['First time sleeping in a tent', 'Childhood', 'Nature', 'Thin walls, loud crickets and a flashlight under a blanket. Safe, and a little wild.', 7],
    ['First time seeing a rainbow', 'Childhood', 'Nature', 'Color hung across the gray after rain, and the sense that the sky was showing off.', 5],
    ['First time making a snow angel', 'Childhood', 'Body', 'A flat fall into fresh powder, and a careful lift out to admire the shape left behind.', 6],
    ['First time baking cookies', 'Childhood', 'Body', 'Flour on the nose, a sticky bowl and the smell that fills a whole house.', 7],
    ['First time getting lost', 'Childhood', 'Mind', 'A crowd, a wrong turn and a stomach drop. Then a familiar voice, and relief like warm water.', 6],
    ['First pet', 'Childhood', 'Bond', 'A small, warm responsibility. Food, water, and a promise to always be there.', 7],
    ['First time reading aloud', 'Childhood', 'Mind', 'A paragraph, a quiet class and a voice that came out steadier than expected.', 7],
    ['First time seeing a meteor', 'Childhood', 'Nature', 'A scratch of white across the dark. Gone before it could be pointed to, remembered forever.', 8],
    ['First library visit', 'Childhood', 'Mind', 'Rows of paper spines and a quiet that felt like a held breath. One card, and a whole world to borrow.', 8],
    ['First time on a train', 'Childhood', 'World', 'Fields sliding past the window and the rhythm of the rails. Going somewhere, for the first time on purpose.', 8],
    ['First time seeing a thunderstorm from a porch', 'Childhood', 'Nature', 'Warm air, wet pavement and a sky that rolled over like something enormous turning in its sleep.', 9],
    ['First time cycling to a friend\'s house alone', 'Childhood', 'Body', 'Two streets, no hands holding the saddle. The distance felt like a small expedition.', 10],
    ['First time sailing', 'Childhood', 'Nature', 'A canvas sail, a tilt and the sudden quiet when the wind took over from the motor.', 10],
    ['First school play', 'Childhood', 'World', 'A paper crown, three lines and a spotlight. The nerves turned into pride at the final bow.', 9],
    ['First time making a friendship bracelet', 'Childhood', 'Bond', 'Knotted thread in three colors, and the nervous moment of handing it over.', 10],
    ['First time seeing the Milky Way', 'Childhood', 'Nature', 'Far from any city, a river of light across the whole sky. It felt like looking at something very old and very kind.', 11],
    ['First time watching a sunrise', 'Childhood', 'Nature', 'A cold hill, a thermos and a slow bloom of orange. The day arrived like a gift.', 11],
    ['First time telling a story to a crowd', 'Childhood', 'Mind', 'A round of faces, a story made up on the spot and a long pause before they all laughed.', 11],
    ['First time rescuing an animal', 'Childhood', 'Nature', 'A fallen fledgling, a shoebox and a careful week. The day it flew, the whole garden went quiet.', 11],
    ['First time winning something', 'Childhood', 'World', 'A ribbon, a handshake and the sharp, bright thrill of being first.', 11],
    ['First time losing something', 'Childhood', 'World', 'Handshakes, a small speech and the surprising discovery that it could still be a good day.', 12],
    ['First time forgiving a sibling', 'Childhood', 'Bond', 'A broken toy and an apology. The anger drained out all at once, like a plug pulled from a bath.', 11],
    ['First time sleeping outside under the sky', 'Youth', 'Nature', 'No tent, only a sleeping bag and the whole night above. The stars turned slowly, as if on a very large clock.', 13],
    ['First time having a secret', 'Youth', 'Mind', 'A thing kept behind the teeth. Strange and a little thrilling, and proof of a mind that was not for sale.', 13],
    ['First time swimming in a lake at night', 'Youth', 'Nature', 'Black water, warm air and the moon in pieces on the surface. Quiet, and entirely your own.', 14],
    ['First time watching the sunset with a friend', 'Youth', 'Bond', 'No words needed. The color changed, and so did the mood, and both minds knew it.', 14],
    ['First time sharing a playlist', 'Youth', 'Mind', 'Handing someone the songs that feel like you, and watching their face as they hear them.', 14],
    ['First time on a rollercoaster', 'Youth', 'Body', 'The slow click to the top, then a scream that was mostly joy.', 14],
    ['First time standing up for someone', 'Youth', 'World', 'Heart pounding, voice shaking and the words coming out anyway. The room changed shape.', 15],
    ['First time seeing a forest at dawn', 'Youth', 'Nature', 'Mist between the trunks, birdsong building and the sense of arriving somewhere older than people.', 15],
    ['First time on a stage in front of a crowd', 'Youth', 'Body', 'Bright light, a held breath and a room of minds leaning in.', 16],
    ['First time hearing a language you do not speak', 'Youth', 'Mind', 'Sounds like water over stones. Meaning arrived later through the AI link, and the sound stayed.', 15],
    ['First time making a friend in another country', 'Youth', 'Bond', 'A voice in the head from the far side of the world, and a laugh that arrived without translation.', 16],
    ['First time learning to drive', 'Youth', 'World', 'Hands at ten and two, an empty lot and the thrill of the engine answering.', 16],
    ['First time disagreeing with a teacher', 'Youth', 'Mind', 'A polite no, and a conversation that ended in respect. Opinions turned out to be allowed.', 16],
    ['First time sailing at night', 'Youth', 'Nature', 'A black sea, a green wake and a sky full of stars so near they felt like part of the rigging.', 17],
    ['First time camping in snow', 'Youth', 'Nature', 'Silence like cotton wool, breath turning to frost and a fire that felt like the only thing in the world.', 17],
    ['First time learning to cook a family recipe', 'Youth', 'Bond', 'A recipe never written down, only shown. Taste memory passed across with the spoon.', 17],
    ['First time reading a book that changed me', 'Youth', 'Mind', 'Two a.m., the last page and a quiet shift in what felt possible.', 17],
    ['First time seeing a whale shark', 'Youth', 'Nature', 'A slow, spotted shadow in the blue. Larger than a bus, and gentler than a breath.', 18],
    ['First time on a long train journey alone', 'Youth', 'World', 'A window, a sandwich and a country unspooling past. Solitude, and no one to answer to.', 18],
    ['First time cooking for friends', 'Youth', 'Bond', 'A crowded table, burnt rice and nobody minding. The room felt warmer than the stove.', 18],
    ['First time swimming with dolphins', 'Youth', 'Nature', 'Clicks and whistles translated into feeling. They were laughing, and so was I.', 18],
    ['First time giving a speech', 'Youth', 'World', 'Notes forgotten, then not needed. Applause arrived like a wave and left the same way.', 18],
    ['First time getting a letter of thanks', 'Youth', 'Bond', 'A short note from someone helped, written by hand. Pinned above the desk for years.', 19],
    ['First time paddling a canoe at dawn', 'Youth', 'Nature', 'A mirror lake, a single heron and the quiet drip of the paddle.', 19],
    ['First time hearing live orchestral music', 'Youth', 'Mind', 'A string section breathing together, and a note held so long it became part of the room.', 19],
    ['First time being homesick', 'Youth', 'Bond', 'A gray evening, a far-off voice and an ache for a small, ordinary kitchen.', 19],
    ['First time failing an exam', 'Youth', 'Mind', 'A red mark and a hollow stomach. Then a long walk, and a plan.', 19],
    ['First time sharing grief with a friend', 'Youth', 'Bond', 'No words, only two minds in the same quiet place. The weight divided in half.', 19],
    ['First time bungee jumping', 'Youth', 'Body', 'A count of three, a step into nothing and a scream that turned into a laugh.', 20],
    ['First time being alone in a forest', 'Youth', 'Nature', 'No signal, no voices, only wind in the high leaves. The quiet had a texture all its own.', 20],
    ['First time feeling like an adult', 'Youth', 'World', 'A bill paid, a door locked and a flicker of pride at the ordinariness of it.', 21],
    ['First time meeting a sentient octopus', 'Youth', 'Nature', 'A curious arm reaching for a finger, and a flicker of color that meant hello.', 21],
    ['First time recording a song', 'Young adult', 'Mind', 'A rough take, a cracked note and a playback that sounded, to the maker, like something real.', 22],
    ['First time rescuing a plant', 'Young adult', 'Nature', 'A brown, drooping stem and some patience. A single new leaf, and a quiet sense of vindication.', 23],
    ['First time sharing a flat', 'Young adult', 'Bond', 'Mismatched mugs, a rota on the fridge and a gradual understanding of another person\'s rhythms.', 23],
    ['First all-night conversation', 'Young adult', 'Bond', 'The city went quiet and the topics got bigger. Dawn arrived, and nobody wanted to stop.', 23],
    ['First time seeing a coral reef', 'Young adult', 'Nature', 'A living city of color, and a thousand tiny minds going about their business around me.', 23],
    ['First time getting lost in a foreign city', 'Young adult', 'World', 'A wrong train, a map in the head and a kind stranger. It turned out to be the best day of the trip.', 24],
    ['First marathon', 'Young adult', 'Body', 'A long road, a longer final mile and a finish line like a held breath released.', 24],
    ['First solo hike', 'Young adult', 'Nature', 'A trail, a pack and nobody to talk to. Mind and footsteps settled into the same slow beat.', 24],
    ['First time learning to play an instrument properly', 'Young adult', 'Mind', 'Months of scales, then one night a tune came out whole. The instrument felt like part of the hand.', 24],
    ['First time getting a mentor', 'Young adult', 'Mind', 'Someone further down the road, willing to point at the signs. Their questions did most of the work.', 24],
    ['First time ending a friendship kindly', 'Young adult', 'Bond', 'A clear conversation, no villain and no blame. Two people, quietly going different ways.', 25],
    ['First time building something useful', 'Young adult', 'Body', 'A bookshelf, a few crooked joints and a space on the wall it fit exactly.', 25],
    ['First time taking a month off', 'Young adult', 'World', 'No messages, no plans. By the second week, the quiet felt like something deliberate.', 26],
    ['First time donating anonymously', 'Young adult', 'World', 'A number, a button and the lightness of giving without anyone knowing.', 26],
    ['First time facing a fear on purpose', 'Young adult', 'Mind', 'A high platform, an open drop and a decision made before the doubt could vote.', 26],
    ['First time sitting in silence with a stranger', 'Young adult', 'Bond', 'A park bench, a long pause and a surprising comfort in not needing to say anything.', 26],
    ['First time mending something broken', 'Young adult', 'Body', 'A cracked bowl, a pot of glue and gold dust. The repair became the best part.', 27],
    ['First time forgiving myself', 'Young adult', 'Mind', 'An old mistake finally set down. The weight went out of the chest like a long exhale.', 27],
    ['First time giving a eulogy', 'Young adult', 'World', 'Two pages, a steady voice and a room that listened as one. The stories got the biggest laughs.', 27],
    ['First night under the aurora', 'Young adult', 'Nature', 'Green curtains over a frozen lake. The sky moved like breath, and nobody spoke.', 28],
    ['First time reading to an elder', 'Young adult', 'Bond', 'A quiet room, an old book and a listener who closed her eyes and smiled at the right places.', 28],
    ['First time swimming in the open ocean alone', 'Young adult', 'Nature', 'The shore a thin line, the water deep and the quiet enormous. Small, and entirely at ease.', 28],
    ['First time turning down a promotion', 'Young adult', 'World', 'A polite no and a quiet certainty. The choice felt like ownership.', 28],
    ['First time writing a song for someone', 'Young adult', 'Bond', 'A few chords, a handful of honest lines and a nervous moment before pressing play.', 29],
    ['First time sleeping in an old growth forest', 'Young adult', 'Nature', 'Trees older than any nation, whispering overhead. The same sound as the first one remembered.', 29],
    ['First time saying no without guilt', 'Young adult', 'Mind', 'Two letters, a calm breath and a surprise that nothing fell apart.', 29],
    ['First time meeting a Hetero-sapien child', 'Young adult', 'World', 'Taller than expected, curious and shy. They offered a pebble, and the future felt friendly.', 29],
    ['First time rebuilding after a loss', 'Young adult', 'World', 'A cleared room, a fresh coat of paint and a small, stubborn hope.', 30],
    ['First time dancing alone in an empty room', 'Young adult', 'Body', 'No one watching, a favorite track and a body that remembered every move.', 30],
    ['First time cooking my grandmother\'s recipe', 'Young adult', 'Bond', 'The smell filled the flat and the years folded away. Her hands, for a moment, were mine.', 31],
    ['First time watching the sunrise from a summit', 'Young adult', 'Nature', 'A gray climb, a sudden gold rim and a view that made the aching legs worthwhile.', 31],
    ['First time sitting with the wind in the trees again', 'Young adult', 'Nature', 'The same whisper from long ago. It sounded exactly as it had when the mind was only three.', 32],
    ['First time looking forward without fear', 'Young adult', 'Mind', 'The coming years no longer a question. A calm, practical kind of excitement.', 32]
  ];
  // Age ranges per stage (the subject is 33); entries are spread evenly within their stage
  var AGES = { 'Infancy': [0, 3], 'Childhood': [4, 12], 'Youth': [13, 21], 'Young adult': [22, 33] };
  var LABELS = { 'Infancy': 'Earliest memories', 'Childhood': 'Distant memories', 'Youth': 'Older memories', 'Young adult': 'Recent memories' };
  var counts = {}, seen = {};
  RAW.forEach(function (r) { if (r[1] === 'Adulthood') r[1] = 'Young adult'; counts[r[1]] = (counts[r[1]] || 0) + 1; });
  var MEMORIES = RAW.map(function (r, i) {
    var st = r[1], k = seen[st] = (seen[st] || 0) + 1, rg = AGES[st];
    var age = r[4] != null ? r[4] : Math.round(rg[0] + (counts[st] > 1 ? (k - 1) / (counts[st] - 1) : 0) * (rg[1] - rg[0]));
    return { n: r[0], stage: LABELS[st], age: age, type: r[2], c: TYPES[r[2]], d: r[3], o: i };
  });
  // extra memories carry an explicit age and are merged in by age
  RAW2.forEach(function (r, i) {
    var a = r[4], st = a <= 3 ? 'Infancy' : a <= 12 ? 'Childhood' : a <= 21 ? 'Youth' : 'Young adult';
    MEMORIES.push({ n: r[0], stage: LABELS[st], age: a, type: r[2], c: TYPES[r[2]], d: r[3], o: RAW.length + i });
  });
  var lastIdx = MEMORIES.length - 1;
  MEMORIES.sort(function (a, b) { return a.age - b.age || a.o - b.o; });
  MEMORIES.forEach(function (m, i) { m.idx = i; m.arm = i % 8; m.u = .04 + .92 * i / lastIdx; });

  var seed = 11;
  function rnd() { return (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function g() { return (rnd() + rnd() + rnd() - 1.5) / 1.5; }

  var ARMS = 8, TWIST = 2.4;
  // centre line of an arm: leaves the core, then winds outward
  function armPos(arm, u) {
    var a = arm * 6.2832 / ARMS + u * TWIST, r = .09 + u * 1.0;
    return [Math.cos(a) * r, 0, Math.sin(a) * r];
  }

  var nodes = [], i, j, p;
  function add(x, y, z, arm, kind, r) { nodes.push({ x: x, y: y, z: z, arm: arm, k: kind, r: r }); }
  for (i = 0; i < 500; i++) { // core bulge
    var br = Math.abs(g()) * .14, ba = rnd() * 6.283;
    add(Math.cos(ba) * br, g() * .06, Math.sin(ba) * br, -1, 0, 1.4 + rnd() * 1.4);
  }
  for (var arm = 0; arm < ARMS; arm++) {
    for (i = 0; i < 650; i++) { // spiral arms, more scattered toward the rim
      var u = Math.pow(rnd(), .85); p = armPos(arm, u);
      var sp = .03 + u * .07, an = rnd() * 6.283, d = Math.abs(g()) * sp;
      add(p[0] + Math.cos(an) * d, g() * (.02 + u * .02), p[2] + Math.sin(an) * d, arm, 2, .9 + rnd() * 1.4);
    }
  }
  for (i = 0; i < 300; i++) { // outer halo
    var ha = rnd() * 6.283, hr = .35 + rnd() * .75;
    add(Math.cos(ha) * hr, g() * .35, Math.sin(ha) * hr, -1, 3, .6 + rnd() * .8);
  }

  // each node links to its three nearest neighbours
  var edges = [], N = nodes.length, K = 3, best, bd, a, b, dx, dy, dz, dd;
  for (i = 0; i < N; i++) {
    best = []; bd = [];
    a = nodes[i];
    for (j = 0; j < N; j++) if (j !== i) {
      b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; dz = a.z - b.z; dd = dx * dx + dy * dy + dz * dz;
      if (best.length < K || dd < bd[K - 1]) {
        var pos = best.length < K ? best.length : K - 1;
        while (pos > 0 && bd[pos - 1] > dd) { bd[pos] = bd[pos - 1]; best[pos] = best[pos - 1]; pos--; }
        bd[pos] = dd; best[pos] = j;
      }
    }
    for (var q = 0; q < best.length; q++) if (i < best[q]) edges.push([i, best[q]]);
  }
  var packets = [];
  for (i = 0; i < 110; i++) packets.push({ e: (rnd() * edges.length) | 0, t: rnd(), v: .004 + rnd() * .01 });

  MEMORIES.forEach(function (mm) { mm.p = armPos(mm.arm, mm.u); });

  var W, Hh, dpr, yaw = .4, pitch = .95, zoom = 1, drag = null, sel = -1, glow = 0;
  var fx = 0, fz = 0, fxT = 0, fzT = 0, t0 = performance.now(), matches = null;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; Hh = window.innerHeight;
    cv.width = W * dpr; cv.height = Hh * dpr;
  }
  window.addEventListener('resize', resize); resize();

  function proj(x, y, z) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    x -= fx; z -= fz;
    var x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    var y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
    var panel = W > 760 ? Math.min(360, Math.max(300, W * .34)) : 0;
    var cx = (W - panel) / 2, cyy = W > 760 ? Hh / 2 : Hh * .27;
    var scale = Math.min(W - panel, Hh * (W > 760 ? 1 : .5)) * .42 * zoom;
    var f = 2.8 / (2.8 + z2);
    return [cx + x1 * scale * f, cyy - y1 * scale * f, z2, f];
  }

  var HR = .085, mp = null;
  function near(o) {
    if (!mp) return false;
    var dx = o.x - mp[0], dy = o.y, dz = o.z - mp[2];
    return dx * dx + dy * dy + dz * dz < HR * HR;
  }

  function frame(now) {
    var dt = now - t0; t0 = now;
    if (!drag) yaw += dt * .00007;
    fx += (fxT - fx) * .06; fz += (fzT - fz) * .06;
    glow += ((sel >= 0 ? 1 : 0) - glow) * .08;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, Hh);
    var m0 = sel >= 0 ? MEMORIES[sel] : null, hc = m0 ? m0.c : [226,114,26];
    var pulse = .75 + .25 * Math.sin(now * .005);
    var P = new Array(N), hot = new Array(N), o, e, A, B, k;

    for (j = 0; j < N; j++) { o = nodes[j]; P[j] = proj(o.x, o.y, o.z); hot[j] = near(o); }

    ctx.lineWidth = 1;
    for (j = 0; j < edges.length; j++) {
      e = edges[j]; A = P[e[0]]; B = P[e[1]];
      if (hot[e[0]] && hot[e[1]]) ctx.strokeStyle = 'rgba(' + hc[0] + ',' + hc[1] + ',' + hc[2] + ',' + (.6 * pulse) + ')';
      else ctx.strokeStyle = 'rgba(11,31,77,' + (m0 ? .045 : .09) * Math.min(1, A[3] * 1.1) + ')';
      ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
    }

    var order = [];
    for (j = 0; j < N; j++) order.push(j);
    order.sort(function (x, y) { return P[y][2] - P[x][2]; });
    for (k = 0; k < order.length; k++) {
      j = order[k]; o = nodes[j]; var q2 = P[j];
      var dep = Math.max(.25, Math.min(1, q2[3] * q2[3] * .95));
      var on = hot[j], rad = o.r * q2[3] * (on ? 1.8 : 1) * Math.sqrt(zoom);
      if (on) ctx.fillStyle = 'rgba(' + hc[0] + ',' + hc[1] + ',' + hc[2] + ',' + (.92 * dep) + ')';
      else {
        var al = (o.k === 3 ? .3 : .72) * dep * (m0 ? .55 : 1);
        ctx.fillStyle = o.k === 0 ? 'rgba(226,114,26,' + al + ')' : (o.arm === 1 ? 'rgba(28,58,122,' + al + ')' : 'rgba(11,31,77,' + al + ')');
      }
      ctx.beginPath(); ctx.arc(q2[0], q2[1], rad, 0, 6.283); ctx.fill();
    }

    for (j = 0; j < packets.length; j++) {
      var pk = packets[j]; pk.t += pk.v; if (pk.t > 1) { pk.t = 0; pk.e = (rnd() * edges.length) | 0; }
      e = edges[pk.e]; A = P[e[0]]; B = P[e[1]];
      ctx.fillStyle = 'rgba(32,200,175,' + (.8 * Math.min(1, A[3])) + ')';
      ctx.beginPath(); ctx.arc(A[0] + (B[0] - A[0]) * pk.t, A[1] + (B[1] - A[1]) * pk.t, 1.6 * A[3], 0, 6.283); ctx.fill();
    }

    // a marker at every memory; search matches are drawn brighter
    for (j = 0; j < MEMORIES.length; j++) {
      var mm = MEMORIES[j], S2 = proj(mm.p[0], 0, mm.p[2]), hit = matches && matches[j];
      if (matches && !hit) continue;
      var c = mm.c, mr = (hit ? 4.5 + 1.5 * Math.sin(now * .006 + j) : 2.6) * S2[3] * Math.sqrt(zoom);
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (hit ? .95 : .55) + ')';
      ctx.lineWidth = hit ? 1.4 : 1;
      ctx.beginPath(); ctx.arc(S2[0], S2[1], mr, 0, 6.283); ctx.stroke();
    }

    if (m0) {
      var S = proj(mp[0], 0, mp[2]);
      var rr = (26 + 6 * Math.sin(now * .005)) * S[3] * zoom;
      var gr = ctx.createRadialGradient(S[0], S[1], 0, S[0], S[1], rr * 2.6);
      gr.addColorStop(0, 'rgba(' + hc[0] + ',' + hc[1] + ',' + hc[2] + ',' + (.3 * glow) + ')');
      gr.addColorStop(1, 'rgba(' + hc[0] + ',' + hc[1] + ',' + hc[2] + ',0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(S[0], S[1], rr * 2.6, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(' + hc[0] + ',' + hc[1] + ',' + hc[2] + ',.9)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(S[0], S[1], rr * .8, 0, 6.283); ctx.stroke();
      var lx = Math.max(24, S[0] - 230), ly = Math.max(130, S[1] - 70);
      ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(lx + 190, ly); ctx.lineTo(lx, ly); ctx.stroke();
      ctx.fillStyle = 'rgb(' + hc[0] + ',' + hc[1] + ',' + hc[2] + ')';
      ctx.font = '500 11px Barlow, sans-serif'; ctx.textBaseline = 'bottom';
      ctx.fillText(m0.n.toUpperCase(), lx, ly - 4);
    }
    requestAnimationFrame(frame);
  }

  var items = [];
  function pick(idx) {
    sel = idx;
    var mem = MEMORIES[idx];
    mp = mem.p;
    fxT = mp[0] * .45; fzT = mp[2] * .45;
    items.forEach(function (it, j) { it.classList.toggle('on', j === idx); });
    detEl.innerHTML = '<h3></h3><p></p><div class="meta"></div>';
    detEl.querySelector('h3').textContent = mem.n;
    detEl.querySelector('p').textContent = mem.d;
    detEl.querySelector('.meta').textContent = 'Age ' + mem.age + ' · ' + mem.stage + ' · ' + mem.type + ' · memory ' + (idx + 1) + ' of ' + MEMORIES.length;
    readout.textContent = 'Selected memory: ' + mem.n;
    if (items[idx] && !items[idx].hidden) items[idx].scrollIntoView({ block: 'nearest' });
  }

  MEMORIES.forEach(function (mem, idx) {
    var bt = document.createElement('button');
    bt.className = 'mem'; bt.type = 'button';
    bt.innerHTML = '<i>' + (idx < 9 ? '0' : '') + (idx + 1) + '</i><span><b></b><small></small></span>';
    bt.querySelector('b').textContent = mem.n;
    bt.querySelector('small').textContent = 'Age ' + mem.age + ' · ' + mem.type;
    bt.addEventListener('click', function () { pick(idx); });
    listEl.appendChild(bt); items.push(bt);
  });
  var noneEl = document.createElement('div');
  noneEl.className = 'none'; noneEl.textContent = 'No memories match'; noneEl.hidden = true; listEl.appendChild(noneEl);
  detEl.innerHTML = '<h3>Select a memory</h3><p>A personal archive arranged from the earliest memories at the core to recent experiences at the rim. Each record holds a moment lived, recalled, or shared by choice.</p>';

  function score(mm, q) {
    var n = mm.n.toLowerCase();
    if (n.indexOf(q) === 0) return 3;
    if (n.indexOf(' ' + q) >= 0) return 2.5;
    if (n.indexOf(q) >= 0) return 2;
    if ((mm.stage + ' ' + mm.type).toLowerCase().indexOf(q) >= 0) return 1.5;
    if (mm.d.toLowerCase().indexOf(q) >= 0) return 1;
    return 0;
  }
  function terms(q) { return q.toLowerCase().split(/\s+/).filter(Boolean); }
  function scoreAll(mm, ts) {
    var tot = 0;
    for (var t = 0; t < ts.length; t++) { var s = score(mm, ts[t]); if (!s) return 0; tot += s; }
    return tot;
  }

  var actIdx = -1, sugList = [];
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
  function hl(name, q) {
    var k = name.toLowerCase().indexOf(q);
    if (k < 0 || !q) return esc(name);
    return esc(name.slice(0, k)) + '<mark>' + esc(name.slice(k, k + q.length)) + '</mark>' + esc(name.slice(k + q.length));
  }
  function closeSug() { sugEl.hidden = true; qEl.setAttribute('aria-expanded', 'false'); actIdx = -1; }
  function setAct(n) {
    actIdx = n;
    Array.prototype.forEach.call(sugEl.children, function (li, j) { li.classList.toggle('act', j === n); });
  }
  function applyFilter() {
    var raw = qEl.value.trim(), ts = terms(raw), cnt = 0;
    clrEl.hidden = !raw;
    if (!ts.length) {
      matches = null;
      items.forEach(function (it) { it.hidden = false; });
      countEl.textContent = 'Archive / ' + MEMORIES.length + ' records';
      noneEl.hidden = true; closeSug(); return;
    }
    matches = {};
    MEMORIES.forEach(function (mm, j) {
      var ok = scoreAll(mm, ts) > 0;
      items[j].hidden = !ok; if (ok) { matches[j] = true; cnt++; }
    });
    noneEl.hidden = cnt > 0;
    countEl.textContent = 'Archive / ' + cnt + ' of ' + MEMORIES.length + ' records';
    // suggestions: best-scoring names first
    sugList = MEMORIES.map(function (mm) { return { mm: mm, s: scoreAll(mm, ts) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.mm.idx - b.mm.idx; }).slice(0, 7);
    sugEl.innerHTML = '';
    sugList.forEach(function (x, n) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.innerHTML = hl(x.mm.n, ts[0]) + '<small>' + esc(x.mm.stage) + '</small>';
      li.addEventListener('mousedown', function (ev) { ev.preventDefault(); chooseSug(n); });
      sugEl.appendChild(li);
    });
    sugEl.hidden = !sugList.length; qEl.setAttribute('aria-expanded', String(!!sugList.length)); actIdx = -1;
  }
  function chooseSug(n) {
    var mm = sugList[n].mm;
    qEl.value = mm.n; applyFilter(); closeSug(); pick(mm.idx);
  }
  qEl.addEventListener('input', applyFilter);
  qEl.addEventListener('focus', function () { if (qEl.value.trim()) applyFilter(); });
  qEl.addEventListener('blur', function () { setTimeout(closeSug, 100); });
  qEl.addEventListener('keydown', function (e) {
    var open = !sugEl.hidden;
    if (e.key === 'ArrowDown' && open) { e.preventDefault(); setAct((actIdx + 1) % sugList.length); }
    else if (e.key === 'ArrowUp' && open) { e.preventDefault(); setAct((actIdx - 1 + sugList.length) % sugList.length); }
    else if (e.key === 'Enter') {
      if (open && sugList.length) { e.preventDefault(); chooseSug(actIdx >= 0 ? actIdx : 0); }
    } else if (e.key === 'Escape') { if (open) closeSug(); else { qEl.value = ''; applyFilter(); } }
  });
  clrEl.addEventListener('click', function () { qEl.value = ''; applyFilter(); qEl.focus(); });
  applyFilter();

  cv.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return;
    yaw += (e.clientX - drag.x) * .008; pitch = Math.max(.1, Math.min(1.5, pitch + (e.clientY - drag.y) * .006));
    drag.x = e.clientX; drag.y = e.clientY;
  });
  function up() { drag = null; }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', function (e) { e.preventDefault(); zoom = Math.max(.5, Math.min(3, zoom * (e.deltaY < 0 ? 1.08 : .926))); }, { passive: false });

  requestAnimationFrame(frame);
})();
