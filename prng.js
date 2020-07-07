// Simple pseudo-random number generator

(function () {
    window.dataSources = window.dataSources || {};

    // Polyfill integer multiplication (for IE? Even though it should never matter?)
    if (!Math.imul) {
        Math.imul = function (a, b) {
            b |= 0;
            var result = (a & 0x003fffff) * b;
            if (a & 0xffc00000) {
                result += (a & 0xffc00000) * b | 0;
            }
            return result | 0;
        }
    }

    // Get a hash from a string
    function xmur3(str) {
        for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
            h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
            h = h << 13 | h >>> 19;
        return function () {
            h = Math.imul(h ^ h >>> 16, 2246822507);
            h = Math.imul(h ^ h >>> 13, 3266489909);
            return (h ^= h >>> 16) >>> 0;
        }
    }

    // Get a random number generator from a seed state
    function mulberry32(seed) {
        return function () {
            var t = seed += 0x6d2b79f5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    function prng(seed) {
        var _prng = mulberry32(seed || new Date().valueOf());

        this.seed = function (seed) {
            if (seed === null || typeof seed === "undefined") {
                seed = null;
            }
            else if (Number.isInteger(seed)) {
                seed |= 0;
            }
            else if (typeof seed === "string") {
                seed = xmur3(seed)();
            }
            else {
                try {
                    seed = xmur3(JSON.stringify(seed))();
                }
                catch (e) {
                    throw "Invalid seed. Seed must be an integer, string, or an object that can be converted to JSON.";
                }
            }

            return new prng(seed);
        }
        this.random = function () {
            return _prng();
        }
    }

    window.dataSources.PRNG = new prng();
})();