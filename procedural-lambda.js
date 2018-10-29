/**
 * @class
 * A descriptor of a sequence of operations to be executed on a data source.
 * @description
 * Methods descriptors:
 *
 * Mutates state - changes the object's internal state
 *
 * Immutable - does not change the internal state, instead returns a new object
 *
 * Chainable - returns self, so chained calls are possible
 *
 * Quick - Passed function bodies will be injected into procedural code. Lambdas passed to _Quick_ methods *MUST* use the variable names `v,i,s` (all are optional; stands for value, index, self). Note that a Lambda does not use `{}`.
 *
 * Slow - Passed functions will be called from the procedural code.
 */
class ProceduralLambda {
	/**
	 * @constructor
	 * @param {Iterable} [source] Attach to a data source. Can be defined later with `execute`.
	 */
	constructor(source){
		this.source = source;
		this.steps = [];
		this.compiled = '';
	}

	/**
	 * Add a step to the processing pipeline.
	 * Mutates state. Chainable.
	 * @param {String} type A type of operation recognised by the compiler.
	 * @param {function} fn A user lambda.
	 * @param  {...any} args Other arguments required for the function to be executed.
	 * @private
	 * @returns {ProceduralLambda}
	 */
	addStep(type, fn, ...args){
		this.steps.push([type, fn].concat(args));
		return this;
	}

	/**
	 * Copies another ProceduralLambda's pipeline.
	 * Mutates state. Chainable.
	 * @param {Array} steps The pipeline to copy.
	 * @private
	 * @returns {ProceduralLambda}
	 */
	withSteps(steps){
		this.steps = steps.slice(0);
		return this;
	}

	/**
	 * Add a filtering step.
	 * Quick. Immutable. Chainable
	 * @param {function(v,i,s): bool} lambda The Lambda to inject.
	 * @returns {ProceduralLambda} A new instance.
	 */
	filter(lambda){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('filter', lambda);
	}

	/**
	 * Add a filtering step.
	 * Slow. Immutable. Chainable.
	 * @param {function(v,i,s): bool} fn The function to call.
	 * @returns {ProceduralLambda} A new instance.
	 */
	filterComplex(fn){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('filter-fn', fn);
	}

	/**
	 * Add a map step.
	 * @param {function(v,i,s): *} lambda The Lambda to inject.
	 * @returns {ProceduralLambda} A new instance.
	 */
	map(lambda){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('map', lambda);
	}

	/**
	 * Add a map step.
	 * @param {function(v,i,s): *} fn The function to call.
	 * @returns {ProceduralLambda} A new instance.
	 */
	mapComplex(fn){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('map-fn', fn);
	}

	/**
	 * Add a reduce step.
	 * @param {function(accum,v,i,s): *} lambda The Lambda to inject.
	 * @param {*} init Initial _accum_ value.
	 * @returns {ProceduralLambda} A new instance.
	 */
	reduce(lambda, init){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('reduce', lambda, init);
	}

	/**
	 * Add a reduce step.
	 * @param {function(accum,v,i,s): *} fn The function to call.
	 * @param {*} init Initial _accum_ value.
	 * @returns {ProceduralLambda} A new instance.
	 */
	reduceComplex(fn, init){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('reduce-fn', fn, init);
	}

	/**
	 * Add a takeUntil step.
	 * When the passed lambda returns false no more rows are processed.
	 * @param {function(v,i,s): bool} lambda The Lambda to inject.
	 * @returns {ProceduralLambda} A new instance.
	 */
	takeUntil(lambda){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('take-until', lambda);
	}

	/**
	 * Add a takeUntil step.
	 * When the passed function returns false no more rows are processed.
	 * @param {function(v,i,s): bool} fn The Function to call.
	 * @returns {ProceduralLambda} A new instance.
	 */
	takeUntilComplex(fn){
		return new ProceduralLambda(this.source)
			.withSteps(this.steps)
			.addStep('take-until-fn', fn);
	}

	/**
	 * Extract a Lambda function body. Does not work with regular function syntax.
	 * @param {function} lambda The Lambda to examine.
	 * @private
	 */
	static getLambdaBody(lambda){
		return lambda.toString().split('=>')[1];
	}

