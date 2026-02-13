<script lang="ts">
	import { onMount } from 'svelte';

	// ── Cellular automata simulation for the hero ──
	const COLS = 80;
	const ROWS = 40;
	const CELL_SIZE = 8;

	let canvas: HTMLCanvasElement;
	let grid: Uint8Array;
	let nextGrid: Uint8Array;
	let animFrame: number;

	function initGrid() {
		grid = new Uint8Array(COLS * ROWS);
		nextGrid = new Uint8Array(COLS * ROWS);
		for (let i = 0; i < grid.length; i++) {
			grid[i] = Math.random() < 0.35 ? 1 : 0;
		}
	}

	function step() {
		for (let y = 0; y < ROWS; y++) {
			for (let x = 0; x < COLS; x++) {
				let neighbors = 0;
				for (let dy = -1; dy <= 1; dy++) {
					for (let dx = -1; dx <= 1; dx++) {
						if (dx === 0 && dy === 0) continue;
						const nx = (x + dx + COLS) % COLS;
						const ny = (y + dy + ROWS) % ROWS;
						neighbors += grid[ny * COLS + nx];
					}
				}
				const idx = y * COLS + x;
				const alive = grid[idx];
				nextGrid[idx] = alive
					? (neighbors === 2 || neighbors === 3 ? 1 : 0)
					: (neighbors === 3 ? 1 : 0);
			}
		}
		[grid, nextGrid] = [nextGrid, grid];
	}

	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		for (let y = 0; y < ROWS; y++) {
			for (let x = 0; x < COLS; x++) {
				if (grid[y * COLS + x]) {
					ctx.fillStyle = `rgba(250, 204, 21, ${0.15 + Math.random() * 0.15})`;
					ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
				}
			}
		}
	}

	let lastStep = 0;
	function loop(t: number) {
		if (t - lastStep > 200) {
			step();
			draw();
			lastStep = t;
		}
		animFrame = requestAnimationFrame(loop);
	}

	// ── Lattice renderers (canvas-based) ──
	type Lattice = {
		key: string;
		label: string;
		neighbors: string;
		canvas: HTMLCanvasElement;
	};

	let latticeCanvases: Lattice[] = $state([
		{ key: 'square', label: 'Square', neighbors: '8 neighbors', canvas: null! },
		{ key: 'hex', label: 'Hexagonal', neighbors: '6 neighbors', canvas: null! },
		{ key: 'tri', label: 'Triangular', neighbors: '6 neighbors', canvas: null! },
		{ key: 'trunc', label: 'Octagon', neighbors: '8 + 4 neighbors', canvas: null! },
	]);

	const LW = 180;
	const LH = 180;

	// Seeded random for consistent "alive" cells
	function seededRandom(seed: number) {
		let s = seed;
		return () => {
			s = (s * 16807 + 0) % 2147483647;
			return s / 2147483647;
		};
	}

	function drawSquareLattice(ctx: CanvasRenderingContext2D) {
		const size = 22;
		const gap = 2;
		const step = size + gap;
		const rand = seededRandom(42);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, LW, LH);
		const cols = Math.ceil(LW / step) + 1;
		const rows = Math.ceil(LH / step) + 1;
		const ox = (LW - cols * step + gap) / 2;
		const oy = (LH - rows * step + gap) / 2;
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const alive = rand() < 0.3;
				ctx.fillStyle = alive ? 'rgba(250, 204, 21, 0.7)' : '#1c1917';
				ctx.strokeStyle = '#44403c';
				ctx.lineWidth = 0.5;
				const x = ox + c * step;
				const y = oy + r * step;
				ctx.fillRect(x, y, size, size);
				ctx.strokeRect(x, y, size, size);
				if (alive) {
					ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
					ctx.shadowBlur = 6;
					ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
					ctx.fillRect(x, y, size, size);
					ctx.shadowBlur = 0;
				}
			}
		}
	}

	function drawHexLattice(ctx: CanvasRenderingContext2D) {
		const size = 14;
		const rand = seededRandom(77);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, LW, LH);
		const w = Math.sqrt(3) * size;
		const h = 2 * size;
		const rows = Math.ceil(LH / (h * 0.75)) + 1;
		const cols = Math.ceil(LW / w) + 2;
		const ox = (LW - (cols - 1) * w) / 2;
		const oy = (LH - (rows - 1) * h * 0.75) / 2;

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cx = ox + c * w + (r % 2 ? w / 2 : 0);
				const cy = oy + r * h * 0.75;
				const alive = rand() < 0.25;
				ctx.beginPath();
				for (let i = 0; i < 6; i++) {
					const angle = (Math.PI / 3) * i - Math.PI / 6;
					const px = cx + (size - 1) * Math.cos(angle);
					const py = cy + (size - 1) * Math.sin(angle);
					if (i === 0) ctx.moveTo(px, py);
					else ctx.lineTo(px, py);
				}
				ctx.closePath();
				if (alive) {
					ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
					ctx.shadowBlur = 6;
					ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
				} else {
					ctx.shadowBlur = 0;
					ctx.fillStyle = '#1c1917';
				}
				ctx.fill();
				ctx.shadowBlur = 0;
				ctx.strokeStyle = '#44403c';
				ctx.lineWidth = 0.5;
				ctx.stroke();
			}
		}
	}

	function drawTriLattice(ctx: CanvasRenderingContext2D) {
		const size = 20;
		const rand = seededRandom(99);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, LW, LH);
		const halfW = size / 2;
		const h = size * Math.sqrt(3) / 2;
		const rows = Math.ceil(LH / h) + 1;
		const cols = Math.ceil(LW / halfW) + 2;
		const ox = (LW - (cols - 1) * halfW) / 2;
		const oy = (LH - (rows - 1) * h) / 2;

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const up = (c + r) % 2 === 0;
				const cx = ox + c * halfW;
				const cy = oy + r * h;
				const alive = rand() < 0.25;

				ctx.beginPath();
				if (up) {
					ctx.moveTo(cx, cy);
					ctx.lineTo(cx + halfW, cy + h);
					ctx.lineTo(cx - halfW, cy + h);
				} else {
					ctx.moveTo(cx - halfW, cy);
					ctx.lineTo(cx + halfW, cy);
					ctx.lineTo(cx, cy + h);
				}
				ctx.closePath();

				if (alive) {
					ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
					ctx.shadowBlur = 6;
					ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
				} else {
					ctx.shadowBlur = 0;
					ctx.fillStyle = '#1c1917';
				}
				ctx.fill();
				ctx.shadowBlur = 0;
				ctx.strokeStyle = '#44403c';
				ctx.lineWidth = 0.5;
				ctx.stroke();
			}
		}
	}

	function drawTruncLattice(ctx: CanvasRenderingContext2D) {
		const size = 16;
		const rand = seededRandom(55);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, LW, LH);

		// Truncated square: octagons + small squares
		const s = size;
		const a = s / (1 + Math.SQRT2); // side length of octagon edge
		const cellStep = s;
		const cols = Math.ceil(LW / cellStep) + 1;
		const rows = Math.ceil(LH / cellStep) + 1;
		const ox = (LW - (cols - 1) * cellStep) / 2;
		const oy = (LH - (rows - 1) * cellStep) / 2;
		const octR = cellStep / 2;
		const sqHalf = a / 2;

		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const isOct = (c + r) % 2 === 0;
				const cx = ox + c * cellStep;
				const cy = oy + r * cellStep;
				const alive = rand() < (isOct ? 0.25 : 0.15);

				if (isOct) {
					// Regular octagon
					ctx.beginPath();
					for (let i = 0; i < 8; i++) {
						const angle = (Math.PI / 4) * i + Math.PI / 8;
						const px = cx + (octR - 1) * Math.cos(angle);
						const py = cy + (octR - 1) * Math.sin(angle);
						if (i === 0) ctx.moveTo(px, py);
						else ctx.lineTo(px, py);
					}
					ctx.closePath();
				} else {
					// Small square
					ctx.beginPath();
					ctx.rect(cx - sqHalf, cy - sqHalf, a, a);
				}

				if (alive) {
					ctx.shadowColor = 'rgba(250, 204, 21, 0.4)';
					ctx.shadowBlur = 6;
					ctx.fillStyle = 'rgba(250, 204, 21, 0.7)';
				} else {
					ctx.shadowBlur = 0;
					ctx.fillStyle = '#1c1917';
				}
				ctx.fill();
				ctx.shadowBlur = 0;
				ctx.strokeStyle = '#44403c';
				ctx.lineWidth = 0.5;
				ctx.stroke();
			}
		}
	}

	const drawFns: Record<string, (ctx: CanvasRenderingContext2D) => void> = {
		square: drawSquareLattice,
		hex: drawHexLattice,
		tri: drawTriLattice,
		trunc: drawTruncLattice,
	};

	onMount(() => {
		initGrid();
		draw();
		animFrame = requestAnimationFrame(loop);

		// Draw lattice canvases
		for (const l of latticeCanvases) {
			if (!l.canvas) continue;
			const ctx = l.canvas.getContext('2d');
			if (ctx) drawFns[l.key](ctx);
		}

		return () => {
			if (animFrame) cancelAnimationFrame(animFrame);
		};
	});
