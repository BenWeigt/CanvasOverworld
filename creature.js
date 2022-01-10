(()=>{
	function Creature(map, x, y, hp, prng, stability)
	{
		this.stability = stability || (prng() * 0.025);
		this.generation = 0;

		this.map = map;
		this.prng = prng;

		this.x = x;
		this.y = y;

		this.hp = hp;
		this.neural = new window.NeuralNetwork(4,6,6,6,4);
		this.neural.seedNeurons(this.prng);
		
		this.idle = 0;

		this.eaten = 0;
	}

	Creature.prototype.tick = function()
	{
		let arrSenses = this.pollSenses();
		this.neural.setInputValues(...arrSenses);
		let arrOutputs = this.neural.getOutputValues();
		let fMax = Math.max(...arrOutputs);
		if (fMax > 0)
		{
			if (arrOutputs[0] === fMax)
				this.moveUp();
			else if (arrOutputs[1] === fMax)
				this.moveRight();
			else if (arrOutputs[2] === fMax)
				this.moveDown();
			else if (arrOutputs[3] === fMax)
				this.moveLeft();
			this.idle = 0;
		}
		else if (++this.idle >= 10)
		{
			this.hp = 0;
		}

		this.hp -= 0.0005;
		if (this.hp <= 0)
		{
			this.kill();
		}
	};

	Creature.prototype.pollSenses = function()
	{
		let arrFoodSenses = [];
		arrFoodSenses.push(this._foodAt(
			Math.max(this.x-15, 0),
			Math.min(this.x+15, this.map.width),
			this.y,
			Math.min(this.y+15, this.map.height)
		));
		arrFoodSenses.push(this._foodAt(
			this.x,
			Math.min(this.x+15, this.map.width),
			Math.max(this.y-15, 0),
			Math.min(this.y+15, this.map.height)
		));
		arrFoodSenses.push(this._foodAt(
			Math.max(this.x-15, 0),
			Math.min(this.x+15, this.map.width),
			Math.max(this.y-15, 0),
			this.y
		));
		arrFoodSenses.push(this._foodAt(
			Math.max(this.x-15, 0),
			this.x,
			Math.max(this.y-15, 0),
			Math.min(this.y+15, this.map.height)
		));
		return arrFoodSenses;
	};

	Creature.prototype._foodAt = function(xFrom, xTo, yFrom, yTo)
	{
		let foodVal = 0;
		for (let x = xFrom; x < xTo; x++)
		{
			for (let y = yFrom; y < yTo; y++)
			{
				if (this.map.grid[x][y].food)
				{
					foodVal += 1 - ((Math.abs(this.x - x) + Math.abs(this.y - y)) / 20);
				}
			}
		}
		return Math.min(foodVal, 1);
	};

	
	Creature.prototype.moveUp = function()
	{
		let target = this.map.grid[this.x][this.y+1];
		if (!target)
			return;
		this.moveToTarget(target, this.x, this.y+1);
	};

	Creature.prototype.moveRight = function()
	{
		if (!this.map.grid[this.x+1])
			return;
		let target = this.map.grid[this.x+1][this.y];
		if (!target)
			return;
		this.moveToTarget(target, this.x+1, this.y);
	};

	Creature.prototype.moveDown = function()
	{
		let target = this.map.grid[this.x][this.y-1];
		if (!target)
			return;
		this.moveToTarget(target, this.x, this.y-1);
	};

	Creature.prototype.moveLeft = function()
	{
		if (!this.map.grid[this.x-1])
			return;
		let target = this.map.grid[this.x-1][this.y];
		if (!target)
			return;
		this.moveToTarget(target, this.x-1, this.y);
	};

	Creature.prototype.moveToTarget = function(target, x, y)
	{
		if (!target.creature && (target.tile[0] === 1 || target.tile[0] === 2))
		{
			this.map.grid[this.x][this.y].creature = null;
			this.x = x;
			this.y = y;
			target.creature = this;
			if (target.food)
			{
				this.hp += target.food;
				this.map.food -= target.food;
				target.food = null;
				this.eaten++;
				if (this.eaten > 3)
					console.log('Creature ate', this.eaten, this.generation);
				this.map.addRandomFood();

				if (this.hp >= 2.25)
				{
					this.map.addClonedCreature(this);
					this.map.addClonedCreature(this);
					this.map.addClonedCreature(this);
					this.map.addClonedCreature(this);
					this.map.addClonedCreature(this);
					this.map.addClonedCreature(this);
					this.map.addClonedCreature(this);
					this.map.addClonedCreature(this);
					this.hp -= 0.75;
					console.log('Creature reproduced', this.eaten, this.generation);
				}
			}
		}
	};

	Creature.prototype.kill = function()
	{
		this.map.creatures.splice(this.map.creatures.indexOf(this), 1);
		this.map.grid[this.x][this.y].creature = null;
		this.map = null;
	};







	window.Creature = Creature;
})();