/**
 * Name parts for random miner name generation.
 * Combined as: [prefix] + [noun] + optional [suffix]
 * Keep entries short so combined names stay under 30 chars.
 */

export const prefixes = [
	// Cosmic / sci-fi
	'Astro', 'Cosmic', 'Quantum', 'Nebula', 'Void', 'Stellar', 'Solar', 'Lunar',
	'Orbital', 'Plasma', 'Photon', 'Neutron', 'Quasar', 'Pulsar', 'Dark',
	'Hyper', 'Ultra', 'Mega', 'Nano', 'Micro', 'Turbo', 'Nitro', 'Atomic',
	'Nuclear', 'Galactic', 'Interstellar',

	// Unhinged vibes
	'Chaotic', 'Feral', 'Unhinged', 'Cursed', 'Haunted', 'Frenzy', 'Manic',
	'Rabid', 'Frothing', 'Feverish', 'Delirious', 'Crazed', 'Frantic',
	'Berserk', 'Deranged', 'Wonky', 'Janky', 'Glitchy', 'Buggy', 'Laggy',
	'Scuffed', 'Cooked', 'Bricked', 'Goated', 'Based', 'Cracked',
	'Zooted', 'Yoinked', 'Skunked', 'Blasted',

	// Animals as adjectives
	'Goblin', 'Gremlin', 'Raccoon', 'Possum', 'Cryptid', 'Mothman',
	'Bigfoot', 'Yeti', 'Kraken', 'Dragon', 'Wyvern', 'Basilisk',
	'Chimera', 'Manticore', 'Minotaur', 'Hydra',

	// Textures / aesthetics
	'Crusty', 'Mushy', 'Gooey', 'Slimy', 'Crispy', 'Crunchy', 'Soggy',
	'Fuzzy', 'Spiky', 'Lumpy', 'Chunky', 'Squishy', 'Gritty', 'Rusty',
	'Dusty', 'Moldy', 'Funky', 'Dank', 'Grimy', 'Murky',
	'Sparkly', 'Glowy', 'Neon', 'Holographic', 'Prismatic', 'Iridescent',
	'Chrome', 'Titanium', 'Obsidian', 'Crystal', 'Copper', 'Golden',

	// Emotional
	'Anxious', 'Sleepy', 'Grumpy', 'Hangry', 'Salty', 'Spicy', 'Sweet',
	'Bitter', 'Sour', 'Zesty', 'Tangy', 'Savory', 'Umami', 'Pungent',
	'Moody', 'Brooding', 'Dramatic', 'Petty', 'Sassy', 'Savage',
	'Fierce', 'Bold', 'Brazen', 'Smug', 'Devious', 'Sneaky', 'Sly',
	'Scheming', 'Plotting', 'Menacing', 'Ominous', 'Suspicious',

	// Size / intensity
	'Absolute', 'Supreme', 'Maximum', 'Extreme', 'Intense', 'Colossal',
	'Enormous', 'Massive', 'Tiny', 'Wee', 'Itty', 'Smol', 'Thicc',
	'Chonky', 'Girthy', 'Beefy', 'Swole', 'Buff', 'Ripped', 'Stacked',
	'Legendary', 'Mythical', 'Epic', 'Rare', 'Common',

	// Weird / specific
	'Sentient', 'Sapient', 'Ambient', 'Verbose', 'Recursive', 'Abstract',
	'Volatile', 'Static', 'Dynamic', 'Async', 'Null', 'Undefined',
	'Boolean', 'Binary', 'Hexed', 'Pixelated', 'Voxel', 'Fractal',
	'Infinite', 'Liminal', 'Temporal', 'Spectral', 'Ethereal', 'Eldritch',
	'Forbidden', 'Forgotten', 'Ancient', 'Primordial', 'Arcane',

	// Food adjacent
	'Crispy', 'Toasty', 'Burnt', 'Raw', 'Pickled', 'Fermented', 'Smoked',
	'Marinated', 'Glazed', 'Frosted', 'Caramel', 'Buttery', 'Cheesy',
	'Spiced', 'Peppered', 'Salted', 'Honeyed',

	// Weather / nature
	'Stormy', 'Thunder', 'Lightning', 'Frost', 'Ember', 'Inferno', 'Blizzard',
	'Tornado', 'Tsunami', 'Volcanic', 'Tectonic', 'Seismic', 'Molten',
	'Frozen', 'Blazing', 'Scorched', 'Flooded', 'Withered', 'Overgrown',

	// Chaotic energy
	'Unhinged', 'Unleashed', 'Untamed', 'Uncanny', 'Ungovernable', 'Unstoppable',
	'Relentless', 'Reckless', 'Ruthless', 'Shameless', 'Fearless', 'Lawless',
	'Boneless', 'Wireless', 'Homeless', 'Topless', 'Bottomless', 'Faceless',

	// Colors with flavor
	'Crimson', 'Scarlet', 'Cobalt', 'Cerulean', 'Emerald', 'Jade',
	'Amber', 'Violet', 'Indigo', 'Magenta', 'Chartreuse', 'Vermilion',
	'Midnight', 'Shadow', 'Phantom', 'Ghost', 'Wraith', 'Specter'
];

