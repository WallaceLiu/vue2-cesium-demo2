import axios from 'axios';

var globe = function(viewer) {
	var G = viewer;
	function view2D() {
		for (
			var e,
				t,
				n,
				a,
				r = G.canvas.width / 2,
				o = G.canvas.height / 2,
				s = r,
				c = 0;
			c < G.canvas.height;
			c++
		)
			if ((e = cesiumWindowToWGS84(s, c))) {
				e = e[1];
				break;
			}
		for (var s = r, c = G.canvas.height - 1; c >= 0; c--)
			if ((t = cesiumWindowToWGS84(s, c))) {
				t = t[1];
				break;
			}
		for (var s = 0, c = o; s < G.canvas.width; s++)
			if ((a = cesiumWindowToWGS84(s, c))) {
				a = a[0];
				break;
			}
		for (var s = G.canvas.width, c = o; s >= 0; s--)
			if ((n = cesiumWindowToWGS84(s, c))) {
				n = n[0];
				break;
			}
		return {
			east: n,
			west: a,
			north: e,
			south: t,
		};
	}

	function viewRect() {
		var east, west, north, south;
		var camera = G.scene.camera,
			r =
				(G.scene.mapProjection.ellipsoid,
				camera.computeViewRectangle(G.scene.globe.ellipsoid));
		return (
			r
				? ((east = (360 * r.east) / 2 / Math.PI),
				  (west = (360 * r.west) / 2 / Math.PI),
				  (north = (360 * r.north) / 2 / Math.PI),
				  (south = (360 * r.south) / 2 / Math.PI))
				: ((r = view2D()),
				  (east = r.east),
				  (west = r.west),
				  (north = r.north),
				  (south = r.south)),
			{
				east: east,
				west: west,
				north: north,
				south: south,
			}
		);
	}

	function cesiumWGS84ToWindowCoord(point) {
		var scene = G.scene;
		var lonlat = Cesium.Cartesian3.fromDegrees(point[0], point[1]);
		var coord = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
			scene,
			lonlat
		);
		return [coord.x, coord.y];
	}

	function cesiumWindowToWGS84(x, y) {
		var point = {
			x: x,
			y: y,
		};
		var scene = G.scene;
		var cartesian = G.camera.pickEllipsoid(point, scene.globe.ellipsoid);
		if (cartesian) {
			var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
			return [
				Cesium.Math.toDegrees(cartographic.longitude),
				Cesium.Math.toDegrees(cartographic.latitude),
			];
		}
	}

	return {
		viewRect: viewRect,
		cesiumWGS84ToWindowCoord: cesiumWGS84ToWindowCoord,
		cesiumWindowToWGS84: cesiumWindowToWGS84,
	};
};

