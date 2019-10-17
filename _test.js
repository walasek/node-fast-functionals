const ProceduralLambda = require('./procedural-lambda');

const lbd = new ProceduralLambda()
.map((_,i) => 101+i)
.filter(v => v % 2 === 0)
.reduce((accum,v) => accum+v, 0);

new require('benchmark').Suite()
.add('procedural', () => {
	let suma = 0;
	for(let i = 100; i <= 1000; i++){
		if(i % 2 === 0)
			suma++;
	}
	if(suma != 450)
		return new Error('Logic Fault');
	return suma;
})
.add('functional', () => {
	const suma = Array.apply(null, Array(899))
	.map((_,i) => 101+i)
	.filter(v => v % 2 === 0)
	.reduce((a,b) => a+b, 0);
	if(suma != 450)
		return new Error('Logic Fault');
	return suma;
})
.add('lbd', () => {
	const suma = lbd.execute(Array.apply(null, Array(899)))
	if(suma != 450)
		return new Error('Logic Fault');
	return suma;
})
.on('cycle', (ev) => {
	console.log(String(ev.target));
})
.on('complete', function() {
	console.log(`Fastest: ${this.filter('fastest').map('name')}\n`);
})
.run();