export const nouns = [
	// Mining themed
	'Miner', 'Digger', 'Driller', 'Excavator', 'Prospector', 'Forager',
	'Harvester', 'Smelter', 'Refiner', 'Crusher', 'Grinder', 'Sifter',
	'Tunneler', 'Borer', 'Blaster', 'Quarry', 'Lode', 'Vein',
	'Nugget', 'Chunk', 'Shard', 'Fragment', 'Sliver', 'Deposit',

	// Animals
	'Badger', 'Wombat', 'Capybara', 'Axolotl', 'Platypus', 'Pangolin',
	'Tardigrade', 'Mantis', 'Lobster', 'Crab', 'Shrimp', 'Barnacle',
	'Pelican', 'Seagull', 'Pigeon', 'Goose', 'Duck', 'Owl',
	'Raccoon', 'Possum', 'Opossum', 'Skunk', 'Porcupine', 'Hedgehog',
	'Armadillo', 'Sloth', 'Lemur', 'Gecko', 'Chameleon', 'Iguana',
	'Frog', 'Toad', 'Newt', 'Salamander', 'Eel', 'Squid',
	'Octopus', 'Jellyfish', 'Starfish', 'Seahorse', 'Narwhal', 'Walrus',
	'Moose', 'Bison', 'Yak', 'Llama', 'Alpaca', 'Tapir',
	'Hippo', 'Rhino', 'Manatee', 'Dugong', 'Blob', 'Worm',
	'Moth', 'Beetle', 'Ant', 'Wasp', 'Hornet', 'Cricket',
	'Caterpillar', 'Centipede', 'Snail', 'Slug', 'Clam', 'Mussel',
	'Crow', 'Raven', 'Vulture', 'Condor', 'Falcon', 'Osprey',

	// Fantasy creatures
	'Goblin', 'Gremlin', 'Troll', 'Ogre', 'Imp', 'Sprite',
	'Pixie', 'Fairy', 'Gnome', 'Dwarf', 'Elf', 'Orc',
	'Kobold', 'Golem', 'Wraith', 'Phantom', 'Specter', 'Lich',
	'Mimic', 'Doppelganger', 'Changeling', 'Shapeshifter',
	'Cryptid', 'Wendigo', 'Banshee', 'Revenant',

	// Tech / computing
	'Bot', 'Droid', 'Cyborg', 'Android', 'Automaton', 'Mech',
	'Glitch', 'Bug', 'Virus', 'Trojan', 'Worm', 'Daemon',
	'Kernel', 'Pixel', 'Voxel', 'Cursor', 'Buffer', 'Cache',
	'Stack', 'Queue', 'Node', 'Socket', 'Thread', 'Process',
	'Byte', 'Bit', 'Hash', 'Token', 'Packet', 'Signal',

	// Objects / things
	'Toaster', 'Blender', 'Microwave', 'Spatula', 'Ladle', 'Whisk',
	'Sponge', 'Bucket', 'Wrench', 'Hammer', 'Anvil', 'Forge',
	'Crowbar', 'Plunger', 'Broom', 'Mop', 'Vacuum', 'Shovel',
	'Pickaxe', 'Lantern', 'Compass', 'Beacon', 'Furnace', 'Cauldron',
	'Mortar', 'Pestle', 'Crucible', 'Bellows', 'Tongs', 'Chisel',

	// Food
	'Potato', 'Turnip', 'Beet', 'Radish', 'Parsnip', 'Rutabaga',
	'Cabbage', 'Onion', 'Garlic', 'Pickle', 'Pretzel', 'Bagel',
	'Waffle', 'Pancake', 'Biscuit', 'Dumpling', 'Noodle', 'Meatball',
	'Burrito', 'Taco', 'Nacho', 'Crouton', 'Breadstick', 'Muffin',
	'Scone', 'Croissant', 'Donut', 'Churro', 'Eclair', 'Truffle',
	'Nugget', 'Sausage', 'Kebab', 'Pierogi', 'Gyoza', 'Samosa',

	// Chaos agents
	'Goon', 'Fiend', 'Menace', 'Rascal', 'Scoundrel', 'Hooligan',
	'Miscreant', 'Deviant', 'Villain', 'Bandit', 'Rogue', 'Outlaw',
	'Marauder', 'Raider', 'Vandal', 'Punk', 'Rebel', 'Heretic',
	'Vigilante', 'Mercenary', 'Warden', 'Sentinel', 'Guardian',

	// Geology / nature
	'Boulder', 'Pebble', 'Gravel', 'Cobalt', 'Quartz', 'Granite',
	'Basalt', 'Obsidian', 'Flint', 'Slate', 'Marble', 'Limestone',
	'Stalactite', 'Stalagmite', 'Crystal', 'Geode', 'Fossil',
	'Magma', 'Lava', 'Cinder', 'Ember', 'Spark', 'Flame',
	'Glacier', 'Iceberg', 'Tundra', 'Geyser', 'Volcano', 'Crater',

	// Abstract / weird
	'Entity', 'Anomaly', 'Paradox', 'Enigma', 'Phenomenon', 'Artifact',
	'Catalyst', 'Construct', 'Algorithm', 'Equation', 'Variable', 'Constant',
	'Theorem', 'Axiom', 'Vector', 'Matrix', 'Tensor', 'Quantum',
	'Singularity', 'Continuum', 'Nexus', 'Vertex', 'Prism', 'Lens',

	// Professions / roles
	'Wizard', 'Warlock', 'Sorcerer', 'Alchemist', 'Artificer', 'Tinkerer',
	'Scribe', 'Scholar', 'Hermit', 'Nomad', 'Wanderer', 'Pilgrim',
	'Jester', 'Bard', 'Herald', 'Squire', 'Knight', 'Paladin',
	'Ranger', 'Druid', 'Shaman', 'Oracle', 'Prophet', 'Mystic'
];

export const suffixes = [
	// Numbers / ranks
	'_99', '_420', '_69', '_404', '_001', '_XIII', '_IX', '_3000',
	'_XL', '_2B', '_Jr', '_Sr', '_III', '_V', '_X',

	// Titles
	'Prime', 'Supreme', 'Ultra', 'Omega', 'Alpha', 'Beta',
	'Delta', 'Sigma', 'Gamma', 'Epsilon', 'Zeta', 'Theta',

	// Descriptors
	'Max', 'Pro', 'Plus', 'Lite', 'Mini', 'XL',
	'HD', 'EX', 'DX', 'GT', 'RS', 'SS',

	// Fun
	'IRL', 'NPC', 'MVP', 'OP', 'GG', 'AFK',
	'LOL', 'BBQ', 'CEO', 'PhD',

	// Empty (no suffix) — weighted by repetition
	'', '', '', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '', '', ''
];