var Windy = function(params) {
	var VELOCITY_SCALE = 0.011; // scale for wind velocity (completely arbitrary--this value looks nice)
	var INTENSITY_SCALE_STEP = 10; // step size of particle intensity color scale
	var MAX_TASK_TIME = 1000; // amount of time before a task yields control (millis)
	var MIN_SLEEP_TIME = 25; // amount of time a task waits before resuming (millis)
	var MAX_WIND_INTENSITY = 40; // wind velocity at which particle intensity is maximum (m/s)
	var MAX_PARTICLE_AGE = 200; // max number of frames a particle is drawn before regeneration
	var PARTICLE_LINE_WIDTH = 1; // line width of a drawn particle
	var PARTICLE_MULTIPLIER = 10; // particle count scalar (completely arbitrary--this values looks nice) scale: [5, 10, 15, 20, 25, 30, 35, 40]
	var PARTICLE_REDUCTION = 0.75; // reduce particle count to this much of normal for mobile devices
	var FRAME_RATE = 100; // desired milliseconds per frame
	var BOUNDARY = 0.45;

	var NULL_WIND_VECTOR = [NaN, NaN, null]; // singleton for no wind in the form: [u, v, magnitude]
	var TRANSPARENT_BLACK = [255, 0, 0, 0];

	var τ = 2 * Math.PI;
	var H = Math.pow(10, -5.2);
	var globe = params.cesiumGlobe;

	// interpolation for vectors like wind (u,v,m)
	var bilinearInterpolateVector = function(x, y, g00, g10, g01, g11) {
		var rx = 1 - x;
		var ry = 1 - y;
		var a = rx * ry,
			b = x * ry,
			c = rx * y,
			d = x * y;
		var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
		var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
		return [u, v, Math.sqrt(u * u + v * v)];
	};

	var createWindBuilder = function(uComp, vComp) {
		var uData = uComp.data,
			vData = vComp.data;
		return {
			header: uComp.header,
			//recipe: recipeFor("wind-" + uComp.header.surface1Value),
			data: function(i) {
				return [uData[i], vData[i]];
			},
			interpolate: bilinearInterpolateVector,
		};
	};

	var createBuilder = function(data) {
		var uComp = null,
			vComp = null,
			scalar = null;

		data.forEach(function(record) {
			switch (
				record.header.parameterCategory +
				',' +
				record.header.parameterNumber
			) {
				case '2,2':
					uComp = record;
					break;
				case '2,3':
					vComp = record;
					break;
				default:
					scalar = record;
			}
		});

		return createWindBuilder(uComp, vComp);
	};

	var buildGrid = function(data, callback) {
		var builder = createBuilder(data);

		var header = builder.header;
		var λ0 = header.lo1,
			φ0 = header.la1; // the grid's origin (e.g., 0.0E, 90.0N)
		var Δλ = header.dx,
			Δφ = header.dy; // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
		var ni = header.nx,
			nj = header.ny; // number of grid points W-E and N-S (e.g., 144 x 73)
		var date = new Date(header.refTime);
		date.setHours(date.getHours() + header.forecastTime);

		// Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
		// http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
		var grid = [],
			p = 0;
		var isContinuous = Math.floor(ni * Δλ) >= 360;
		for (var j = 0; j < nj; j++) {
			var row = [];
			for (var i = 0; i < ni; i++, p++) {
				row[i] = builder.data(p);
			}
			if (isContinuous) {
				// For wrapped grids, duplicate first column as last column to simplify interpolation logic
				row.push(row[0]);
			}
			grid[j] = row;
		}

		function interpolate(λ, φ) {
			var i = floorMod(λ - λ0, 360) / Δλ; // calculate longitude index in wrapped range [0, 360)
			var j = (φ0 - φ) / Δφ; // calculate latitude index in direction +90 to -90

			var fi = Math.floor(i),
				ci = fi + 1;
			var fj = Math.floor(j),
				cj = fj + 1;

			var row;
			if ((row = grid[fj])) {
				var g00 = row[fi];
				var g10 = row[ci];
				if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
					var g01 = row[fi];
					var g11 = row[ci];
					if (isValue(g01) && isValue(g11)) {
						// All four points found, so interpolate the value.
						return builder.interpolate(
							i - fi,
							j - fj,
							g00,
							g10,
							g01,
							g11
						);
					}
				}
			}
			return null;
		}
		callback({
			date: date,
			interpolate: interpolate,
		});
	};

	/**
	 * @returns {Boolean} true if the specified value is not null and not undefined.
	 */
	var isValue = function(x) {
		return x !== null && x !== undefined;
	};

	/**
	 * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
	 *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
	 */
	var floorMod = function(a, n) {
		return a - n * Math.floor(a / n);
	};

	/**
	 * @returns {Number} the value x clamped to the range [low, high].
	 */
	var clamp = function(x, range) {
		return Math.max(range[0], Math.min(x, range[1]));
	};

	/**
	 * @returns {Boolean} true if agent is probably a mobile device. Don't really care if this is accurate.
	 */
	var isMobile = function() {
		return /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(
			navigator.userAgent
		);
	};

	/**
	 * Calculate distortion of the wind vector caused by the shape of the projection at point (x, y). The wind
	 * vector is modified in place and returned by this function.
	 */
	var distort = function(projection, λ, φ, x, y, scale, wind) {
		var u = wind[0] * scale;
		var v = wind[1] * scale;

		var d = distortion(projection, λ, φ, x, y);

		// Scale distortion vectors by u and v, then add.
		wind[0] = d[0] * u + d[2] * v;
		wind[1] = d[1] * u + d[3] * v;
		return wind;
	};

	var distortion = function(projection, λ, φ, x, y) {
		var τ = 2 * Math.PI;
		var G = 36e-6;
		var i = λ < 0 ? G : -G,
			a = φ < 0 ? G : -G,
			u = projection([λ + i, φ]),
			c = projection([λ, φ + a]),
			s = Math.cos((φ / 360) * τ);
		return [
			(u[0] - x) / i / s,
			(u[1] - y) / i / s,
			(c[0] - x) / a,
			(c[1] - y) / a,
		];
	};

	var createField = function(columns, bounds, callback) {
		/**
		 * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
		 *          is undefined at that point.
		 */
		function field(x, y) {
			var column = columns[Math.round(x)];
			return (column && column[Math.round(y)]) || NULL_WIND_VECTOR;
		}

		/**
		 * @returns {boolean} true if the field is valid at the point (x, y)
		 */
		field.isDefined = function(x, y) {
			return field(x, y)[2] !== null;
		};

		/**
		 * @returns {boolean} true if the point (x, y) lies inside the outer boundary of the vector field, even if
		 *          the vector field has a hole (is undefined) at that point, such as at an island in a field of
		 *          ocean currents.
		 */
		field.isInsideBoundary = function(x, y) {
			return field(x, y) !== NULL_WIND_VECTOR;
		};

		// Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
		// field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
		field.release = function() {
			columns = [];
		};

		field.randomize = function(o) {
			// UNDONE: this method is terrible
			var x, y;
			var safetyNet = 0;
			do {
				x = Math.round(
					Math.floor(Math.random() * bounds.width) + bounds.x
				);
				y = Math.round(
					Math.floor(Math.random() * bounds.height) + bounds.y
				);
			} while (field(x, y)[2] === null && safetyNet++ < 30);
			o.x = x;
			o.y = y;
			return o;
		};

		//field.overlay = mask.imageData;
		//return field;
		callback(bounds, field);
	};

	var buildBounds = function(bounds, width, height) {
		var upperLeft = bounds[0];
		var lowerRight = bounds[1];
		var x = Math.round(upperLeft[0]); //Math.max(Math.floor(upperLeft[0], 0), 0);
		var y = Math.max(Math.floor(upperLeft[1], 0), 0);
		var xMax = Math.min(Math.ceil(lowerRight[0], width), width - 1);
		var yMax = Math.min(Math.ceil(lowerRight[1], height), height - 1);
		return {
			x: x,
			y: y,
			xMax: width,
			yMax: yMax,
			width: width,
			height: height,
		};
	};

	var deg2rad = function(deg) {
		return (deg / 180) * Math.PI;
	};

	var rad2deg = function(ang) {
		return ang / (Math.PI / 180.0);
	};

	var invert = function(x, y, windy) {
		var mapLonDelta = windy.east - windy.west;
		var worldMapRadius =
			((windy.width / rad2deg(mapLonDelta)) * 360) / (2 * Math.PI);
		var mapOffsetY =
			(worldMapRadius / 2) *
			Math.log((1 + Math.sin(windy.south)) / (1 - Math.sin(windy.south)));
		var equatorY = windy.height + mapOffsetY;
		var a = (equatorY - y) / worldMapRadius;

		var lat = (180 / Math.PI) * (2 * Math.atan(Math.exp(a)) - Math.PI / 2);
		var lon =
			rad2deg(windy.west) + (x / windy.width) * rad2deg(mapLonDelta);
		return [lon, lat];
	};

	var mercY = function(lat) {
		return Math.log(Math.tan(lat / 2 + Math.PI / 4));
	};

	var project = function(lat, lon, windy) {
		// both in radians, use deg2rad if neccessary
		var ymin = mercY(windy.south);
		var ymax = mercY(windy.north);
		var xFactor = windy.width / (windy.east - windy.west);
		var yFactor = windy.height / (ymax - ymin);

		var y = mercY(deg2rad(lat));
		var x = (deg2rad(lon) - windy.west) * xFactor;
		var y = (ymax - y) * yFactor; // y points south
		return [x, y];
	};

	function calcSparseFactor(globe) {
		var viewRect = globe.viewRect();
		var minRange = Math.min(
			Math.abs(viewRect.east - viewRect.west),
			Math.abs(viewRect.north - viewRect.south)
		);
		var factor = Math.sqrt(minRange / 90);
		return factor;
	}

	var interpolateField = function(grid, bounds, /*extent,*/ callback) {
		var projection = globe.cesiumWGS84ToWindowCoord;
		// How fast particles move on the screen (arbitrary value chosen for aesthetics).
		var sparseFactor = calcSparseFactor(globe);
		var scale = 1 / 40000;
		var velocityScale = bounds.height * scale * Math.min(3.0, sparseFactor);
		//var velocityScale = VELOCITY_SCALE;

		var columns = [];
		var x = bounds.x;

		function interpolateColumn(x) {
			var column = [];
			for (var y = bounds.y; y <= bounds.yMax; y += 2) {
				//var coord = invert( x, y, extent );
				var coord = globe.cesiumWindowToWGS84(x, y);
				if (coord) {
					var λ = coord[0],
						φ = coord[1];
					if (isFinite(λ)) {
						var wind = grid.interpolate(λ, φ);
						if (wind) {
							wind = distort(
								projection,
								λ,
								φ,
								x,
								y,
								velocityScale,
								wind /*, extent*/
							);
							column[y + 1] = column[y] = wind;
						}
					}
				}
			}
			columns[x + 1] = columns[x] = column;
		}

		(function batchInterpolate() {
			var start = Date.now();
			while (x < bounds.width) {
				interpolateColumn(x);
				x += 2;
				if (Date.now() - start > MAX_TASK_TIME) {
					setTimeout(batchInterpolate, MIN_SLEEP_TIME);
					return;
				}
			}
			createField(columns, bounds, callback);
		})();
	};

	var animate = function(bounds, field) {
		function asColorStyle(r, g, b, a) {
			return 'rgba(' + 243 + ', ' + 243 + ', ' + 238 + ', ' + a + ')';
		}

		function hexToR(h) {
			return parseInt(cutHex(h).substring(0, 2), 16);
		}
		function hexToG(h) {
			return parseInt(cutHex(h).substring(2, 4), 16);
		}
		function hexToB(h) {
			return parseInt(cutHex(h).substring(4, 6), 16);
		}
		function cutHex(h) {
			return h.charAt(0) == '#' ? h.substring(1, 7) : h;
		}

		function windIntensityColorScale(step, maxWind) {
			var result = [
				//blue to red
				// 'rgba(' +
				// 	hexToR('#178be7') +
				// 	', ' +
				// 	hexToG('#178be7') +
				// 	', ' +
				// 	hexToB('#178be7') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#8888bd') +
				// 	', ' +
				// 	hexToG('#8888bd') +
				// 	', ' +
				// 	hexToB('#8888bd') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#b28499') +
				// 	', ' +
				// 	hexToG('#b28499') +
				// 	', ' +
				// 	hexToB('#b28499') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#cc7e78') +
				// 	', ' +
				// 	hexToG('#cc7e78') +
				// 	', ' +
				// 	hexToB('#cc7e78') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#de765b') +
				// 	', ' +
				// 	hexToG('#de765b') +
				// 	', ' +
				// 	hexToB('#de765b') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#ec6c42') +
				// 	', ' +
				// 	hexToG('#ec6c42') +
				// 	', ' +
				// 	hexToB('#ec6c42') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#f55f2c') +
				// 	', ' +
				// 	hexToG('#f55f2c') +
				// 	', ' +
				// 	hexToB('#f55f2c') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#fb4f17') +
				// 	', ' +
				// 	hexToG('#fb4f17') +
				// 	', ' +
				// 	hexToB('#fb4f17') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#fe3705') +
				// 	', ' +
				// 	hexToG('#fe3705') +
				// 	', ' +
				// 	hexToB('#fe3705') +
				// 	', ' +
				// 	1 +
				// 	')',
				// 'rgba(' +
				// 	hexToR('#ff0000') +
				// 	', ' +
				// 	hexToG('#ff0000') +
				// 	', ' +
				// 	hexToB('#ff0000') +
				// 	', ' +
				// 	1 +
				// 	')',

			"rgba(" + hexToR('#00ffff') + ", " + hexToG('#00ffff') + ", " + hexToB('#00ffff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#64f0ff') + ", " + hexToG('#64f0ff') + ", " + hexToB('#64f0ff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#87e1ff') + ", " + hexToG('#87e1ff') + ", " + hexToB('#87e1ff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#a0d0ff') + ", " + hexToG('#a0d0ff') + ", " + hexToB('#a0d0ff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#b5c0ff') + ", " + hexToG('#b5c0ff') + ", " + hexToB('#b5c0ff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#c6adff') + ", " + hexToG('#c6adff') + ", " + hexToB('#c6adff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#d49bff') + ", " + hexToG('#d49bff') + ", " + hexToB('#d49bff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#e185ff') + ", " + hexToG('#e185ff') + ", " + hexToB('#e185ff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#ec6dff') + ", " + hexToG('#ec6dff') + ", " + hexToB('#ec6dff') + ", " + 0.9 + ")",
            "rgba(" + hexToR('#ff1edb') + ", " + hexToG('#ff1edb') + ", " + hexToB('#ff1edb') + ", " + 0.9 + ")"
			];
			/*
          var result = [];
          for (var j = 225; j >= 100; j = j - step) {
            result.push(asColorStyle(j, j, j, 1));
          }
          */
			result.indexFor = function(m) {
				// map wind speed to a style
				return Math.floor(
					(Math.min(m, maxWind) / maxWind) * (result.length - 1)
				);
			};
			return result;
		}

		var colorStyles = windIntensityColorScale(
			INTENSITY_SCALE_STEP,
			MAX_WIND_INTENSITY
		);
		//var colorStyles = µ.windIntensityColorScale(INTENSITY_SCALE_STEP, 17);
		var buckets = colorStyles.map(function() {
			return [];
		});

		var particleCount = Math.round(bounds.width * PARTICLE_MULTIPLIER);
		console.log(particleCount);
		if (isMobile()) {
			particleCount *= PARTICLE_REDUCTION;
		}

		var fadeFillStyle = 'rgba(255, 0, 0, 0.95)';

		var particles = [];
		for (var i = 0; i < particleCount; i++) {
			particles.push(
				field.randomize({
					age: Math.floor(Math.random() * MAX_PARTICLE_AGE) + 0,
				})
			);
		}

		function evolve() {
			buckets.forEach(function(bucket) {
				bucket.length = 0;
			});
			particles.forEach(function(particle) {
				if (particle.age > MAX_PARTICLE_AGE) {
					field.randomize(particle).age = 0;
				}
				var x = particle.x;
				var y = particle.y;
				var v = field(x, y); // vector at current position
				var m = v[2];
				if (m === null) {
					particle.age = MAX_PARTICLE_AGE; // particle has escaped the grid, never to return...
				} else {
					/*var xt = x + v[0];
                  var yt = y + v[1];*/
					var xt = x + v[0] / 3.0;
					var yt = y + v[1] / 3.0;
					if (field(xt, yt)[2] !== null) {
						// Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
						particle.xt = xt;
						particle.yt = yt;
						buckets[colorStyles.indexFor(m)].push(particle);
					} else {
						// Particle isn't visible, but it still moves through the field.
						particle.x = xt;
						particle.y = yt;
					}
				}
				particle.age += 1;
			});
		}

		var g = params.canvas.getContext('2d');
		g.lineWidth = PARTICLE_LINE_WIDTH;
		g.fillStyle = fadeFillStyle;

		function draw() {
			// Fade existing particle trails.
			var prev = g.globalCompositeOperation;
			g.globalCompositeOperation = 'destination-in';
			g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
			g.globalCompositeOperation = prev;

			// Draw new particle trails.
			buckets.forEach(function(bucket, i) {
				if (bucket.length > 0) {
					g.beginPath();
					g.strokeStyle = colorStyles[i];
					//g.strokeStyle = 'rgba(224,102,255,0.5)';
					bucket.forEach(function(particle) {
						g.moveTo(particle.x, particle.y);
						g.lineTo(particle.xt, particle.yt);
						particle.x = particle.xt;
						particle.y = particle.yt;
					});
					g.stroke();
				}
			});
		}

		(function frame() {
			try {
				windy.timer = setTimeout(function() {
					requestAnimationFrame(frame);
					evolve();
					draw();
				}, 1000 / FRAME_RATE);
			} catch (e) {
				console.error(e);
			}
		})();
	};

	var start = function(bounds, width, height /*, extent */) {
		/*var mapBounds = {
        south: deg2rad(extent[0][1]),
        north: deg2rad(extent[1][1]),
        east: deg2rad(extent[1][0]),
        west: deg2rad(extent[0][0]),
        width: width,
        height: height
      };*/

		stop();

		// build grid (params.data,callback);
		/*callback( {
          date: date,
          interpolate: interpolate
      });*/
		buildGrid(params.data, function(grid) {
			// interpolateField
			interpolateField(
				grid,
				buildBounds(bounds, width, height),
				/*mapBounds,*/ function(bounds, field) {
					// animate the canvas with random points
					windy.field = field;
					animate(bounds, field);
				}
			);
		});
		return true;
	};

	var stop = function() {
		if (windy.field) windy.field.release();
		if (windy.timer) clearTimeout(windy.timer);
	};

	var windy = {
		params: params,
		start: start,
		stop: stop,
	};

	return windy;
};