</script>

<div class="landing">
	<!-- ── Hero ── -->
	<section class="hero">
		<canvas
			bind:this={canvas}
			width={COLS * CELL_SIZE}
			height={ROWS * CELL_SIZE}
			class="hero-canvas"
		></canvas>
		<div class="hero-overlay"></div>

		<div class="hero-content">
			<div class="title-panel">
				<div class="nails"><div class="nail"></div><div class="nail"></div></div>
				<div class="nails nails-bottom"><div class="nail"></div><div class="nail"></div></div>

				<span class="pretitle">Welcome to the</span>
				<h1 class="title">Mines of Automata</h1>
				<div class="title-divider"></div>
				<p class="subtitle">
					Grab your pickaxe and strap on your backpack — there's no telling
					what's down here. Every strike uncovers a new pattern, but your
					pack only holds so much, so choose wisely. The rarest finds
					are worth keeping. Wouldn't be the first time these mines
					turned up something nobody's ever seen.
				</p>
			</div>

			<div class="hero-pipe">
				<div class="pipe-outer">
					<div class="pipe-inner"></div>
				</div>
				<div class="pipe-flange pipe-flange-top"></div>
				<div class="pipe-flange pipe-flange-bottom"></div>
			</div>

			<a href="/mine" class="cta-btn">
				<svg class="cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14.531 12.469 6.619 20.38a1 1 0 0 1-3-3l7.912-7.912" />
					<path d="M15.686 4.314A12.5 12.5 0 0 0 5.461 2.958 1 1 0 0 0 5.58 4.71a22 22 0 0 1 6.318 3.393" />
					<path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4Z" />
					<path d="M19.686 8.314a12.5 12.5 0 0 1 1.356 10.225 1 1 0 0 1-1.751-.119 22 22 0 0 0-3.393-6.318" />
				</svg>
				<span class="cta-label">Enter the Mine</span>
			</a>
		</div>
	</section>

	<!-- ── Mineable Lattices ── -->
	<section class="lattices">
		<div class="lattices-header">
			<span class="section-label">Mineable Lattices</span>
			<div class="section-line"></div>
		</div>

		<div class="lattice-row">
			{#each latticeCanvases as lattice, i}
				<div class="lattice-item">
					<canvas
						bind:this={latticeCanvases[i].canvas}
						width={LW}
						height={LH}
						class="lattice-canvas"
					></canvas>
					<span class="lattice-label">{lattice.label}</span>
					<span class="lattice-meta">{lattice.neighbors}</span>
				</div>
			{/each}
		</div>
	</section>

	<!-- ── Bottom links ── -->
	<section class="bottom-links">
		<div class="bottom-divider"></div>
		<div class="bottom-row">
			<a href="/handbook" class="bottom-link">
				<svg class="bottom-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
					<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
				</svg>
				<span>Miner's Handbook</span>
			</a>
			<a href="/gallery" class="bottom-link">
				<svg class="bottom-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="9" />
					<polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" opacity="0.3" />
					<polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
				</svg>
				<span>View Discoveries</span>
			</a>
		</div>
	</section>

	<div class="footer">
		Built by Ethan Hathaway
	</div>
</div>

<style>
	/* ── Layout ── */
	.landing {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		background: #000;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.landing::-webkit-scrollbar {
		display: none;
	}

	/* ── Hero ── */
	.hero {
		position: relative;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: min(85vh, 700px);
		overflow: hidden;
	}

	.hero-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		image-rendering: pixelated;
		opacity: 0.6;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, #000000 70%),
			linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
	}

	.hero-content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 24px;
	}

	/* ── Title panel ── */
	.title-panel {
		position: relative;
		padding: 36px 48px 32px;
		background-color: #1c1917;
		background-image:
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 10px,
				rgba(68, 64, 60, 0.1) 10px,
				rgba(68, 64, 60, 0.1) 11px
			);
		border: 2px solid #44403c;
		border-radius: 8px;
		text-align: center;
		max-width: 520px;
		box-shadow:
			0 4px 24px rgba(0,0,0,0.5),
			0 0 40px rgba(250, 204, 21, 0.04);
	}

	.pretitle {
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #78716c;
	}

	.title {
		font-family: 'Space Mono', monospace;
		font-size: 28px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #facc15;
		margin-top: 8px;
		filter: drop-shadow(0 0 12px rgba(250, 204, 21, 0.3));
	}

	.title-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin: 18px 0;
	}

	.subtitle {
		font-family: 'Space Grotesk', sans-serif;
		font-size: 14px;
		line-height: 1.75;
		letter-spacing: 0.02em;
		color: #a8a29e;
	}

	/* ── Nails ── */
	.nails {
		position: absolute;
		top: 8px;
		left: 12px;
		right: 12px;
		display: flex;
		justify-content: space-between;
		pointer-events: none;
	}

	.nails-bottom {
		top: auto;
		bottom: 8px;
	}

	.nail {
		width: 6px;
		height: 6px;
		background: #78716c;
		border-radius: 50%;
		box-shadow: inset 0 -1px 0 rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.3);
	}

	/* ── Pipe ── */
	.hero-pipe {
		position: relative;
		width: 14px;
		height: 48px;
	}

	.pipe-outer {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			#1c1917 0%,
			#292524 20%,
			#44403c 50%,
			#292524 80%,
			#1c1917 100%
		);
		border-radius: 3px;
		border: 1px solid #57534e;
		overflow: hidden;
	}

	.pipe-inner {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 4px;
		transform: translateX(-50%);
		background: rgba(250, 204, 21, 0.15);
		box-shadow: 0 0 6px rgba(250, 204, 21, 0.3);
		animation: pipe-glow 1.2s ease-in-out infinite;
	}

	@keyframes pipe-glow {
		0%   { background: rgba(250, 204, 21, 0.15); }
		50%  { background: rgba(250, 204, 21, 0.5); }
		100% { background: rgba(250, 204, 21, 0.15); }
	}

	.pipe-flange {
		position: absolute;
		left: -3px;
		right: -3px;
		height: 6px;
		background: linear-gradient(
			180deg,
			#57534e 0%,
			#78716c 40%,
			#57534e 100%
		);
		border-radius: 2px;
		border: 1px solid #44403c;
	}

	.pipe-flange-top { top: -2px; }
	.pipe-flange-bottom { bottom: -2px; }

	/* ── CTA Button ── */
	.cta-btn {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 14px;
		cursor: pointer;
		padding: 18px 40px;
		background: linear-gradient(180deg, #44403c 0%, #292524 40%, #1c1917 100%);
		border: 1.5px solid #57534e;
		border-top-color: #78716c;
		border-bottom-color: #44403c;
		border-radius: 6px;
		color: #facc15;
		text-decoration: none;
		transition: border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s;
		box-shadow:
			0 4px 0 #0c0a09,
			0 6px 12px rgba(0,0,0,0.5),
			inset 0 1px 0 rgba(255,255,255,0.1);
	}

	.cta-btn:hover {
		border-color: #facc15;
		border-top-color: #fde047;
		background: linear-gradient(180deg, #57534e 0%, #44403c 40%, #292524 100%);
		box-shadow:
			0 4px 0 #0c0a09,
			0 6px 12px rgba(0,0,0,0.5),
			0 0 20px rgba(250, 204, 21, 0.15),
			inset 0 1px 0 rgba(255,255,255,0.12);
	}

	.cta-btn:active {
		transform: translateY(3px);
		border-color: #facc15;
		box-shadow:
			0 1px 0 #57534e,
			0 0 12px rgba(250, 204, 21, 0.2),
			inset 0 2px 4px rgba(0,0,0,0.3);
	}

	.cta-icon {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		filter: drop-shadow(0 0 6px rgba(250, 204, 21, 0.5));
	}

	.cta-label {
		font-family: 'Space Mono', monospace;
		font-size: 18px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		white-space: nowrap;
	}

	/* ── Lattices ── */
	.lattices {
		width: 100%;
		max-width: 900px;
		padding: 0 24px 56px;
	}

	.lattices-header {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 32px;
	}

	.section-label {
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #78716c;
		white-space: nowrap;
	}

	.section-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, #44403c, transparent);
	}

	.lattice-row {
		display: flex;
		justify-content: center;
		gap: 40px;
		flex-wrap: wrap;
	}

	.lattice-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.lattice-canvas {
		width: 180px;
		height: 180px;
		border-radius: 50%;
		border: 2px solid #292524;
		image-rendering: auto;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	.lattice-canvas:hover {
		border-color: #44403c;
		box-shadow: 0 0 20px rgba(250, 204, 21, 0.08);
	}

	.lattice-label {
		font-family: 'Space Mono', monospace;
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #facc15;
	}

	.lattice-meta {
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #57534e;
		margin-top: -6px;
	}

	@media (max-width: 700px) {
		.lattice-row {
			gap: 28px;
		}
	}

	/* ── Bottom links ── */
	.bottom-links {
		width: 100%;
		max-width: 900px;
		padding: 0 24px 48px;
	}

	.bottom-divider {
		height: 1px;
		background: linear-gradient(90deg, transparent, #44403c 15%, #44403c 85%, transparent);
		margin-bottom: 24px;
	}

	.bottom-row {
		display: flex;
		justify-content: center;
		gap: 32px;
	}

	.bottom-link {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: 'Space Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #78716c;
		text-decoration: none;
		padding: 10px 18px;
		border-radius: 6px;
		border: 1px solid transparent;
		transition: color 0.15s, background 0.15s, border-color 0.15s;
	}

	.bottom-link:hover {
		color: #facc15;
		background: rgba(250, 204, 21, 0.06);
		border-color: #44403c;
	}

	.bottom-link-icon {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
	}

	/* ── Footer ── */
	.footer {
		padding: 24px;
		font-family: 'Space Mono', monospace;
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #44403c;
	}
</style>
