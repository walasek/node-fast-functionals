const ProceduralLambda = require('../procedural-lambda');

module.exports = (t) => {
	t.test('Mutability and branching', (t) => {
		const source = [1,2,3];
		const proc = new ProceduralLambda(source)
			.map(v => v+1);
		const branch1 = proc.reduce((accum,v) => accum+v, 0);
		const branch2 = proc.reduce((accum,v) => accum*v, 1);
		t.equal(branch1.execute(), 9);
		t.equal(branch2.execute(), 24);
		t.deepEqual(proc.execute(), [2,3,4]);
	});

	t.test('Passing a function into a lambda is handled gracefully', (t) => {
		const proc = new ProceduralLambda([1,2,3])
			.map(function(v,i,s){
				return v+1;
			});
		proc.compile();
		t.ok(true);
	});

	t.test('Invalid operations prevent compilation', (t) => {
		const proc = new ProceduralLambda([1,2,3])
			.map(v => v+1)
			.addStep('unknown-op');
		t.throws(() => proc.compile());
	});

	t.test('Using unknown variables throw', (t) => {
		const proc = new ProceduralLambda([1,2,3])
			.map(v => { v+unknown });
		proc.compile();
		t.throws(() => proc.execute());
	})

	t.test('Map', (t) => {
		const proc = new ProceduralLambda([1,2,3,4,5])
			.map(v => v+1);
		t.deepEqual(proc.execute(), [2,3,4,5,6]);

		const proc2 = proc.mapComplex(v => v+1);
		t.deepEqual(proc2.execute(), [3,4,5,6,7]);
	});

	t.test('Filter', (t) => {
		const proc = new ProceduralLambda([1,2,1,2,1])
			.filter(v => v === 1);
		t.deepEqual(proc.execute(), [1,1,1]);

		const proc2 = proc.filterComplex((_,i) => i == 1);
		t.deepEqual(proc2.execute(), [1]);
	});

	t.test('Reduce', (t) => {
		const proc = new ProceduralLambda([1,2,3,4,5])
			.reduce((accum,v) => accum+v, 0);
		t.equal(proc.execute(), 15);

		const proc2 = new ProceduralLambda([1,2,3,4,5])
			.reduceComplex((accum,v) => accum+v, 0);
		t.equal(proc2.execute(), 15);
	});

	t.test('Length', (t) => {
		const proc = new ProceduralLambda([1,2,3,4,5])
			.filter(v => v === 3);
		t.equal(proc.length, 1);
	})
}