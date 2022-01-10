// document.addEventListener('DOMContentLoaded', (evt)=>{

// 	let neonEngine = new window.NeonEngine(600, 400);
// 	document.body.appendChild(neonEngine.canvas);
// 	neonEngine.draw();

// 	neonEngine.model.push(new window.NeonBackground(0,0,0));
// 	let neonBasicLineR = new window.NeonBasicLine(255, 0, 0, 1, 10);
// 	neonEngine.model.push(neonBasicLineR);

// 	let neonBasicLineG = new window.NeonBasicLine(0, 255, 0, 1, 10);
// 	neonEngine.model.push(neonBasicLineG);

// 	let neonBasicLineB = new window.NeonBasicLine(0, 0, 255, 1, 10);
// 	neonEngine.model.push(neonBasicLineB);

// 	neonBasicLineR.moveTo(50,  50, 550, 350);
// 	neonBasicLineG.moveTo(550, 50, 50,  350);
// 	neonBasicLineB.moveTo(300, 50, 300, 350);

// 	let l = 3000;
// 	let fn = (fTimeNow)=>{
// 		let bRev = !!(Math.floor(fTimeNow/l) % 2);
// 		let s = fTimeNow-(fTimeNow%l);
// 		let e = s + l;
// 		let f1 = bRev ? 50 : 550;
// 		let t1 = bRev ? 550 : 50;


// 		let f2 = bRev ? 50 : 350;
// 		let t2 = bRev ? 350 : 50;
// 		let f3 = bRev ? 350 : 50;
// 		let t3 = bRev ? 50 : 350;


// 		neonBasicLineR.moveTo(
// 			window.interpolate(fTimeNow, s, e, t1, f1, 'easeinoutexpo'),
// 			window.interpolate(fTimeNow, s, e, t3, f3, 'easeinoutexpo'),
// 			window.interpolate(fTimeNow, s, e, t1, f1, 'easeinoutexpo'),
// 			window.interpolate(fTimeNow, s, e, f3, t3, 'easeinoutexpo')
// 		);
// 		neonBasicLineG.moveTo(
// 			50,
// 			window.interpolate(fTimeNow, s, e, t2, f2, 'easeinoutexpo'),
// 			550,
// 			window.interpolate(fTimeNow, s, e, f2, t2, 'easeinoutexpo')
// 		);
// 		neonBasicLineB.moveTo(
// 			50,
// 			window.interpolate(fTimeNow, s, e, t3, f3, 'easeinoutexpo'),
// 			550,
// 			window.interpolate(fTimeNow, s, e, f3, t3, 'easeinoutexpo')
// 		);






// 		requestAnimationFrame(fn);
// 	};
// 	requestAnimationFrame(fn);


// });