	/**
	 * Extract the number of arguments a Lambda is accepting.
	 * @param {function} lambda The Lambda to examine.
	 * @private
	 */
	static getLambdaArgnum(lambda){
		return lambda.toString().split('=>')[0].split(',').length;
	}

	/**
	 * Turn a pipeline of operations into procedural source code. Makes the next call to `execute` a bit faster.
	 * Mutates state.
	 */
	compile(){
		const REDUCE_FUNCTIONS = ['reduce', 'reduce-fn'];
		const is_reducing = (this.steps.filter(v => REDUCE_FUNCTIONS.indexOf(v[0]) !== -1).length > 0);

		const INDICE_USERS = ['map', 'filter', 'take-until'];
		const FUNCTIONS = ['map-fn', 'filter-fn', 'reduce-fn', 'take-until-fn'];
		// TODO: Implement a check for regular functions too
		// Indices are used if a lambda uses more than 1 argument, or if there are regular functions
		const is_using_i = this.steps.filter(v =>
			FUNCTIONS.indexOf(v[0]) !== -1 ||
			(INDICE_USERS.indexOf(v[0]) !== -1 && ProceduralLambda.getLambdaArgnum(v[1]) > 1) ||
			(REDUCE_FUNCTIONS.indexOf(v[0]) !== -1 && ProceduralLambda.getLambdaArgnum(v[1]) > 2)
		).length > 0;
		this.compiled = `
let index = 0;
let cursor = 0;
const lim = all.length;
let s = result;
${is_using_i ? `let per_step_i = [${Array.apply(null, new Array(this.steps.length)).map(_ => 0).join(',')}];` : ''}
${is_reducing ? 'let accum = ('+this.steps.filter(v => v[0] === 'reduce' || v[0] === 'reduce-fn')[0][2]+');' : ''}
for(index = 0; index < lim; index++){
	let v = all[index], i${is_using_i ? '' : ' = index;'};
	${this.steps.map((step,step_i,steps) => {
		let line = '';
		if(is_using_i)
			line = `i = per_step_i[${step_i}]++;
	`;
		switch(step[0]){
			case 'filter':
				line += `if(!(${ProceduralLambda.getLambdaBody(step[1])}))continue;`;
				break;

			case 'map':
				line += `v = ${ProceduralLambda.getLambdaBody(step[1])};`;
				break;

			case 'filter-fn':
				line += `if(!this.steps[${step_i}][1](v,i,s))continue;`;
				break;

			case 'map-fn':
				line += `v = this.steps[${step_i}][1](v,i,s);`;
				break;

			case 'reduce':
				line += `accum = (${ProceduralLambda.getLambdaBody(step[1])});continue;`;
				break;

			case 'reduce-fn':
				line += `accum = this.steps[${step_i}][1](accum,v,i,s);continue;`;
				break;

			case 'take-until':
				line += `if(!(${ProceduralLambda.getLambdaBody(step[1])}))break;`
				break;

			case 'take-until-fn':
				line += `if(!this.steps[${step_i}][1](v,i,s))break;`;
				break;

			default: throw Error('Invalid step '+step[0]);
		}
		/*line += `
		per_step_i[${step_i}]++`;*/
		return line;
	}).join(`
	`)}
	${!is_reducing ? 'result[cursor++] = v;' : ''}
}
${is_reducing ? 'result = accum;' : 'result.splice(cursor)'}
`;
		return this;
	}

	/**
	 * Execute the processing pipeline on a data source.
	 * @param {Iterable} [source] The data source to examine.
	 * @returns {Array|*} The result of the pipeline, which is an array or a value if the pipeline uses `reduce`.
	 */
	execute(source){
		const all = source || this.source;
		let result = new Array(all.length);
		if(!this.compiled)
			this.compile();
		try {
			eval(this.compiled);
		}catch(err){
			throw Error(`Compiled Lambda kernel failed.\n${this.compiled}\n${err.toString()}`);
		}
		return result;
	}

	/**
	 * Return the result length. Provided for compatibility with `Array` interface.
	 */
	get length(){
		return this.execute().length;
	}
}

module.exports = ProceduralLambda;

