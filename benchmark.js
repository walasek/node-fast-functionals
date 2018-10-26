const Benchmark = require('benchmark');
const ProceduralLambda = require('./procedural-lambda');

function runTestsForN(n){
	function* generator(){
		for(let i = 0; i < n; i++)
			yield i;
	}
	const m1 = (v) => v*2;
	const f1 = (v) => v % 4 === 0;
	const r1 = (accum,v) => accum+v;
	const r1i = (accum,v,i) => accum+v;
	let suite;
	let packed = [...generator()];
	let lbd = (new ProceduralLambda([...generator()])).map(m1).filter(f1).reduce(r1, 0);
	let lbdi = (new ProceduralLambda([...generator()])).map(m1).filter(f1).reduce(r1i, 0);

	suite = new Benchmark.Suite('Map Filter Length');
	suite
	.add('raw', () => packed.map(m1).filter(f1).reduce(r1, 0))
	.add('lambda-with-indices', () => lbdi.execute())
	.add('lambda', () => lbd.execute())
	.on('cycle', (ev) => {
		console.log(String(ev.target));
	})
	.on('complete', function() {
		console.log(`Fastest execution for N=${n} is ${this.filter('fastest').map('name')}\n`);
	})
	.run();
}

runTestsForN(10);
runTestsForN(100);
runTestsForN(1000);
runTestsForN(10000);
runTestsForN(100000);
runTestsForN(1000000);
runTestsForN(10000000);