// shim layer with setTimeout fallback
window.requestAnimationFrame = (function() {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 50);
		}
	);
})();

function Wind(dataURL) {
	this.id = 'wind' + new Date().getTime();
	this.cesiumGlobe = globe(viewer);
	this.started = false;

	// 创建画布
	let canvas = document.createElement('canvas');
	canvas.id = this.id;
	canvas.width = parseInt(viewer.canvas.offsetWidth);
	canvas.height = parseInt(viewer.canvas.offsetHeight);
	canvas.style.position = 'absolute';
	canvas.style.top = '0px';
	canvas.style.left = '0px';
    canvas.style.zIndex = 999;
    canvas.style.pointerEvents = "none";
    document.body.appendChild(canvas);
    this._canvas = canvas;

	// 请求数据，初始化参数
	axios.get(dataURL).then((res) => {
		this.windy = new Windy({
			canvas: canvas,
			data: res.data,
			cesiumGlobe: this.cesiumGlobe,
		});
		this.redraw();
	});

	// 监听相机移动事件
	viewer.camera.moveStart.addEventListener(() => {
		console.log('move start...');
		canvas.style.display = 'none';
		if (!!this.windy && this.started) {
			this.windy.stop();
		}
	});
	viewer.camera.moveEnd.addEventListener(() => {
		console.log('move end...');
		canvas.style.display = 'none';
		if (!!this.windy && this.started) {
			this.redraw();
		}
	});
}

Wind.prototype.stop = function() {
	document.getElementById(this.id).style.display = 'none';
	if (!!this.windy) {
		this.windy.stop();
		this.windy = null;
	}
};

Wind.prototype.redraw = function() {
	// 调整canvas画布大小和cesium一样大
	var width = viewer.canvas.offsetWidth;
	var height = viewer.canvas.offsetHeight;
	this._canvas.width = parseInt(width);
	this._canvas.height = parseInt(height);

	this.windy.stop();

	this.started = this.windy.start(
		[
			[0, 0],
			[width, height],
		],
		width,
		height
	);

	this._canvas.style.display = '';
};

export default Wind;
