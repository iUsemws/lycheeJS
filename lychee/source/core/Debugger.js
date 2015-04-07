
lychee.Debugger = typeof lychee.Debugger !== 'undefined' ? lychee.Debugger : (function(global) {

	/*
	 * HELPERS
	 */

	var _client      = null;
	var _environment = null;

	var _bootstrap_environment = function() {

		if (_environment === null) {

			var currentenv = lychee.environment;
			lychee.setEnvironment(null);

			var defaultenv = lychee.environment;
			lychee.setEnvironment(currentenv);

			_environment = defaultenv;

		}

	};

	var _diff_environment = function(environment) {

		var cache1 = {};
		var cache2 = {};

		var global1 = _environment.global;
		var global2 = environment.global;

		for (var prop1 in global1) {

			if (global1[prop1] === global2[prop1]) continue;

			if (typeof global1[prop1] !== typeof global2[prop1]) {
				cache1[prop1] = global1[prop1];
			}

		}

		for (var prop2 in global2) {

			if (global2[prop2] === global1[prop2]) continue;

			if (typeof global2[prop2] !== typeof global1[prop2]) {
				cache2[prop2] = global2[prop2];
			}

		}


		var diff = lychee.extend({}, cache1, cache2);
		if (Object.keys(diff).length > 0) {
			return diff;
		}


		return null;

	};

	var _report = function(data) {

		if (_client === null && typeof sorbet === 'object' && typeof sorbet.net === 'object' && typeof sorbet.net.Client === 'function') {

			_client = new sorbet.net.Client();
			_client.bind('connect', function() {
				_report.call(this, data);
			}, this, true);

		} else if (_client !== null) {

			var service = _client.getService('debugger');
			if (service !== null) {
				service.report('lychee.Debugger Report', data);
			}

		}


		console.error('lychee.Debugger: Report from ' + data.file + '#L' + data.line + ' in ' + data.method + ': "' + data.message + '"');

	};



	/*
	 * IMPLEMENTATION
	 */

	var Module = {

		// deserialize: function(blob) {},

		serialize: function() {

			return {
				'reference': 'lychee.Debugger',
				'blob':      null
			};

		},

		expose: function(environment) {

			environment = environment instanceof lychee.Environment ? environment : null;


			_bootstrap_environment();


			if (environment !== null) {

				var project = environment.id;
				if (project !== null) {

					if (lychee.diff(environment.global, _environment.global) === true) {

						var diff = _diff_environment(environment);
						if (diff !== null) {
							return diff;
						}

					}

				}

			}


			return null;

		},

		report: function(environment, error, definition) {

			_bootstrap_environment();


			environment = environment instanceof lychee.Environment ? environment : null;
			error       = error instanceof Error                    ? error       : null;
			definition  = definition instanceof lychee.Definition   ? definition  : null;


			if (environment !== null && error !== null) {

				var data = {
					project:     environment.id,
					definition:  definition !== null ? definition.id : null,
					environment: environment.serialize(),
					file:        null,
					line:        null,
					method:      null,
					type:        error.toString().split(':')[0],
					message:     error.message
				};


				if (typeof Error.captureStackTrace === 'function') {

					var orig = Error.prepareStackTrace;

					Error.prepareStackTrace = function(err, stack) { return stack; };
					Error.captureStackTrace(new Error());


					var callsite = error.stack[0];

					data.file   = callsite.getFileName();
					data.line   = callsite.getLineNumber();
					data.method = callsite.getFunctionName() || callsite.getMethodName();


					Error.prepareStackTrace = orig;

				}


				_report(data);


				return true;

			}


			return false;

		}

	};


	return Module;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

