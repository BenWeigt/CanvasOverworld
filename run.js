document.addEventListener('DOMContentLoaded', (evt)=>{
	let map = new Map(document.getElementsByTagName('canvas')[0], 'seed1', 1000, 1000);
	for (let i = 0; i < 100; i++)
	{
		map.addRandomCreature();	
	}
	for (let i = 0; i < 1400; i++)
	{
		map.addRandomFood();	
	}

	setInterval(() => {
		for (let i = 0; i < map.creatures.length; i++) {
			map.creatures[i].tick();
		}
		if (map.creatures.length <= 100)
		{
			map.addRandomCreature();
		}
		map.repaint();
	}, 0);
	
	window.map = map;
});