(()=>{
	function NeonEngine(iWidth, iHeight)
	{
		this._dirty = false;

		this.w = iWidth;
		this.h = iHeight;

		this.canvas = document.createElement('canvas');
		this.canvas.width = this.w;
		this.canvas.height = this.h;

		this.draw = this.draw.bind(this);

		this.view = this.canvas.getContext('2d');
		this.model = new Proxy([], {
			set: function(obj, prop, value){
				if (typeof value == 'object'){
					value.ownerNeonEngine = this;
					this._dirty = true;
				}
				return obj[prop] = value;
			}.bind(this)
		});
	}

	
	NeonEngine.prototype.draw = function(){
		if (this._dirty || true)
		{
			this.view.clearRect(0,0,this.w,this.h);
			for (let i = 0; i < this.model.length; i++){
				this.model[i].draw();
			}
		}
		this._dirty = false;
		requestAnimationFrame(this.draw);
	};





	function NeonBackground(r, g, b)
	{
		this.ownerNeonEngine = null;
		this._fillStyle = 'rgb('+r+','+g+','+b+')';
	}

	NeonBackground.prototype.draw = function(){
		let ctx2D = this.ownerNeonEngine.view;
		ctx2D.fillStyle = this._fillStyle;
		ctx2D.fillRect(0,0,this.ownerNeonEngine.w,this.ownerNeonEngine.h);
	};



	function NeonRect(r, g, b, x, y, w, h)
	{
		this.ownerNeonEngine = null;
		this._fillStyle = 'rgb('+r+','+g+','+b+')';
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	}

	NeonRect.prototype.draw = function(){
		let ctx2D = this.ownerNeonEngine.view;
		ctx2D.fillStyle = this._fillStyle;
		ctx2D.fillRect(this.x,this.y,this.w,this.h);
	};
	





	function NeonBasicLine(r, g, b, a, blur)
	{
		this.ownerNeonEngine = null;
		this._blur = blur;
		this._color = 'rgba('+r+','+g+','+b+','+a+')';
		this._rgba = [r, g, b, a];

		let x1,x2,y1,y2;
		Object.defineProperties(this, {
			x1: {
				set: (value)=>{
					if (this.ownerNeonEngine)
						this.ownerNeonEngine._dirty = true;
					x1 = value;
				},
				get: ()=>{return x1;}
			},
			y1: {
				set: (value)=>{
					if (this.ownerNeonEngine)
						this.ownerNeonEngine._dirty = true;
					y1 = value;
				},
				get: ()=>{return y1;}
			},
			x2: {
				set: (value)=>{
					if (this.ownerNeonEngine)
						this.ownerNeonEngine._dirty = true;
					x2 = value;
				},
				get: ()=>{return x2;}
			},
			y2: {
				set: (value)=>{
					if (this.ownerNeonEngine)
						this.ownerNeonEngine._dirty = true;
					y2 = value;
				},
				get: ()=>{return y2;}
			}
		});
	}

	NeonBasicLine.prototype.moveTo = function(x1, y1, x2, y2)
	{
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	};

	NeonBasicLine.prototype.draw = function(){
		let ctx2D = this.ownerNeonEngine.view;

		ctx2D.globalCompositeOperation = 'lighter';
		ctx2D.lineWidth = 1+Math.max(Math.random(), 0.6);
		ctx2D.lineCap = 'round';
		ctx2D.strokeStyle = this._color;
		ctx2D.shadowOffsetX = 0;
		ctx2D.shadowOffsetY = 0;

		let blur = this._blur * Math.max(Math.random(), 0.6);
		
		for (let i = 1; i < blur; i++){
			ctx2D.filter = 'blur(' + i + 'px)';
			ctx2D.strokeStyle = 'rgba('+
				(this._rgba[0] + (255 - this._rgba[0]) * (1 - (i*2)/(blur)))
			+','+
				(this._rgba[1] + (255 - this._rgba[1]) * (1 - (i*2)/(blur)))
			+','+
				(this._rgba[2] + (255 - this._rgba[2]) * (1 - (i*2)/(blur)))
			+','+
				(this._rgba[3] + (255 - this._rgba[3]) * (1 - (i*2)/(blur)))
			+')';

			ctx2D.beginPath();
			ctx2D.moveTo(this.x1, this.y1);
			ctx2D.lineTo(this.x2, this.y2);
			ctx2D.stroke();
			ctx2D.closePath();
		}
		ctx2D.filter = 'none';
	};



































	function interpolate(iTimeCurrent, iTimeStart, iTimeEnd, fStart, fEnd, strEasing, fPercentSkip)
	{
		fPercentSkip = fPercentSkip === null || fPercentSkip === undefined ? 0 : fPercentSkip;
		let fPercentT = (iTimeCurrent - iTimeStart) / (iTimeEnd - iTimeStart);
		let fPercentSkipD = interpolate._easing[strEasing || 'easeoutcubic'](fPercentSkip, 0, 1, 1);
	
		// Normalise values into 0-1 range
		// Current time from start
		let fT = fPercentSkip + ((1-fPercentSkip)*(fPercentT));
		// Start value
		let fB = 0;
		// Change in value
		let fC = 1;
		// Duration
		let fD = 1;
		
		let fInterpolated = (interpolate._easing[strEasing || 'easeoutcubic'](fT, fB, fC, fD) - fPercentSkipD) / (1-fPercentSkipD);
		return (fStart + (fEnd - fStart) * fInterpolated);
	}
	window.interpolate = interpolate;
	interpolate._easing = {
		/**
		 * t - Current time from start
		 * b - Start value
		 * c - Change in value
		 * d - Duration
		 */
		// simple linear tweening - no easing, no acceleration
		linear: function(t, b, c, d){
			return c*t/d + b;
		},
		// quadratic easing in - accelerating from zero velocity
		easeinquad: function(t, b, c, d){
			t /= d;
			return c*t*t + b;
		},				
		// quadratic easing out - decelerating to zero velocity
		easeoutquad: function(t, b, c, d){
			t /= d;
			return -c * t*(t-2) + b;
		},
		// quadratic easing in/out - acceleration until halfway, then deceleration
		easeinoutquad: function(t, b, c, d){
			t /= d/2;
			if (t < 1) return c/2*t*t + b;
			t--;
			return -c/2 * (t*(t-2) - 1) + b;
		},
		// cubic easing in - accelerating from zero velocity
		easeincubic: function(t, b, c, d){
			t /= d;
			return c*t*t*t + b;
		},
		// cubic easing out - decelerating to zero velocity
		easeoutcubic: function(t, b, c, d){
			t /= d;
			t--;
			return c*(t*t*t + 1) + b;
		},
		// cubic easing in/out - acceleration until halfway, then deceleration
		easeinoutcubic: function(t, b, c, d){
			t /= d/2;
			if (t < 1) return c/2*t*t*t + b;
			t -= 2;
			return c/2*(t*t*t + 2) + b;
		},
		// quartic easing in - accelerating from zero velocity
		easeinquart: function(t, b, c, d){
			t /= d;
			return c*t*t*t*t + b;
		},
		// quartic easing out - decelerating to zero velocity
		easeoutquart: function(t, b, c, d){
			t /= d;
			t--;
			return -c * (t*t*t*t - 1) + b;
		},
		// quartic easing in/out - acceleration until halfway, then deceleration
		easeinoutquart: function(t, b, c, d){
			t /= d/2;
			if (t < 1) return c/2*t*t*t*t + b;
			t -= 2;
			return -c/2 * (t*t*t*t - 2) + b;
		},
		// quintic easing in - accelerating from zero velocity
		easeinquint: function(t, b, c, d){
			t /= d;
			return c*t*t*t*t*t + b;
		},
		// quintic easing out - decelerating to zero velocity
		easeoutquint: function(t, b, c, d){
			t /= d;
			t--;
			return c*(t*t*t*t*t + 1) + b;
		},
		// quintic easing in/out - acceleration until halfway, then deceleration
		easeinoutquint: function(t, b, c, d){
			t /= d/2;
			if (t < 1) return c/2*t*t*t*t*t + b;
			t -= 2;
			return c/2*(t*t*t*t*t + 2) + b;
		},
		// sinusoidal easing in - accelerating from zero velocity
		easeinsine: function(t, b, c, d){
			return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
		},
		// sinusoidal easing out - decelerating to zero velocity
		easeoutsine: function(t, b, c, d){
			return c * Math.sin(t/d * (Math.PI/2)) + b;
		},
		// sinusoidal easing in/out - accelerating until halfway, then decelerating
		easeinoutsine: function(t, b, c, d){
			return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
		},
		// exponential easing in - accelerating from zero velocity
		easeinexpo: function(t, b, c, d){
			return c * Math.pow( 2, 10 * (t/d - 1) ) + b;
		},
		// exponential easing out - decelerating to zero velocity
		easeoutexpo: function(t, b, c, d){
			return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
		},
		// exponential easing in/out - accelerating until halfway, then decelerating
		easeinoutexpo: function(t, b, c, d){
			t /= d/2;
			if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
			t--;
			return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
		},				
		// circular easing in - accelerating from zero velocity
		easeincirc: function(t, b, c, d){
			t /= d;
			return -c * (Math.sqrt(1 - t*t) - 1) + b;
		},
		// circular easing out - decelerating to zero velocity
		easeoutcirc: function(t, b, c, d){
			t /= d;
			t--;
			return c * Math.sqrt(1 - t*t) + b;
		},
		// circular easing in/out - acceleration until halfway, then deceleration
		easeinoutcirc: function(t, b, c, d){
			t /= d/2;
			if (t < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
			t -= 2;
			return c/2 * (Math.sqrt(1 - t*t) + 1) + b;
		}
	};


	window.NeonEngine = NeonEngine;
	window.NeonBackground = NeonBackground;
	window.NeonRect = NeonRect;
	window.NeonBasicLine = NeonBasicLine;
})();