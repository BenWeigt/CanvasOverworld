(()=>{


	function Map(canvas, seed, width, height)
	{
		this.creatures = [];
		this.food = 0;

		this.grid = [];
		this.canvas = canvas;

		this.canvas.width = width;
		this.canvas.height = height;

		this.seedGen = window.Seedable.seedGen(seed);
		this.prng = window.Seedable.randomGen(this.seedGen(), this.seedGen(), this.seedGen(), this.seedGen());

		this.width = width;
		this.height = height;

		this.zoomLevel = 1;
		this.zoomX = this._zoomX = this.width/2;
		this.zoomY = this._zoomY = this.height/2;

		canvas.addEventListener('wheel', (evt)=>{
			if (evt.deltaY !== 0)
				this.zoom(evt.deltaY < 0, evt.layerX, evt.layerY);
		});

		this.ctx = this.canvas.getContext('2d');

		var start = Date.now();

		window.noise.seed(this.prng());
		for (var x = 0; x < this.width; x++) {
			this.grid.push([]);
			for (var y = 0; y < this.height; y++) {
				
				let v = ((window.noise.simplex2( x/200, y/200 ) + 1) / (2/0.9));
				let v2 = v > 0.4 ? (window.noise.simplex2( x/30, y/30 ) / (2/0.1)) : 0;
				v += v2;
				let v3 = v > 0.1 ? (window.noise.simplex2( x/15, y/15 ) / (2/0.1)) : 0;
				v += v3;
				
				let value = v*256;
				
				if (v > 0.875)
				{
					// Mountaints
					this.grid[x].push({
						tile: [4, value, value, value],
						creature: null,
						food: null
					});
				}
				else if (v > 0.75)
				{
					// Dirt
					let r = (v-0.75)/0.2;
					this.grid[x].push({
						tile: [3, 101+(40*r), 70+(30*r), 60+(20*r)],
						creature: null,
						food: null
					});
				}
				else if (v > 0.2)
				{
					// Grass
					let r = (v-v3)/0.5;
					this.grid[x].push({
						tile: [2, 89-(15*r), 190-(30*r), 64-(10*r)],
						creature: null,
						food: null
					});
				}
				else if (v > 0.175)
				{
					// Sand
					this.grid[x].push({
						tile: [1, 241, 211, 144],
						creature: null,
						food: null
					});
				}
				else
				{
					// Water
					let r = (v-v3)/0.175;
					this.grid[x].push({
						tile: [0, 0, 90+(90*r), 100+(100*r)],
						creature: null,
						food: null
					});
				}	
			}
		}
		var end = Date.now();
		
		this.repaint();

		console.log('Rendered in ' + (end - start) + ' ms');
	}

	Map.prototype.repaint = function()
	{
		let mapData = this.ctx.createImageData(this.width, this.height);
		let data = mapData.data;

		let width = this.width / this.zoomLevel;
		let height = this.height / this.zoomLevel;

		let x = Math.floor(this.zoomX - (width/2));
		let xMax = x+width;
		let yStart = Math.floor(this.zoomY - (height/2));
		let yMax = yStart + height;
		for (let xC = 0; x < xMax; x++, xC+=this.zoomLevel)
		{
			for (let y = yStart, yC = 0; y < yMax; y++, yC+=this.zoomLevel)
			{
				if (this.grid[x][y].creature !== null)
				{
					// Draw creature
					for (let j = 0; j < this.zoomLevel; j++)
					{
						for (let k = 0; k < this.zoomLevel; k++)
						{
							let cell = ((xC+j) + (yC+k) * this.width) * 4;
							data[cell] = 255; data[cell + 1] = 0; data[cell + 2] = 0; data[cell + 3] = 255;
						}
					}
				}
				else if (this.grid[x][y].food !== null)
				{
					// Draw food
					for (let j = 0; j < this.zoomLevel; j++)
					{
						for (let k = 0; k < this.zoomLevel; k++)
						{
							let cell = ((xC+j) + (yC+k) * this.width) * 4;
							data[cell] = 0; data[cell + 1] = 95; data[cell + 2] = 0; data[cell + 3] = 255;
						}
					}
				}
				else
				{
					// Draw terain
					for (let j = 0; j < this.zoomLevel; j++)
					{
						for (let k = 0; k < this.zoomLevel; k++)
						{
							let cell = ((xC+j) + (yC+k) * this.width) * 4;
							data[cell] = this.grid[x][y].tile[1]; data[cell + 1] = this.grid[x][y].tile[2]; data[cell + 2] = this.grid[x][y].tile[3]; data[cell + 3] = 255;
						}
					}
				}
				
			}
		}
		this.ctx.imageSmoothingEnabled = false;
		this.ctx.putImageData(mapData, 0, 0);
	};

	Map.prototype.addRandomCreature = function()
	{
		let x, y; 
		do {
			x = Math.floor(this.prng() * this.width);
			y = Math.floor(this.prng() * this.height);
		} while (this.grid[x][y].tile[0] !== 2 || this.grid[x][y].creature);
		
		let creature = new window.Creature(this, x, y, 0.75, this.prng);
		this.creatures.push(creature);
		this.grid[x][y].creature = creature;
	};

	Map.prototype.addClonedCreature = function(creature)
	{
		let x, y; 
		do {
			x = Math.floor(this.prng() * this.width);
			y = Math.floor(this.prng() * this.height);
		} while (this.grid[x][y].tile[0] !== 2 || this.grid[x][y].creature);
		
		let clone = new window.Creature(this, x, y, 0.75, this.prng, creature.stability);
		clone.neural = creature.neural.clone();
		clone.neural.mutate(clone.stability, this.prng);
		clone.generation = creature.generation + 1;
		this.creatures.push(clone);
		this.grid[x][y].creature = clone;
	};

	Map.prototype.addRandomFood = function()
	{
		let x, y; 
		do {
			x = Math.floor(this.prng() * this.width);
			y = Math.floor(this.prng() * this.height);
		} while (this.grid[x][y].tile[0] !== 2);
		let food = 0.5;
		
		this.food += food;
		this.grid[x][y].food += food;
	};

	Map.prototype.zoom = function(bIn, x, y)
	{
		if (!bIn && this.zoomLevel <= 1)
			return;
		if (bIn && this.zoomLevel >= 20)
			return;

		let width = this.width / this.zoomLevel;
		let height = this.height / this.zoomLevel;

		if (bIn && !this._lastZoomWasIn)
		{
			this._zoomX = Math.floor(this.zoomX - (width/2)) + (x/this.zoomLevel);
			this._zoomY = Math.floor(this.zoomY - (height/2)) + (y/this.zoomLevel);
		}
		
		this.zoomLevel += bIn ? 1 : -1;

		this.zoomX = Math.max(Math.min(this._zoomX, this.width - (this.width/this.zoomLevel/2)), this.width/this.zoomLevel/2);
		this.zoomY = Math.max(Math.min(this._zoomY, this.height - (this.height/this.zoomLevel/2)), this.height/this.zoomLevel/2);

		this._lastZoomWasIn = bIn;
		this.repaint();
	};















































	

	/**
	 * Map
	 * @param {*} seed 
	 */
	function MapInfinite(strSeed){
		this.seed = strSeed;
		this.chunks = [[]];
		
		this.chunkSize = 32;
		this.noiseLayers = {
			// Perlin layers, [Frequency, amplitude]
			// (1/Frequency) must evenly divide into chunkSize
			z: [
				[0.125, 1],
				[0.25, 1]
			]
		};
		this.noiseLayerKeys = Object.keys(this.noiseLayers);

		this.getChunk(0, 0).populate();
	}

	MapInfinite.prototype.getChunk = function(x, y)
	{
		if (this.chunks[x])
			return this.chunks[x][y] || (this.chunks[x][y] = new Chunk(this, x, y));
		this.chunks[x] = [];
		return (this.chunks[x][y] = new Chunk(this, x, y));
	};

	/**
	 * Chunk
	 * 
	 * @param {*} map 
	 * @param {*} iChunkX 
	 * @param {*} iChunkY 
	 */
	function Chunk(map, iChunkX, iChunkY){
		this.grid = map;
		this.chunkX = iChunkX;
		this.chunkY = iChunkY;
		this.seed = ''+this.chunkX+this.grid.seed+this.chunkY;
		this.cells = [...Array(this.grid.chunkSize)].map(()=>Array(this.grid.chunkSize));

		// Create cells and generate noise mapping values from seed
		for (let x = 0; x < this.grid.chunkSize; x++)
		{
			for (let y = 0; y < this.grid.chunkSize; y++)
			{
				this.cells[x][y] = new Cell(this, x, y);
			}
		}
		// Seed generator based on chunk seed string, based on chunk location + map seed string
		let seedGen = window.Seedable.seedGen(this.seed);
		let prng = window.Seedable.randomGen(seedGen(), seedGen(), seedGen(), seedGen());

		let iRootX = this.chunkX * this.grid.chunkSize;
		let iRootY = this.chunkY * this.grid.chunkSize;
		// Each noise map
		for (let i = 0; i < this.grid.noiseLayerKeys.length; i++)
		{
			let strLayer = this.grid.noiseLayerKeys[i];
			let arrLayers = this.grid.noiseLayers[strLayer];
			// Each noise map layer
			for (let j = 0; j < arrLayers.length; j++)
			{
				let arrLayer = arrLayers[j];
				let fInterpolationDistance = 1/arrLayer[0];
				let fAmplitude = arrLayer[1];

				// If cell aligns with noise map layer frequency...
				for (let x = 0; x < this.grid.chunkSize; x++)
				{
					for (let y = 0; y < this.grid.chunkSize; y++)
					{
						if (Math.abs((iRootX+x) % fInterpolationDistance) < 1 && Math.abs((iRootY+y) % fInterpolationDistance) < 1)
						{
							// Generate a prng value of appropriate amplitude for that layer
							this.cells[x][y].noiseLayers[strLayer] = this.cells[x][y].noiseLayers[strLayer] || [];
							this.cells[x][y].noiseLayers[strLayer][j] = prng()*fAmplitude;
						}
					}
				}
			}
		}
	}

	Chunk.prototype.populate = function(){
		let chunkT = this.grid.getChunk(this.chunkX, this.chunkY+1);
		let chunkTR = this.grid.getChunk(this.chunkX+1, this.chunkY+1);
		let chunkR = this.grid.getChunk(this.chunkX+1, this.chunkY);

		for (let i = 0; i < this.grid.noiseLayerKeys.length; i++)
		{
			let strLayer = this.grid.noiseLayerKeys[i];
			let arrLayers = this.grid.noiseLayers[strLayer];
		}



	};

	/**
	 * Cell
	 * @param {*} chunk 
	 * @param {*} iCellX 
	 * @param {*} iCellY 
	 */
	function Cell(chunk, iCellX, iCellY)
	{
		this.chunk = chunk;
		this.cellX = iCellX;
		this.cellY = iCellY;
		this.noiseLayers = {};
	}

	window.MapInfinite = MapInfinite;
	window.Map = Map;
})();