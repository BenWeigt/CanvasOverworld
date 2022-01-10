(()=>{
	function NeuralNetwork(/* iInputs, iLayerANodes, iLayerBNodes, iLayerCNodes...,  iOutputs */)
	{
		this.dirty = false;
		this.layers = [];
		for (let i = 0; i < arguments.length; i++)
		{
			let arrLayer = [];
			for (let j = 0; j < arguments[i]; j++)
			{
				// Each neuron is represented by an array within the layer it resides in.
				// neuron[0] => fValue
				// neuron[1,2,3...] => input relationships as array => [iNeuron, fMinInputThreshold, fInputStrength]
				arrLayer.push([0]);
			}
			this.layers.push(arrLayer);
		}
	}

	NeuralNetwork.prototype.clone = function()
	{
		let clone = new NeuralNetwork();
		clone.layers = JSON.parse(JSON.stringify(this.layers));
		return clone;
	};

	NeuralNetwork.prototype.mutate = function(factor, prng)
	{
		for (let i = 1; i < this.layers.length; i++)
		{
			let arrInputLayer = this.layers[i-1];
			let arrLayer = this.layers[i];
			for (let j = 0; j < arrLayer.length; j++)
			{
				let arrNeuron = arrLayer[j];
			
				for (let k = 1; k < arrNeuron.length; k++)
				{
					if (factor/4 > prng()) // Chance to destroy connection
					{
						arrNeuron.splice(k,1);
						k--;
						continue;
					}
					let arrRelationship = arrNeuron[k];
					if (factor > prng()) // Chance to mutate threshold
					{
						arrRelationship[1] = Math.max(Math.min(arrRelationship[1] + (((prng()-0.5) * 0.25)), 0), 1);
					}

					if (factor > prng()) // Chance to mutate strength
					{
						arrRelationship[2] = Math.max(Math.min(arrRelationship[2] + (((prng()-0.5) * 0.25)), 0), 1);
					}				
				}

				if (factor/4 > prng()) // Chance to add connection
				{
					let arrInputRelationship = [Math.floor(prng()*arrInputLayer.length), prng()/10, 0.5+prng()/2];
					arrNeuron.push(arrInputRelationship);
				}
			}
		}
	};

	NeuralNetwork.prototype._propagateNetwork = function()
	{
		for (let i = 1; i < this.layers.length; i++)
		{
			let arrInputLayer = this.layers[i-1];
			let arrLayer = this.layers[i];
			for (let j = 0; j < arrLayer.length; j++)
			{
				let arrNeuron = arrLayer[j];
				let fValue = 0;
				for (let k = 1; k < arrNeuron.length; k++)
				{
					let arrInputRelationship = arrNeuron[k];
					let arrInputNeuron = arrInputLayer[arrInputRelationship[0]];
					if (arrInputNeuron[0] >= arrInputRelationship[1])
					{
						fValue += arrInputNeuron[0] * arrInputRelationship[2];
					}
					arrNeuron[0] = Math.min(1, fValue);					
				}
			}
		}
	};

	NeuralNetwork.prototype.setInputValues = function(/* fValueA, fValueB, fValueC... */)
	{
		for (let i = 0; i < arguments.length; i++)
		{
			if (arguments[i] !== null && this.layers[0][i][0] != arguments[i])
			{
				this.layers[0][i][0] = arguments[i];
				this.dirty = true;
			}
		}
	};

	NeuralNetwork.prototype.getOutputValues = function()
	{
		if (this.dirty)
			this._propagateNetwork();
		let arrOutputValues = [];
		let arrOutputLayer = this.layers[this.layers.length-1];
		for (let i = 0; i < arrOutputLayer.length; i++)
		{
			arrOutputValues.push(arrOutputLayer[i][0]);			
		}
		return arrOutputValues;
	};

	NeuralNetwork.prototype.seedNeurons = function(prng)
	{
		for (let i = 1; i < this.layers.length; i++)
		{
			let arrInputLayer = this.layers[i-1];
			let arrLayer = this.layers[i];
			for (let j = 0; j < arrLayer.length; j++)
			{
				let arrNeuron = arrLayer[j];
				
				for (let k = 0, connections = Math.floor(prng()*2); k < connections; k++)
				{
					// [iNeuron, fMinInputThreshold, fInputStrength]
					let arrInputRelationship = [Math.floor(prng()*arrInputLayer.length), 0, 1]; //prng()/10, 0.5+prng()/2];
					arrNeuron.push(arrInputRelationship);
				}
			}
		}
	};

	window.NeuralNetwork = NeuralNetwork;
	
	
	
	
	
	
	
	
})();

(()=>{
	function NeuralNetwork(iInputs, iBody, iOutputs, iEdges, prng){
		this.in = [];
		this.body = [];
		this.out = [];
		this.all = [];
		
		this.edgeCount = iEdges;
		
		this.seedNeurons(iInputs, iBody, iOutputs, iEdges, prng);
	}
	NeuralNetwork.prototype = Object.create(null);
	
	NeuralNetwork.prototype.seedNeurons = function(iInputs, iBody, iOutputs, iEdges, prng){
		for (let i = 0; i < iInputs; i++) {
			const neuron = new Neuron();
			this.in.push(neuron);
			this.all.push(neuron);
		}
		for (let i = 0; i < iBody; i++) {
			const neuron = new Neuron();
			this.body.push(neuron);
			this.all.push(neuron);
		}
		for (let i = 0; i < iOutputs; i++) {
			const neuron = new Neuron();
			this.out.push(neuron);
			this.all.push(neuron);
		}
		
		const iB = this.body.length,
		      iA = this.all.length;
		for (; iEdges; iEdges--) {
			let neuronA = this.body[Math.floor(prng()*iB)];
			let neuronB;
			while (!neuronB || neuronB == neuronA)
				neuronB = this.all[Math.floor(prng()*iA)];
			
			const fSensitivity = prng();
			if (this.in.includes(neuronB)) {
				[neuronA, neuronB] = [neuronB, neuronA];
			}
			neuronA.out.push(neuronB);
			neuronA.outStrength.push(fSensitivity);
			neuronB.in.push(neuronA);
			neuronB.inStrength.push(fSensitivity);
		}
	};
	
	NeuralNetwork.prototype.setInputValues = function(...arrValues){
		for (const neuron of this.all) {
			neuron.value = 0;
		}
		for (let i = 0; i < arrValues.length && i < this.in.length; i++) {
			this.in[i].value = arrValues[i];
		}
	};
	NeuralNetwork.prototype.getOutputValues = function(){
		let setPropPropagate = new Set(this.in.slice().filter(n=>n.value));
		let setNextPropagate = new Set();
		let iCap = this.edgeCount*3;
		
		while (setPropPropagate.size && iCap--) {
			for (const neuronIn of setPropPropagate) {
				for (let i = 0; i < neuronIn.out.length; i++) {
					const neuronOut = neuronIn.out[i];
					const fStrength = neuronIn.outStrength[i];
					neuronOut.value += Math.min(neuronIn.value, 1) * fStrength;
					setNextPropagate.add(neuronOut);
				}
				neuronIn.value = 0;
			}
			setPropPropagate = setNextPropagate;
			setNextPropagate = new Set();
		}
		console.log(iCap);
		return this.out.map(n=>n.value);
	};
	
	function Neuron() {
		this.out = [];
		this.outStrength = [];
		this.in = [];
		this.inStrength = [];
		
		this.value = 0;
	}
	Neuron.prototype = Object.create(null);
	
	window.NeuralNetworkB = NeuralNetwork;
})();