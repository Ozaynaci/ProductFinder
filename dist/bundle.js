(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Promise = require('promise');

var _require = require('./helpers'),
    checkType = _require.checkType;

var Models = require('./Models');
var Inputs = require('./Inputs');
var Concepts = require('./Concepts');

var _require2 = require('./constants'),
    API = _require2.API,
    ERRORS = _require2.ERRORS;

var TOKEN_PATH = API.TOKEN_PATH;

/**
* top-level class that allows access to models, inputs and concepts
* @class
*/

var App = function () {
  function App(clientId, clientSecret, options) {
    _classCallCheck(this, App);

    this._validate(clientId, clientSecret, options);
    this._init(clientId, clientSecret, options);
  }
  /**
  * Gets a token from the API using client credentials
  * @return {Promise(token, error)} A Promise that is fulfilled with the token string or rejected with an error
  */


  _createClass(App, [{
    key: 'getToken',
    value: function getToken() {
      return this._config.token();
    }
    /**
    * Sets the token to use for the API
    * @param {String}         _token    The token you are setting
    * @return {Boolean}                 true if token has valid fields, false if not
    */

  }, {
    key: 'setToken',
    value: function setToken(_token) {
      var token = _token;
      var now = new Date().getTime();
      if (typeof _token === 'string') {
        token = {
          accessToken: _token,
          expiresIn: 176400
        };
      } else {
        token = {
          accessToken: _token.access_token || _token.accessToken,
          expiresIn: _token.expires_in || _token.expiresIn
        };
      }
      if (token.accessToken && token.expiresIn || token.access_token && token.expires_in) {
        if (!token.expireTime) {
          token.expireTime = now + token.expiresIn * 1000;
        }
        this._config._token = token;
        return true;
      }
      return false;
    }
  }, {
    key: '_validate',
    value: function _validate(clientId, clientSecret, options) {
      if ((!clientId || !clientSecret) && !options.token) {
        throw ERRORS.paramsRequired(['Client ID', 'Client Secret']);
      }
    }
  }, {
    key: '_init',
    value: function _init(clientId, clientSecret) {
      var _this = this;

      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      this._config = {
        apiEndpoint: options.apiEndpoint || process && process.env && process.env.API_ENDPOINT || 'https://api.clarifai.com',
        clientId: clientId,
        clientSecret: clientSecret,
        token: function token() {
          return new Promise(function (resolve, reject) {
            var now = new Date().getTime();
            if (checkType(/Object/, _this._config._token) && _this._config._token.expireTime > now) {
              resolve(_this._config._token);
            } else {
              _this._getToken(resolve, reject);
            }
          });
        }
      };
      if (options.token) {
        this.setToken(options.token);
      }
      this.models = new Models(this._config);
      this.inputs = new Inputs(this._config);
      this.concepts = new Concepts(this._config);
    }
  }, {
    key: '_getToken',
    value: function _getToken(resolve, reject) {
      var _this2 = this;

      this._requestToken().then(function (response) {
        if (response.status === 200) {
          _this2.setToken(response.data);
          resolve(_this2._config._token);
        } else {
          reject(response);
        }
      }, reject);
    }
  }, {
    key: '_requestToken',
    value: function _requestToken() {
      var url = '' + this._config.apiEndpoint + TOKEN_PATH;
      var clientId = this._config.clientId;
      var clientSecret = this._config.clientSecret;
      return axios({
        'url': url,
        'method': 'POST',
        'auth': {
          'username': clientId,
          'password': clientSecret
        }
      });
    }
  }]);

  return App;
}();

;

module.exports = App;
}).call(this,require('_process'))
},{"./Concepts":3,"./Inputs":5,"./Models":7,"./constants":8,"./helpers":9,"_process":42,"axios":12,"promise":30}],2:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
* class representing a concept and its info
* @class
*/
var Concept = function Concept(_config, data) {
  _classCallCheck(this, Concept);

  this.id = data.id;
  this.name = data.name;
  this.createdAt = data.created_at || data.createdAt;
  this.appId = data.app_id || data.appId;
  this.value = data.value || null;
  this._config = _config;
  this.rawData = data;
};

;

module.exports = Concept;
},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Concept = require('./Concept');

var _require = require('./constants'),
    API = _require.API,
    replaceVars = _require.replaceVars;

var CONCEPTS_PATH = API.CONCEPTS_PATH,
    CONCEPT_PATH = API.CONCEPT_PATH,
    CONCEPT_SEARCH_PATH = API.CONCEPT_SEARCH_PATH;

var _require2 = require('./utils'),
    wrapToken = _require2.wrapToken,
    formatConcept = _require2.formatConcept;

var _require3 = require('./helpers'),
    isSuccess = _require3.isSuccess,
    checkType = _require3.checkType;

/**
* class representing a collection of concepts
* @class
*/


var Concepts = function () {
  function Concepts(_config) {
    var _this = this;

    var rawData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, Concepts);

    this._config = _config;
    this.rawData = rawData;
    rawData.forEach(function (conceptData, index) {
      _this[index] = new Concept(_this._config, conceptData);
    });
    this.length = rawData.length;
  }
  /**
  * List all the concepts
  * @param {object}     options     Object with keys explained below: (optional)
  *    @param {number}    options.page        The page number (optional, default: 1)
  *    @param {number}    options.perPage     Number of images to return per page (optional, default: 20)
  * @return {Promise(Concepts, error)} A Promise that is fulfilled with a Concepts instance or rejected with an error
  */


  _createClass(Concepts, [{
    key: 'list',
    value: function list() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { page: 1, perPage: 20 };

      var url = '' + this._config.apiEndpoint + CONCEPTS_PATH;
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, {
            headers: headers,
            params: {
              'page': options.page,
              'per_page': options.perPage
            }
          }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Concepts(_this2._config, response.data.concepts));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * List a single concept given an id
    * @param {String}     id          The concept's id
    * @return {Promise(Concept, error)} A Promise that is fulfilled with a Concept instance or rejected with an error
    */

  }, {
    key: 'get',
    value: function get(id) {
      var _this3 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(CONCEPT_PATH, [id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Concept(_this3._config, response.data.concept));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Add a list of concepts given an id and name
    * @param {object|object[]}   concepts       Can be a single media object or an array of media objects
    *   @param  {object|string}    concepts[].concept         If string, this is assumed to be the concept id. Otherwise, an object with the following attributes
    *     @param  {object}           concepts[].concept.id      The new concept's id (Required)
    *     @param  {object}           concepts[].concept.name    The new concept's name
    * @return {Promise(Concepts, error)}             A Promise that is fulfilled with a Concepts instance or rejected with an error
    */

  }, {
    key: 'create',
    value: function create() {
      var _this4 = this;

      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (checkType(/(Object|String)/, concepts)) {
        concepts = [concepts];
      }
      var data = {
        'concepts': concepts.map(formatConcept)
      };
      var url = '' + this._config.apiEndpoint + CONCEPTS_PATH;
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.post(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Concepts(_this4._config, response.data.concepts));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Search for a concept given a name. A wildcard can be given (example: The name "bo*" will match with "boat" and "bow" given those concepts exist
    * @param  {string}   name  The name of the concept to search for
    * @return {Promise(Concepts, error)} A Promise that is fulfilled with a Concepts instance or rejected with an error
    */

  }, {
    key: 'search',
    value: function search(name) {
      var _this5 = this;

      var language = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var url = '' + this._config.apiEndpoint + CONCEPT_SEARCH_PATH;
      return wrapToken(this._config, function (headers) {
        var params = {
          'concept_query': { name: name, language: language }
        };
        return new Promise(function (resolve, reject) {
          axios.post(url, params, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Concepts(_this5._config, response.data.concepts));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
  }]);

  return Concepts;
}();

;

module.exports = Concepts;
},{"./Concept":2,"./constants":8,"./helpers":9,"./utils":11,"axios":12}],4:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Concepts = require('./Concepts');

var _require = require('./constants'),
    API = _require.API;

var INPUTS_PATH = API.INPUTS_PATH;

/**
* class representing an input
* @class
*/

var Input = function () {
  function Input(_config, data) {
    _classCallCheck(this, Input);

    this.id = data.id;
    this.createdAt = data.created_at || data.createdAt;
    this.imageUrl = data.data.image.url;
    this.concepts = new Concepts(_config, data.data.concepts);
    this.score = data.score;
    this.metadata = data.data.metadata;
    if (data.data.geo && data.data.geo['geo_point']) {
      this.geo = { geoPoint: data.data.geo['geo_point'] };
    }
    this.rawData = data;
    this._config = _config;
  }
  /**
  * Merge concepts to an input
  * @param {object[]}         concepts    Object with keys explained below:
  *   @param {object}           concepts[].concept
  *     @param {string}           concepts[].concept.id        The concept id (required)
  *     @param {boolean}          concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
  * @param {object}           metadata                      Object with key values to attach to the input (optional)
  * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
  */


  _createClass(Input, [{
    key: 'mergeConcepts',
    value: function mergeConcepts(concepts, metadata) {
      return this._update('merge', concepts, metadata);
    }
    /**
    * Delete concept from an input
    * @param {object[]}         concepts    Object with keys explained below:
    *   @param {object}           concepts[].concept
    *     @param {string}           concepts[].concept.id        The concept id (required)
    *     @param {boolean}          concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
    * @param {object}           metadata                      Object with key values to attach to the input (optional)
    * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
    */

  }, {
    key: 'deleteConcepts',
    value: function deleteConcepts(concepts, metadata) {
      return this._update('remove', concepts, metadata);
    }
    /**
    * Overwrite inputs
    * @param {object[]}         concepts                      Array of object with keys explained below:
    *   @param {object}           concepts[].concept
    *     @param {string}           concepts[].concept.id         The concept id (required)
    *     @param {boolean}          concepts[].concept.value      Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
    * @param {object}           metadata                      Object with key values to attach to the input (optional)
    * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
    */

  }, {
    key: 'overwriteConcepts',
    value: function overwriteConcepts(concepts, metadata) {
      return this._update('overwrite', concepts, metadata);
    }
  }, {
    key: '_update',
    value: function _update(action) {
      var concepts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var metadata = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var url = '' + this._config.apiEndpoint + INPUTS_PATH;
      var inputData = {};
      if (concepts.length) {
        inputData.concepts = concepts;
      }
      if (metadata !== null) {
        inputData.metadata = metadata;
      }
      var data = {
        action: action,
        inputs: [{
          id: this.id,
          data: inputData
        }]
      };
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          return axios.patch(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Input(response.data.input));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
  }]);

  return Input;
}();

;

module.exports = Input;
},{"./Concepts":3,"./constants":8,"axios":12}],5:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Input = require('./Input');

var _require = require('./constants'),
    API = _require.API,
    ERRORS = _require.ERRORS,
    MAX_BATCH_SIZE = _require.MAX_BATCH_SIZE,
    replaceVars = _require.replaceVars;

var INPUT_PATH = API.INPUT_PATH,
    INPUTS_PATH = API.INPUTS_PATH,
    INPUTS_STATUS_PATH = API.INPUTS_STATUS_PATH,
    SEARCH_PATH = API.SEARCH_PATH;

var _require2 = require('./utils'),
    wrapToken = _require2.wrapToken,
    formatInput = _require2.formatInput,
    formatImagesSearch = _require2.formatImagesSearch,
    formatConceptsSearch = _require2.formatConceptsSearch;

var _require3 = require('./helpers'),
    isSuccess = _require3.isSuccess,
    checkType = _require3.checkType,
    clone = _require3.clone;

/**
 * class representing a collection of inputs
 * @class
 */


var Inputs = function () {
  function Inputs(_config) {
    var _this = this;

    var rawData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, Inputs);

    this.rawData = rawData;
    rawData.forEach(function (inputData, index) {
      if (inputData.input && inputData.score) {
        inputData.input.score = inputData.score;
        inputData = inputData.input;
      }
      _this[index] = new Input(_this._config, inputData);
    });
    this.length = rawData.length;
    this._config = _config;
  }
  /**
   * Get all inputs in app
   * @param {Object}    options  Object with keys explained below: (optional)
  *   @param {Number}    options.page  The page number (optional, default: 1)
  *   @param {Number}    options.perPage  Number of images to return per page (optional, default: 20)
  * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
  */


  _createClass(Inputs, [{
    key: 'list',
    value: function list() {
      var _this2 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { page: 1, perPage: 20 };

      var url = '' + this._config.apiEndpoint + INPUTS_PATH;
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, {
            headers: headers,
            params: {
              page: options.page,
              per_page: options.perPage
            }
          }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Inputs(_this2._config, response.data.inputs));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Adds an input or multiple inputs
    * @param {object|object[]}        inputs                                Can be a single media object or an array of media objects (max of 128 inputs/call; passing > 128 will throw an exception)
    *   @param {object|string}          inputs[].input                        If string, is given, this is assumed to be an image url
    *     @param {string}                 inputs[].input.(url|base64)           Can be a publicly accessibly url or base64 string representing image bytes (required)
    *     @param {string}                 inputs[].input.id                     ID of input (optional)
    *     @param {number[]}               inputs[].input.crop                   An array containing the percent to be cropped from top, left, bottom and right (optional)
    *     @param {object[]}               inputs[].input.metadata               Object with key and values pair (value can be string, array or other objects) to attach to the input (optional)
    *     @param {object}                 inputs[].input.geo                    Object with latitude and longitude coordinates to associate with an input. Can be used in search query as the proximity of an input to a reference point (optional)
    *       @param {number}                 inputs[].input.geo.latitude           +/- latitude val of geodata
    *       @param {number}                 inputs[].input.geo.longitude          +/- longitude val of geodata
    *     @param {object[]}               inputs[].input.concepts               An array of concepts to attach to media object (optional)
    *       @param {object|string}          inputs[].input.concepts[].concept     If string, is given, this is assumed to be concept id with value equals true
    *         @param {string}                 inputs[].input.concepts[].concept.id          The concept id (required)
    *         @param {boolean}                inputs[].input.concepts[].concept.value       Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
    * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
    */

  }, {
    key: 'create',
    value: function create(inputs) {
      var _this3 = this;

      if (checkType(/(String|Object)/, inputs)) {
        inputs = [inputs];
      }
      var url = '' + this._config.apiEndpoint + INPUTS_PATH;
      if (inputs.length > MAX_BATCH_SIZE) {
        throw ERRORS.MAX_INPUTS;
      }
      return wrapToken(this._config, function (headers) {
        var data = {
          inputs: inputs.map(formatInput)
        };
        return new Promise(function (resolve, reject) {
          axios.post(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Inputs(_this3._config, response.data.inputs));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Get input by id
    * @param {String}    id  The input id
    * @return {Promise(Input, error)} A Promise that is fulfilled with an instance of Input or rejected with an error
    */

  }, {
    key: 'get',
    value: function get(id) {
      var _this4 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(INPUT_PATH, [id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Input(_this4._config, response.data.input));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Delete an input or a list of inputs by id or all inputs if no id is passed
    * @param {string|string[]}    id           The id of input to delete (optional)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'delete',
    value: function _delete() {
      var _this5 = this;

      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var val = void 0;
      // delete an input
      if (checkType(/String/, id)) {
        (function () {
          var url = '' + _this5._config.apiEndpoint + replaceVars(INPUT_PATH, [id]);
          val = wrapToken(_this5._config, function (headers) {
            return axios.delete(url, { headers: headers });
          });
        })();
      } else {
        val = this._deleteInputs(id);
      }
      return val;
    }
  }, {
    key: '_deleteInputs',
    value: function _deleteInputs() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      var url = '' + this._config.apiEndpoint + INPUTS_PATH;
      return wrapToken(this._config, function (headers) {
        var data = id === null ? { delete_all: true } : { ids: id };
        return axios({
          url: url,
          method: 'delete',
          headers: headers,
          data: data
        });
      });
    }
    /**
    * Merge concepts to inputs in bulk
    * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
    *   @param {object}           inputs[].input
    *     @param {string}           inputs[].input.id        The id of the input to update
    *     @param {string}           inputs[].input.concepts  Object with keys explained below:
    *       @param {object}           inputs[].input.concepts[].concept
    *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
    *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
    * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
    */

  }, {
    key: 'mergeConcepts',
    value: function mergeConcepts(inputs) {
      inputs.action = 'merge';
      return this.update(inputs);
    }
    /**
    * Delete concepts to inputs in bulk
    * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
    *   @param {object}           inputs[].input
    *     @param {string}           inputs[].input.id                           The id of the input to update
    *     @param {string}           inputs[].input.concepts                     Object with keys explained below:
    *       @param {object}           inputs[].input.concepts[].concept
    *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
    *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
    * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
    */

  }, {
    key: 'deleteConcepts',
    value: function deleteConcepts(inputs) {
      inputs.action = 'remove';
      return this.update(inputs);
    }
    /**
    * Overwrite inputs in bulk
    * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
    *   @param {object}           inputs[].input
    *     @param {string}           inputs[].input.id                           The id of the input to update
    *     @param {string}           inputs[].input.concepts                     Object with keys explained below:
    *       @param {object}           inputs[].input.concepts[].concept
    *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
    *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
    * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
    */

  }, {
    key: 'overwriteConcepts',
    value: function overwriteConcepts(inputs) {
      inputs.action = 'overwrite';
      return this.update(inputs);
    }
    /**
    * @param {object[]}         inputs    List of concepts to update (max of 128 inputs/call; passing > 128 will throw an exception)
    *   @param {object}           inputs[].input
    *     @param {string}           inputs[].input.id                           The id of the input to update
    *     @param {object}           inputs[].input.metadata                     Object with key values to attach to the input (optional)
    *     @param {object}           inputs[].input.geo                          Object with latitude and longitude coordinates to associate with an input. Can be used in search query as the proximity of an input to a reference point (optional)
    *       @param {number}           inputs[].input.geo.latitude                 +/- latitude val of geodata
    *       @param {number}           inputs[].input.geo.longitude                +/- longitude val of geodata
    *     @param {string}           inputs[].input.concepts                     Object with keys explained below (optional):
    *       @param {object}           inputs[].input.concepts[].concept
    *         @param {string}           inputs[].input.concepts[].concept.id        The concept id (required)
    *         @param {boolean}          inputs[].input.concepts[].concept.value     Whether or not the input is a positive (true) or negative (false) example of the concept (default: true)
    * @return {Promise(Inputs, error)} A Promise that is fulfilled with an instance of Inputs or rejected with an error
    */

  }, {
    key: 'update',
    value: function update(inputs) {
      var _this6 = this;

      var url = '' + this._config.apiEndpoint + INPUTS_PATH;
      var inputsList = Array.isArray(inputs) ? inputs : [inputs];
      if (inputsList.length > MAX_BATCH_SIZE) {
        throw ERRORS.MAX_INPUTS;
      }
      var data = {
        action: inputs.action,
        inputs: inputsList.map(function (input) {
          return formatInput(input, false);
        })
      };
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.patch(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Inputs(_this6._config, response.data.inputs));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Search for inputs or outputs based on concepts or images
    *   @param {object[]}               queries          List of all predictions to match with
    *     @param {object}                 queries[].concept            An object with the following keys:
    *       @param {string}                 queries[].concept.id          The concept id
    *       @param {string}                 queries[].concept.type        Search over 'input' to get input matches to criteria or 'output' to get inputs that are visually similar to the criteria (default: 'output')
    *       @param {string}                 queries[].concept.name        The concept name
    *       @param {boolean}                queries[].concept.value       Indicates whether or not the term should match with the prediction returned (default: true)
    *     @param {object}                 queries[].input              An image object that contains the following keys:
    *       @param {string}                 queries[].input.id            The input id
    *       @param {string}                 queries[].input.type          Search over 'input' to get input matches to criteria or 'output' to get inputs that are visually similar to the criteria (default: 'output')
    *       @param {string}                 queries[].input.(base64|url)  Can be a publicly accessibly url or base64 string representing image bytes (required)
    *       @param {number[]}               queries[].input.crop          An array containing the percent to be cropped from top, left, bottom and right (optional)
    *       @param {object}                 queries[].input.metadata      An object with key and value specified by user to refine search with (optional)
    * @param {Object}                   options       Object with keys explained below: (optional)
    *    @param {Number}                  options.page          The page number (optional, default: 1)
    *    @param {Number}                  options.perPage       Number of images to return per page (optional, default: 20)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'search',
    value: function search() {
      var queries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { page: 1, perPage: 20 };

      var formattedAnds = [];
      var url = '' + this._config.apiEndpoint + SEARCH_PATH;
      var data = {
        query: {
          ands: []
        },
        pagination: {
          page: options.page,
          per_page: options.perPage
        }
      };

      if (!Array.isArray(queries)) {
        queries = [queries];
      }
      if (queries.length > 0) {
        queries.forEach(function (query) {
          if (query.input) {
            formattedAnds = formattedAnds.concat(formatImagesSearch(query.input));
          } else if (query.concept) {
            formattedAnds = formattedAnds.concat(formatConceptsSearch(query.concept));
          }
        });
        data.query.ands = formattedAnds;
      }
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.post(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              var _data = clone(response.data);
              _data.rawData = clone(response.data);
              resolve(_data);
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Get inputs status (number of uploaded, in process or failed inputs)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'getStatus',
    value: function getStatus() {
      var url = '' + this._config.apiEndpoint + INPUTS_STATUS_PATH;
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              var data = clone(response.data);
              data.rawData = clone(response.data);
              resolve(data);
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
  }]);

  return Inputs;
}();

;

module.exports = Inputs;
},{"./Input":4,"./constants":8,"./helpers":9,"./utils":11,"axios":12}],6:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');

var _require = require('./helpers'),
    isSuccess = _require.isSuccess,
    checkType = _require.checkType,
    clone = _require.clone;

var _require2 = require('./constants'),
    API = _require2.API,
    SYNC_TIMEOUT = _require2.SYNC_TIMEOUT,
    replaceVars = _require2.replaceVars,
    STATUS = _require2.STATUS,
    POLLTIME = _require2.POLLTIME;

var MODEL_QUEUED_FOR_TRAINING = STATUS.MODEL_QUEUED_FOR_TRAINING,
    MODEL_TRAINING = STATUS.MODEL_TRAINING;

var _require3 = require('./utils'),
    wrapToken = _require3.wrapToken,
    formatImagePredict = _require3.formatImagePredict,
    formatModel = _require3.formatModel;

var MODEL_VERSIONS_PATH = API.MODEL_VERSIONS_PATH,
    MODEL_VERSION_PATH = API.MODEL_VERSION_PATH,
    MODELS_PATH = API.MODELS_PATH,
    PREDICT_PATH = API.PREDICT_PATH,
    VERSION_PREDICT_PATH = API.VERSION_PREDICT_PATH,
    MODEL_INPUTS_PATH = API.MODEL_INPUTS_PATH,
    MODEL_OUTPUT_PATH = API.MODEL_OUTPUT_PATH,
    MODEL_VERSION_INPUTS_PATH = API.MODEL_VERSION_INPUTS_PATH;

/**
* class representing a model
* @class
*/

var Model = function () {
  function Model(_config, data) {
    _classCallCheck(this, Model);

    this._config = _config;
    this.name = data.name;
    this.id = data.id;
    this.createdAt = data.created_at || data.createdAt;
    this.appId = data.app_id || data.appId;
    this.outputInfo = data.output_info || data.outputInfo;
    if (checkType(/(String)/, data.version)) {
      this.modelVersion = {};
      this.versionId = data.version;
    } else {
      this.modelVersion = data.model_version || data.modelVersion || data.version;
      this.versionId = (this.modelVersion || {}).id;
    }
    this.rawData = data;
  }
  /**
  * Merge concepts to a model
  * @param {object[]}      concepts    List of concept objects with id
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */


  _createClass(Model, [{
    key: 'mergeConcepts',
    value: function mergeConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var conceptsArr = Array.isArray(concepts) ? concepts : [concepts];
      return this.update({ action: 'merge', concepts: conceptsArr });
    }
    /**
    * Remove concepts from a model
    * @param {object[]}      concepts    List of concept objects with id
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'deleteConcepts',
    value: function deleteConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var conceptsArr = Array.isArray(concepts) ? concepts : [concepts];
      return this.update({ action: 'remove', concepts: conceptsArr });
    }
    /**
    * Overwrite concepts in a model
    * @param {object[]}      concepts    List of concept objects with id
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'overwriteConcepts',
    value: function overwriteConcepts() {
      var concepts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var conceptsArr = Array.isArray(concepts) ? concepts : [concepts];
      return this.update({ action: 'overwrite', concepts: conceptsArr });
    }
    /**
    * Update a model's output config or concepts
    * @param {object}               model                                 An object with any of the following attrs:
    *   @param {string}               name                                  The new name of the model to update with
    *   @param {boolean}              conceptsMutuallyExclusive             Do you expect to see more than one of the concepts in this model in the SAME image? Set to false (default) if so. Otherwise, set to true.
    *   @param {boolean}              closedEnvironment                     Do you expect to run the trained model on images that do not contain ANY of the concepts in the model? Set to false (default) if so. Otherwise, set to true.
    *   @param {object[]}             concepts                              An array of concept objects or string
    *     @param {object|string}        concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
    *       @param {string}             concepts[].concept.id                   The id of the concept to attach to the model
    *   @param {object[]}             action                                The action to perform on the given concepts. Possible values are 'merge', 'remove', or 'overwrite'. Default: 'merge'
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'update',
    value: function update(obj) {
      var _this = this;

      var url = '' + this._config.apiEndpoint + MODELS_PATH;
      var modelData = [obj];
      var data = { models: modelData.map(function (m) {
          return formatModel(Object.assign(m, { id: _this.id }));
        }) };
      if (Array.isArray(obj.concepts)) {
        data['action'] = obj.action || 'merge';
      }

      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.patch(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Model(_this._config, response.data.models[0]));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Create a new model version
    * @param {boolean}       sync     If true, this returns after model has completely trained. If false, this immediately returns default api response.
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'train',
    value: function train(sync) {
      var _this2 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSIONS_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.post(url, null, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              if (sync) {
                var timeStart = Date.now();
                _this2._pollTrain.bind(_this2)(timeStart, resolve, reject);
              } else {
                resolve(new Model(_this2._config, response.data.model));
              }
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
  }, {
    key: '_pollTrain',
    value: function _pollTrain(timeStart, resolve, reject) {
      var _this3 = this;

      clearTimeout(this.pollTimeout);
      if (Date.now() - timeStart >= SYNC_TIMEOUT) {
        return reject({
          status: 'Error',
          message: 'Sync call timed out'
        });
      }
      this.getOutputInfo().then(function (model) {
        var modelStatusCode = model.modelVersion.status.code.toString();
        if (modelStatusCode === MODEL_QUEUED_FOR_TRAINING || modelStatusCode === MODEL_TRAINING) {
          _this3.pollTimeout = setTimeout(function () {
            return _this3._pollTrain(timeStart, resolve, reject);
          }, POLLTIME);
        } else {
          resolve(model);
        }
      }, reject).catch(reject);
    }
    /**
    * Returns model ouputs according to inputs
    * @param {object[]|object|string}       inputs    An array of objects/object/string pointing to an image resource. A string can either be a url or base64 image bytes. Object keys explained below:
    *    @param {object}                      inputs[].image     Object with keys explained below:
    *       @param {string}                     inputs[].image.(url|base64)   Can be a publicly accessibly url or base64 string representing image bytes (required)
    *       @param {number[]}                   inputs[].image.crop           An array containing the percent to be cropped from top, left, bottom and right (optional)
    * @param {string}                       language  A string code representing the language to return results in (example: 'zh' for simplified Chinese, 'ru' for Russian, 'ja' for Japanese)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'predict',
    value: function predict(inputs, language) {
      if (checkType(/(Object|String)/, inputs)) {
        inputs = [inputs];
      }
      var url = '' + this._config.apiEndpoint + (this.versionId ? replaceVars(VERSION_PREDICT_PATH, [this.id, this.versionId]) : replaceVars(PREDICT_PATH, [this.id]));
      return wrapToken(this._config, function (headers) {
        var params = { inputs: inputs.map(formatImagePredict) };
        if (language) {
          params['model'] = {
            output_info: {
              output_config: {
                language: language
              }
            }
          };
        }
        return new Promise(function (resolve, reject) {
          axios.post(url, params, { headers: headers }).then(function (response) {
            var data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          }, reject);
        });
      });
    }
    /**
    * Returns a version of the model specified by its id
    * @param {string}     versionId   The model's id
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'getVersion',
    value: function getVersion(versionId) {
      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSION_PATH, [this.id, versionId]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            var data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          }, reject);
        });
      });
    }
    /**
    * Returns a list of versions of the model
    * @param {object}     options     Object with keys explained below: (optional)
    *   @param {number}     options.page        The page number (optional, default: 1)
    *   @param {number}     options.perPage     Number of images to return per page (optional, default: 20)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'getVersions',
    value: function getVersions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { page: 1, perPage: 20 };

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSIONS_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        var data = {
          headers: headers,
          params: { 'per_page': options.perPage, 'page': options.page }
        };
        return new Promise(function (resolve, reject) {
          axios.get(url, data).then(function (response) {
            var data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          }, reject);
        });
      });
    }
    /**
    * Returns all the model's output info
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'getOutputInfo',
    value: function getOutputInfo() {
      var _this4 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_OUTPUT_PATH, [this.id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            resolve(new Model(_this4._config, response.data.model));
          }, reject);
        });
      });
    }
    /**
    * Returns all the model's inputs
    * @param {object}     options     Object with keys explained below: (optional)
    *   @param {number}     options.page        The page number (optional, default: 1)
    *   @param {number}     options.perPage     Number of images to return per page (optional, default: 20)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'getInputs',
    value: function getInputs() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { page: 1, perPage: 20 };

      var url = '' + this._config.apiEndpoint + (this.versionId ? replaceVars(MODEL_VERSION_INPUTS_PATH, [this.id, this.versionId]) : replaceVars(MODEL_INPUTS_PATH, [this.id]));
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, {
            params: { 'per_page': options.perPage, 'page': options.page },
            headers: headers
          }).then(function (response) {
            var data = clone(response.data);
            data.rawData = clone(response.data);
            resolve(data);
          }, reject);
        });
      });
    }
  }]);

  return Model;
}();

;

module.exports = Model;
},{"./constants":8,"./helpers":9,"./utils":11,"axios":12}],7:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var axios = require('axios');
var Promise = require('promise');
var Model = require('./Model');
var Concepts = require('./Concepts');

var _require = require('./constants'),
    API = _require.API,
    ERRORS = _require.ERRORS,
    replaceVars = _require.replaceVars;

var _require2 = require('./helpers'),
    isSuccess = _require2.isSuccess,
    checkType = _require2.checkType,
    clone = _require2.clone;

var _require3 = require('./utils'),
    wrapToken = _require3.wrapToken,
    formatModel = _require3.formatModel;

var MODELS_PATH = API.MODELS_PATH,
    MODEL_PATH = API.MODEL_PATH,
    MODEL_SEARCH_PATH = API.MODEL_SEARCH_PATH,
    MODEL_VERSION_PATH = API.MODEL_VERSION_PATH;

/**
* class representing a collection of models
* @class
*/

var Models = function () {
  function Models(_config) {
    var _this = this;

    var rawData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, Models);

    this._config = _config;
    this.rawData = rawData;
    rawData.forEach(function (modelData, index) {
      _this[index] = new Model(_this._config, modelData);
    });
    this.length = rawData.length;
  }
  /**
  * Returns a Model instance given model id or name. It will call search if name is given.
  * @param {string|object}    model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
  *   @param {string}           model.id          Model id
  *   @param {string}           model.name        Model name
  *   @param {string}           model.version     Model version
  *   @param {string}           model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
  * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
  */


  _createClass(Models, [{
    key: 'initModel',
    value: function initModel(model) {
      var _this2 = this;

      var data = {};
      var fn = void 0;
      if (checkType(/String/, model)) {
        data.id = model;
      } else {
        data = model;
      }
      if (data.id) {
        fn = function fn(resolve, reject) {
          resolve(new Model(_this2._config, data));
        };
      } else {
        fn = function fn(resolve, reject) {
          _this2.search(data.name, data.type).then(function (models) {
            if (data.version) {
              resolve(models.rawData.filter(function (model) {
                return model.modelVersion.id === data.version;
              }));
            } else {
              resolve(models[0]);
            }
          }, reject).catch(reject);
        };
      }
      return new Promise(fn);
    }
    /**
     * Calls predict given model info and inputs to predict on
     * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
     *   @param {string}                   model.id          Model id
     *   @param {string}                   model.name        Model name
     *   @param {string}                   model.version     Model version
     *   @param {string}                   model.language    Model language (only for Clarifai's public models)
     *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
     * @param {object[]|object|string}   inputs    An array of objects/object/string pointing to an image resource. A string can either be a url or base64 image bytes. Object keys explained below:
     *    @param {object}                  inputs[].image     Object with keys explained below:
     *       @param {string}                 inputs[].image.(url|base64)  Can be a publicly accessibly url or base64 string representing image bytes (required)
     * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
     */

  }, {
    key: 'predict',
    value: function predict(model, inputs) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.initModel(model).then(function (modelObj) {
          modelObj.predict(inputs, model.language).then(resolve, reject).catch(reject);
        }, reject);
      });
    }
    /**
     * Calls train on a model and creates a new model version given model info
     * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
     *   @param {string}                   model.id          Model id
     *   @param {string}                   model.name        Model name
     *   @param {string}                   model.version     Model version
     *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
     * @param {boolean}                  sync        If true, this returns after model has completely trained. If false, this immediately returns default api response.
     * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
     */

  }, {
    key: 'train',
    value: function train(model) {
      var _this4 = this;

      var sync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      return new Promise(function (resolve, reject) {
        _this4.initModel(model).then(function (model) {
          model.train(sync).then(resolve, reject).catch(reject);
        }, reject);
      });
    }
    /**
     * Returns a version of the model specified by its id
     * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
     *   @param {string}                   model.id          Model id
     *   @param {string}                   model.name        Model name
     *   @param {string}                   model.version     Model version
     *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
     * @param {string}     versionId   The model's id
     * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
     */

  }, {
    key: 'getVersion',
    value: function getVersion(model, versionId) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.initModel(model).then(function (model) {
          model.getVersion(versionId).then(resolve, reject).catch(reject);
        }, reject);
      });
    }
    /**
    * Returns a list of versions of the model
    * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
    *   @param {string}                   model.id          Model id
    *   @param {string}                   model.name        Model name
    *   @param {string}                   model.version     Model version
    *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
    * @param {object}                   options     Object with keys explained below: (optional)
    *   @param {number}                   options.page        The page number (optional, default: 1)
    *   @param {number}                   options.perPage     Number of images to return per page (optional, default: 20)
    * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
    */

  }, {
    key: 'getVersions',
    value: function getVersions(model) {
      var _this6 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { page: 1, perPage: 20 };

      return new Promise(function (resolve, reject) {
        _this6.initModel(model).then(function (model) {
          model.getVersions().then(resolve, reject).catch(reject);
        }, reject);
      });
    }
    /**
    * Returns all the model's output info
    * @param {string|object}            model       If string, it is assumed to be model id. Otherwise, if object is given, it can have any of the following keys:
    *   @param {string}                   model.id          Model id
    *   @param {string}                   model.name        Model name
    *   @param {string}                   model.version     Model version
    *   @param {string}                   model.type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
    * @return {Promise(Model, error)} A Promise that is fulfilled with a Model instance or rejected with an error
    */

  }, {
    key: 'getOutputInfo',
    value: function getOutputInfo(model) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        _this7.initModel(model).then(function (model) {
          model.getOutputInfo().then(resolve, reject).catch(reject);
        }, reject);
      });
    }
    /**
     * Returns all the models
     * @param {Object}     options     Object with keys explained below: (optional)
     *   @param {Number}     options.page        The page number (optional, default: 1)
     *   @param {Number}     options.perPage     Number of images to return per page (optional, default: 20)
     * @return {Promise(Models, error)} A Promise that is fulfilled with an instance of Models or rejected with an error
     */

  }, {
    key: 'list',
    value: function list() {
      var _this8 = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { page: 1, perPage: 20 };

      var url = '' + this._config.apiEndpoint + MODELS_PATH;
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, {
            params: { 'per_page': options.perPage, 'page': options.page },
            headers: headers
          }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Models(_this8._config, response.data.models));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
     * Create a model
     * @param {string|object}                  model                                  If string, it is assumed to be the model id. Otherwise, if object is given, it can have any of the following keys:
     *   @param {string}                         model.id                               Model id
     *   @param {string}                         model.name                             Model name
     * @param {object[]|string[]|Concepts[]}   conceptsData                           List of objects with ids, concept id strings or an instance of Concepts object
     * @param {Object}                         options                                Object with keys explained below:
     *   @param {boolean}                        options.conceptsMutuallyExclusive      Do you expect to see more than one of the concepts in this model in the SAME image? Set to false (default) if so. Otherwise, set to true.
     *   @param {boolean}                        options.closedEnvironment              Do you expect to run the trained model on images that do not contain ANY of the concepts in the model? Set to false (default) if so. Otherwise, set to true.
     * @return {Promise(Model, error)} A Promise that is fulfilled with an instance of Model or rejected with an error
     */

  }, {
    key: 'create',
    value: function create(model) {
      var _this9 = this;

      var conceptsData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var concepts = conceptsData instanceof Concepts ? conceptsData.toObject('id') : conceptsData.map(function (concept) {
        var val = concept;
        if (checkType(/String/, concept)) {
          val = { 'id': concept };
        }
        return val;
      });
      var modelObj = model;
      if (checkType(/String/, model)) {
        modelObj = { id: model, name: model };
      }
      if (modelObj.id === undefined) {
        throw ERRORS.paramsRequired('Model ID');
      }
      var url = '' + this._config.apiEndpoint + MODELS_PATH;
      var data = { model: modelObj };
      data['model']['output_info'] = {
        'data': {
          concepts: concepts
        },
        'output_config': {
          'concepts_mutually_exclusive': !!options.conceptsMutuallyExclusive,
          'closed_environment': !!options.closedEnvironment
        }
      };

      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.post(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Model(_this9._config, response.data.model));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
     * Returns a model specified by ID
     * @param {String}     id          The model's id
     * @return {Promise(Model, error)} A Promise that is fulfilled with an instance of Model or rejected with an error
     */

  }, {
    key: 'get',
    value: function get(id) {
      var _this10 = this;

      var url = '' + this._config.apiEndpoint + replaceVars(MODEL_PATH, [id]);
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.get(url, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Model(_this10._config, response.data.model));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Update a model's or a list of models' output config or concepts
    * @param {object|object[]}      models                                 Can be a single model object or list of model objects with the following attrs:
    *   @param {string}               models.id                                    The id of the model to apply changes to (Required)
    *   @param {string}               models.name                                  The new name of the model to update with
    *   @param {boolean}              models.conceptsMutuallyExclusive             Do you expect to see more than one of the concepts in this model in the SAME image? Set to false (default) if so. Otherwise, set to true.
    *   @param {boolean}              models.closedEnvironment                     Do you expect to run the trained model on images that do not contain ANY of the concepts in the model? Set to false (default) if so. Otherwise, set to true.
    *   @param {object[]}             models.concepts                              An array of concept objects or string
    *     @param {object|string}        models.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
    *       @param {string}             models.concepts[].concept.id                   The id of the concept to attach to the model
    *   @param {object[]}             models.action                                The action to perform on the given concepts. Possible values are 'merge', 'remove', or 'overwrite'. Default: 'merge'
    * @return {Promise(Models, error)} A Promise that is fulfilled with an instance of Models or rejected with an error
    */

  }, {
    key: 'update',
    value: function update(models) {
      var _this11 = this;

      var url = '' + this._config.apiEndpoint + MODELS_PATH;
      var modelsList = Array.isArray(models) ? models : [models];
      var data = { models: modelsList.map(formatModel) };
      data['action'] = models.action || 'merge';
      return wrapToken(this._config, function (headers) {
        return new Promise(function (resolve, reject) {
          axios.patch(url, data, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Models(_this11._config, response.data.models));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
    /**
    * Update model by merging concepts
    * @param {object|object[]}      model                                 Can be a single model object or list of model objects with the following attrs:
    *   @param {string}               model.id                                    The id of the model to apply changes to (Required)
    *   @param {object[]}             model.concepts                              An array of concept objects or string
    *     @param {object|string}        model.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
    *       @param {string}             model.concepts[].concept.id                   The id of the concept to attach to the model
    */

  }, {
    key: 'mergeConcepts',
    value: function mergeConcepts() {
      var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      model.action = 'merge';
      return this.update(model);
    }
    /**
    * Update model by removing concepts
    * @param {object|object[]}      model                                 Can be a single model object or list of model objects with the following attrs:
    *   @param {string}               model.id                                    The id of the model to apply changes to (Required)
    *   @param {object[]}             model.concepts                              An array of concept objects or string
    *     @param {object|string}        model.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
    *       @param {string}             model.concepts[].concept.id                   The id of the concept to attach to the model
    */

  }, {
    key: 'deleteConcepts',
    value: function deleteConcepts() {
      var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      model.action = 'remove';
      return this.update(model);
    }
    /**
    * Update model by overwriting concepts
    * @param {object|object[]}      model                                 Can be a single model object or list of model objects with the following attrs:
    *   @param {string}               model.id                                    The id of the model to apply changes to (Required)
    *   @param {object[]}             model.concepts                              An array of concept objects or string
    *     @param {object|string}        model.concepts[].concept                    If string is given, this is interpreted as concept id. Otherwise, if object is given, client expects the following attributes
    *       @param {string}             model.concepts[].concept.id                   The id of the concept to attach to the model
    */

  }, {
    key: 'overwriteConcepts',
    value: function overwriteConcepts() {
      var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      model.action = 'overwrite';
      return this.update(model);
    }
    /**
     * Deletes all models (if no ids and versionId given) or a model (if given id) or a model version (if given id and verion id)
     * @param {String|String[]}      ids         Can be a single string or an array of strings representing the model ids
     * @param {String}               versionId   The model's version id
     * @return {Promise(response, error)} A Promise that is fulfilled with the API response or rejected with an error
     */

  }, {
    key: 'delete',
    value: function _delete(ids) {
      var versionId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var request = void 0,
          url = void 0,
          data = void 0;
      var id = ids;

      if (checkType(/String/, ids) || checkType(/Array/, ids) && ids.length === 1) {
        if (versionId) {
          url = '' + this._config.apiEndpoint + replaceVars(MODEL_VERSION_PATH, [id, versionId]);
        } else {
          url = '' + this._config.apiEndpoint + replaceVars(MODEL_PATH, [id]);
        }
        request = wrapToken(this._config, function (headers) {
          return new Promise(function (resolve, reject) {
            axios.delete(url, { headers: headers }).then(function (response) {
              var data = clone(response.data);
              data.rawData = clone(response.data);
              resolve(data);
            }, reject);
          });
        });
      } else {
        if (!ids && !versionId) {
          url = '' + this._config.apiEndpoint + MODELS_PATH;
          data = { 'delete_all': true };
        } else if (!versionId && ids.length > 1) {
          url = '' + this._config.apiEndpoint + MODELS_PATH;
          data = { ids: ids };
        } else {
          throw ERRORS.INVALID_DELETE_ARGS;
        }
        request = wrapToken(this._config, function (headers) {
          return new Promise(function (resolve, reject) {
            axios({
              method: 'delete',
              url: url,
              data: data,
              headers: headers
            }).then(function (response) {
              var data = clone(response.data);
              data.rawData = clone(response.data);
              resolve(data);
            }, reject);
          });
        });
      }

      return request;
    }
    /**
     * Search for models by name or type
    * @param {String}     name        The model name
    * @param {String}     type        This can be "concept", "color", "embed", "facedetect", "cluster" or "blur"
    * @return {Promise(models, error)} A Promise that is fulfilled with an instance of Models or rejected with an error
    */

  }, {
    key: 'search',
    value: function search(name) {
      var _this12 = this;

      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var url = '' + this._config.apiEndpoint + MODEL_SEARCH_PATH;
      return wrapToken(this._config, function (headers) {
        var params = {
          'model_query': {
            name: name,
            type: type
          }
        };
        return new Promise(function (resolve, reject) {
          axios.post(url, params, { headers: headers }).then(function (response) {
            if (isSuccess(response)) {
              resolve(new Models(_this12._config, response.data.models));
            } else {
              reject(response);
            }
          }, reject);
        });
      });
    }
  }]);

  return Models;
}();

;

module.exports = Models;
},{"./Concepts":3,"./Model":6,"./constants":8,"./helpers":9,"./utils":11,"axios":12,"promise":30}],8:[function(require,module,exports){
'use strict';

var MAX_BATCH_SIZE = 128;
var GEO_LIMIT_TYPES = ['withinMiles', 'withinKilometers', 'withinRadians', 'withinDegrees'];
var URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
var SYNC_TIMEOUT = 60000;
var MODEL_QUEUED_FOR_TRAINING = '21103';
var MODEL_TRAINING = '21101';
var POLLTIME = 2000;

module.exports = {
  API: {
    TOKEN_PATH: '/v2/token',
    MODELS_PATH: '/v2/models',
    MODEL_PATH: '/v2/models/$0',
    MODEL_VERSIONS_PATH: '/v2/models/$0/versions',
    MODEL_VERSION_PATH: '/v2/models/$0/versions/$1',
    MODEL_PATCH_PATH: '/v2/models/$0/output_info/data/concepts',
    MODEL_OUTPUT_PATH: '/v2/models/$0/output_info',
    MODEL_SEARCH_PATH: '/v2/models/searches',
    PREDICT_PATH: '/v2/models/$0/outputs',
    VERSION_PREDICT_PATH: '/v2/models/$0/versions/$1/outputs',
    CONCEPTS_PATH: '/v2/concepts',
    CONCEPT_PATH: '/v2/concepts/$0',
    CONCEPT_SEARCH_PATH: '/v2/concepts/searches',
    MODEL_INPUTS_PATH: '/v2/models/$0/inputs',
    MODEL_VERSION_INPUTS_PATH: '/v2/models/$0/versions/$1/inputs',
    INPUTS_PATH: '/v2/inputs',
    INPUT_PATH: '/v2/inputs/$0',
    INPUTS_STATUS_PATH: '/v2/inputs/status',
    SEARCH_PATH: '/v2/searches'
  },
  ERRORS: {
    paramsRequired: function paramsRequired(param) {
      var paramList = Array.isArray(param) ? param : [param];
      return new Error('The following ' + (paramList.length > 1 ? 'params are' : 'param is') + ' required: ' + paramList.join(', '));
    },
    MAX_INPUTS: new Error('Number of inputs passed exceeded max of ' + MAX_BATCH_SIZE),
    INVALID_GEOLIMIT_TYPE: new Error('Incorrect geo_limit type. Value must be any of the following: ' + GEO_LIMIT_TYPES.join(', ')),
    INVALID_DELETE_ARGS: new Error('Wrong arguments passed. You can only delete all models (provide no arguments), delete select models (provide list of ids),\n    delete a single model (providing a single id) or delete a model version (provide a single id and version id)')
  },
  STATUS: {
    MODEL_QUEUED_FOR_TRAINING: MODEL_QUEUED_FOR_TRAINING,
    MODEL_TRAINING: MODEL_TRAINING
  },
  // var replacement must be given in order
  replaceVars: function replaceVars(path) {
    var vars = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var newPath = path;
    vars.forEach(function (val, index) {
      if (index === 0) {
        val = encodeURIComponent(val);
      }
      newPath = newPath.replace(new RegExp('\\$' + index, 'g'), val);
    });
    return newPath;
  },
  GEO_LIMIT_TYPES: GEO_LIMIT_TYPES,
  MAX_BATCH_SIZE: MAX_BATCH_SIZE,
  URL_REGEX: URL_REGEX,
  SYNC_TIMEOUT: SYNC_TIMEOUT,
  POLLTIME: POLLTIME
};
},{}],9:[function(require,module,exports){
'use strict';

var SUCCESS_CODES = [200, 201];

module.exports = {
  isSuccess: function isSuccess(response) {
    return SUCCESS_CODES.indexOf(response.status) > -1;
  },
  deleteEmpty: function deleteEmpty(obj) {
    var strict = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    Object.keys(obj).forEach(function (key) {
      if (obj[key] === null || obj[key] === undefined || strict === true && (obj[key] === '' || obj[key].length === 0 || Object.keys(obj[key]).length === 0)) {
        delete obj[key];
      }
    });
  },
  clone: function clone(obj) {
    var keys = Object.keys(obj);
    var copy = {};
    keys.forEach(function (k) {
      copy[k] = obj[k];
    });
    return copy;
  },
  checkType: function checkType(regex, val) {
    if (regex instanceof RegExp === false) {
      regex = new RegExp(regex);
    }
    return regex.test(Object.prototype.toString.call(val));
  }
};
},{}],10:[function(require,module,exports){
(function (global){
'use strict';

var App = require('./App');

var _require = require('./../package.json'),
    version = _require.version;

module.exports = global.Clarifai = {
  version: version,
  App: App,
  GENERAL_MODEL: 'aaa03c23b3724a16a56b629203edc62c',
  FOOD_MODEL: 'bd367be194cf45149e75f01d59f77ba7',
  TRAVEL_MODEL: 'eee28c313d69466f836ab83287a54ed9',
  NSFW_MODEL: 'e9576d86d2004ed1a38ba0cf39ecb4b1',
  WEDDINGS_MODEL: 'c386b7a870114f4a87477c0824499348',
  WEDDING_MODEL: 'c386b7a870114f4a87477c0824499348',
  COLOR_MODEL: 'eeed0b6733a644cea07cf4c60f87ebb7',
  CLUSTER_MODEL: 'cccbe437d6e54e2bb911c6aa292fb072',
  FACE_DETECT_MODEL: 'a403429f2ddf4b49b307e318f00e528b',
  FOCUS_MODEL: 'c2cf7cecd8a6427da375b9f35fcd2381',
  LOGO_MODEL: 'c443119bf2ed4da98487520d01a0b1e3',
  DEMOGRAPHICS_MODEL: 'c0c0ac362b03416da06ab3fa36fb58e3',
  GENERAL_EMBED_MODEL: 'bbb5f41425b8468d9b7a554ff10f8581',
  FACE_EMBED_MODEL: 'd02b4508df58432fbb84e800597b8959'
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../package.json":40,"./App":1}],11:[function(require,module,exports){
'use strict';

var Promise = require('promise');

var _require = require('./constants'),
    URL_REGEX = _require.URL_REGEX,
    GEO_LIMIT_TYPES = _require.GEO_LIMIT_TYPES,
    ERRORS = _require.ERRORS;

var _require2 = require('./helpers'),
    checkType = _require2.checkType,
    clone = _require2.clone;

var _require3 = require('./../package.json'),
    VERSION = _require3.version;

module.exports = {
  wrapToken: function wrapToken(_config, requestFn) {
    return new Promise(function (resolve, reject) {
      _config.token().then(function (token) {
        var headers = {
          Authorization: 'Bearer ' + token.accessToken,
          'X-Clarifai-Client': 'js:' + VERSION
        };
        requestFn(headers).then(resolve, reject);
      }, reject);
    });
  },
  formatModel: function formatModel() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var formatted = {};
    if (data.id === null || data.id === undefined) {
      throw ERRORS.paramsRequired('Model ID');
    }
    formatted.id = data.id;
    if (data.name) {
      formatted.name = data.name;
    }
    formatted.output_info = {};
    if (data.conceptsMutuallyExclusive !== undefined) {
      formatted.output_info.output_config = formatted.output_info.output_config || {};
      formatted.output_info.output_config.concepts_mutually_exclusive = !!data.conceptsMutuallyExclusive;
    }
    if (data.closedEnvironment !== undefined) {
      formatted.output_info.output_config = formatted.output_info.output_config || {};
      formatted.output_info.output_config.closed_environment = !!data.closedEnvironment;
    }
    if (data.concepts) {
      formatted.output_info.data = {
        concepts: data.concepts.map(module.exports.formatConcept)
      };
    }
    return formatted;
  },
  formatInput: function formatInput(data, includeImage) {
    var input = checkType(/String/, data) ? { url: data } : data;
    var formatted = {
      id: input.id || null,
      data: {}
    };
    if (input.concepts) {
      formatted.data.concepts = input.concepts;
    }
    if (input.metadata) {
      formatted.data.metadata = input.metadata;
    }
    if (input.geo) {
      formatted.data.geo = { geo_point: input.geo };
    }
    if (includeImage !== false) {
      formatted.data.image = {
        url: input.url,
        base64: input.base64,
        crop: input.crop
      };
      if (data.allowDuplicateUrl) {
        formatted.data.image.allow_duplicate_url = true;
      }
    }
    return formatted;
  },
  formatImagePredict: function formatImagePredict(data) {
    var image = data;
    if (checkType(/String/, data)) {
      if (URL_REGEX.test(image) === true) {
        image = {
          url: data
        };
      } else {
        image = {
          base64: data
        };
      }
    }
    return {
      data: {
        image: image
      }
    };
  },
  formatImagesSearch: function formatImagesSearch(image) {
    var imageQuery = void 0;
    var input = { 'input': { 'data': {} } };
    var formatted = [];
    if (checkType(/String/, image)) {
      imageQuery = { 'url': image };
    } else {
      imageQuery = image.url || image.base64 ? {
        image: {
          url: image.url,
          base64: image.base64,
          crop: image.crop
        }
      } : {};
    }

    input.input.data = imageQuery;
    if (image.id) {
      input.input.id = image.id;
    }
    if (image.metadata !== undefined) {
      input.input.data.metadata = image.metadata;
    }
    if (image.geo !== undefined) {
      if (checkType(/Array/, image.geo)) {
        input.input.data.geo = {
          geo_box: image.geo.map(function (p) {
            return { geo_point: p };
          })
        };
      } else if (checkType(/Object/, image.geo)) {
        if (GEO_LIMIT_TYPES.indexOf(image.geo.type) === -1) {
          throw ERRORS.INVALID_GEOLIMIT_TYPE;
        }
        input.input.data.geo = {
          geo_point: {
            latitude: image.geo.latitude,
            longitude: image.geo.longitude
          },
          geo_limit: {
            type: image.geo.type,
            value: image.geo.value
          }
        };
      }
    }
    if (image.type !== 'input' && input.input.data.image) {
      if (input.input.data.metadata || input.input.data.geo) {
        var dataCopy = { input: { data: clone(input.input.data) } };
        var imageCopy = { input: { data: clone(input.input.data) } };
        delete dataCopy.input.data.image;
        delete imageCopy.input.data.metadata;
        delete imageCopy.input.data.geo;
        input = [{ output: imageCopy }, dataCopy];
      } else {
        input = [{ output: input }];
      }
    }
    formatted = formatted.concat(input);
    return formatted;
  },
  formatConcept: function formatConcept(concept) {
    var formatted = concept;
    if (checkType(/String/, concept)) {
      formatted = {
        id: concept
      };
    }
    return formatted;
  },
  formatConceptsSearch: function formatConceptsSearch(query) {
    if (checkType(/String/, query)) {
      query = { id: query };
    }
    var v = {};
    var type = query.type === 'input' ? 'input' : 'output';
    delete query.type;
    v[type] = {
      data: {
        concepts: [query]
      }
    };
    return v;
  }
};
},{"./../package.json":40,"./constants":8,"./helpers":9,"promise":30}],12:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":14}],13:[function(require,module,exports){
(function (process){
'use strict';

var utils = require('./../utils');
var buildURL = require('./../helpers/buildURL');
var parseHeaders = require('./../helpers/parseHeaders');
var transformData = require('./../helpers/transformData');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var btoa = (typeof window !== 'undefined' && window.btoa) || require('./../helpers/btoa');
var settle = require('../helpers/settle');

module.exports = function xhrAdapter(resolve, reject, config) {
  var requestData = config.data;
  var requestHeaders = config.headers;

  if (utils.isFormData(requestData)) {
    delete requestHeaders['Content-Type']; // Let the browser set it
  }

  var request = new XMLHttpRequest();
  var loadEvent = 'onreadystatechange';
  var xDomain = false;

  // For IE 8/9 CORS support
  // Only supports POST and GET calls and doesn't returns the response headers.
  // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
  if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined' && window.XDomainRequest && !('withCredentials' in request) && !isURLSameOrigin(config.url)) {
    request = new window.XDomainRequest();
    loadEvent = 'onload';
    xDomain = true;
    request.onprogress = function handleProgress() {};
    request.ontimeout = function handleTimeout() {};
  }

  // HTTP basic authentication
  if (config.auth) {
    var username = config.auth.username || '';
    var password = config.auth.password || '';
    requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
  }

  request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

  // Set the request timeout in MS
  request.timeout = config.timeout;

  // Listen for ready state
  request[loadEvent] = function handleLoad() {
    if (!request || (request.readyState !== 4 && !xDomain)) {
      return;
    }

    // The request errored out and we didn't get a response, this will be
    // handled by onerror instead
    if (request.status === 0) {
      return;
    }

    // Prepare the response
    var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
    var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
    var response = {
      data: transformData(
        responseData,
        responseHeaders,
        config.transformResponse
      ),
      // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
      status: request.status === 1223 ? 204 : request.status,
      statusText: request.status === 1223 ? 'No Content' : request.statusText,
      headers: responseHeaders,
      config: config,
      request: request
    };

    settle(resolve, reject, response);

    // Clean up request
    request = null;
  };

  // Handle low level network errors
  request.onerror = function handleError() {
    // Real errors are hidden from us by the browser
    // onerror should only fire if it's a network error
    reject(new Error('Network Error'));

    // Clean up request
    request = null;
  };

  // Handle timeout
  request.ontimeout = function handleTimeout() {
    var err = new Error('timeout of ' + config.timeout + 'ms exceeded');
    err.timeout = config.timeout;
    err.code = 'ECONNABORTED';
    reject(err);

    // Clean up request
    request = null;
  };

  // Add xsrf header
  // This is only done if running in a standard browser environment.
  // Specifically not if we're in a web worker, or react-native.
  if (utils.isStandardBrowserEnv()) {
    var cookies = require('./../helpers/cookies');

    // Add xsrf header
    var xsrfValue = config.withCredentials || isURLSameOrigin(config.url) ?
        cookies.read(config.xsrfCookieName) :
        undefined;

    if (xsrfValue) {
      requestHeaders[config.xsrfHeaderName] = xsrfValue;
    }
  }

  // Add headers to the request
  if ('setRequestHeader' in request) {
    utils.forEach(requestHeaders, function setRequestHeader(val, key) {
      if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
        // Remove Content-Type if data is undefined
        delete requestHeaders[key];
      } else {
        // Otherwise add header to the request
        request.setRequestHeader(key, val);
      }
    });
  }

  // Add withCredentials to request if needed
  if (config.withCredentials) {
    request.withCredentials = true;
  }

  // Add responseType to request if needed
  if (config.responseType) {
    try {
      request.responseType = config.responseType;
    } catch (e) {
      if (request.responseType !== 'json') {
        throw e;
      }
    }
  }

  // Handle progress if needed
  if (config.progress) {
    if (config.method === 'post' || config.method === 'put') {
      request.upload.addEventListener('progress', config.progress);
    } else if (config.method === 'get') {
      request.addEventListener('progress', config.progress);
    }
  }

  if (requestData === undefined) {
    requestData = null;
  }

  // Send the request
  request.send(requestData);
};

}).call(this,require('_process'))
},{"../helpers/settle":26,"./../helpers/btoa":19,"./../helpers/buildURL":20,"./../helpers/cookies":22,"./../helpers/isURLSameOrigin":24,"./../helpers/parseHeaders":25,"./../helpers/transformData":28,"./../utils":29,"_process":42}],14:[function(require,module,exports){
'use strict';

var defaults = require('./defaults');
var utils = require('./utils');
var dispatchRequest = require('./core/dispatchRequest');
var InterceptorManager = require('./core/InterceptorManager');
var isAbsoluteURL = require('./helpers/isAbsoluteURL');
var combineURLs = require('./helpers/combineURLs');
var bind = require('./helpers/bind');
var transformData = require('./helpers/transformData');

function Axios(defaultConfig) {
  this.defaults = utils.merge({}, defaultConfig);
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Don't allow overriding defaults.withCredentials
  config.withCredentials = config.withCredentials || this.defaults.withCredentials;

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

var defaultInstance = new Axios(defaults);
var axios = module.exports = bind(Axios.prototype.request, defaultInstance);
module.exports.Axios = Axios;

// Expose properties from defaultInstance
axios.defaults = defaultInstance.defaults;
axios.interceptors = defaultInstance.interceptors;

// Factory for creating new instances
axios.create = function create(defaultConfig) {
  return new Axios(defaultConfig);
};

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
  axios[method] = bind(Axios.prototype[method], defaultInstance);
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
  axios[method] = bind(Axios.prototype[method], defaultInstance);
});

},{"./core/InterceptorManager":15,"./core/dispatchRequest":16,"./defaults":17,"./helpers/bind":18,"./helpers/combineURLs":21,"./helpers/isAbsoluteURL":23,"./helpers/spread":27,"./helpers/transformData":28,"./utils":29}],15:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":29}],16:[function(require,module,exports){
(function (process){
'use strict';

/**
 * Dispatch a request to the server using whichever adapter
 * is supported by the current environment.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  return new Promise(function executor(resolve, reject) {
    try {
      var adapter;

      if (typeof config.adapter === 'function') {
        // For custom adapter support
        adapter = config.adapter;
      } else if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = require('../adapters/xhr');
      } else if (typeof process !== 'undefined') {
        // For node use HTTP adapter
        adapter = require('../adapters/http');
      }

      if (typeof adapter === 'function') {
        adapter(resolve, reject, config);
      }
    } catch (e) {
      reject(e);
    }
  });
};


}).call(this,require('_process'))
},{"../adapters/http":13,"../adapters/xhr":13,"_process":42}],17:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var PROTECTION_PREFIX = /^\)\]\}',?\n/;
var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

module.exports = {
  transformRequest: [function transformRequest(data, headers) {
    if (utils.isFormData(data) || utils.isArrayBuffer(data) || utils.isStream(data)) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isObject(data) && !utils.isFile(data) && !utils.isBlob(data)) {
      // Set application/json if no Content-Type has been specified
      if (!utils.isUndefined(headers)) {
        utils.forEach(headers, function processContentTypeHeader(val, key) {
          if (key.toLowerCase() === 'content-type') {
            headers['Content-Type'] = val;
          }
        });

        if (utils.isUndefined(headers['Content-Type'])) {
          headers['Content-Type'] = 'application/json;charset=utf-8';
        }
      }
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      data = data.replace(PROTECTION_PREFIX, '');
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    },
    patch: utils.merge(DEFAULT_CONTENT_TYPE),
    post: utils.merge(DEFAULT_CONTENT_TYPE),
    put: utils.merge(DEFAULT_CONTENT_TYPE)
  },

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

},{"./utils":29}],18:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],19:[function(require,module,exports){
'use strict';

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

module.exports = btoa;

},{}],20:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


},{"./../utils":29}],21:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '');
};

},{}],22:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

},{"./../utils":29}],23:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

},{}],24:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

},{"./../utils":29}],25:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

},{"./../utils":29}],26:[function(require,module,exports){
'use strict';

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(response);
  }
};

},{}],27:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],28:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

},{"./../utils":29}],29:[function(require,module,exports){
'use strict';

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  typeof document.createElement -> undefined
 */
function isStandardBrowserEnv() {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof document.createElement === 'function'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  trim: trim
};

},{}],30:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":35}],31:[function(require,module,exports){
'use strict';

var asap = require('asap/raw');

function noop() {}

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;

function Promise(fn) {
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('not a function');
  }
  this._45 = 0;
  this._81 = 0;
  this._65 = null;
  this._54 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._10 = null;
Promise._97 = null;
Promise._61 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
};
function handle(self, deferred) {
  while (self._81 === 3) {
    self = self._65;
  }
  if (Promise._10) {
    Promise._10(self);
  }
  if (self._81 === 0) {
    if (self._45 === 0) {
      self._45 = 1;
      self._54 = deferred;
      return;
    }
    if (self._45 === 1) {
      self._45 = 2;
      self._54 = [self._54, deferred];
      return;
    }
    self._54.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._81 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._81 === 1) {
        resolve(deferred.promise, self._65);
      } else {
        reject(deferred.promise, self._65);
      }
      return;
    }
    var ret = tryCallOne(cb, self._65);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._81 = 3;
      self._65 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._81 = 1;
  self._65 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._81 = 2;
  self._65 = newValue;
  if (Promise._97) {
    Promise._97(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._45 === 1) {
    handle(self, self._54);
    self._54 = null;
  }
  if (self._45 === 2) {
    for (var i = 0; i < self._54.length; i++) {
      handle(self, self._54[i]);
    }
    self._54 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  })
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

},{"asap/raw":39}],32:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"./core.js":31}],33:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js');

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._61);
  p._81 = 1;
  p._65 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._81 === 3) {
            val = val._65;
          }
          if (val._81 === 1) return res(i, val._65);
          if (val._81 === 2) reject(val._65);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"./core.js":31}],34:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"./core.js":31}],35:[function(require,module,exports){
'use strict';

module.exports = require('./core.js');
require('./done.js');
require('./finally.js');
require('./es6-extensions.js');
require('./node-extensions.js');
require('./synchronous.js');

},{"./core.js":31,"./done.js":32,"./es6-extensions.js":33,"./finally.js":34,"./node-extensions.js":36,"./synchronous.js":37}],36:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require('./core.js');
var asap = require('asap');

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
}

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
}

},{"./core.js":31,"asap":38}],37:[function(require,module,exports){
'use strict';

var Promise = require('./core.js');

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._81 === 3) {
      return this._65.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._65;
  };

  Promise.prototype.getReason = function () {
    if (this._81 === 3) {
      return this._65.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._65;
  };

  Promise.prototype.getState = function () {
    if (this._81 === 3) {
      return this._65.getState();
    }
    if (this._81 === -1 || this._81 === -2) {
      return 0;
    }

    return this._81;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};

},{"./core.js":31}],38:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":39}],39:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.

/* globals self */
var scope = typeof global !== "undefined" ? global : self;
var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
module.exports={
  "name": "clarifai",
  "version": "2.1.5",
  "description": "Official Clarifai Javascript SDK",
  "main": "dist/index.js",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Clarifai/clarifai-javascript.git"
  },
  "author": {
    "name": "Clarifai Inc."
  },
  "license": "Apache-2.0",
  "scripts": {
    "jsdoc": "jsdoc src/* -t node_modules/minami -d docs/$npm_package_version && jsdoc src/* -t node_modules/minami -d docs/latest"
  },
  "dependencies": {
    "axios": "0.11.1",
    "form-data": "0.2.0",
    "promise": "7.1.1"
  },
  "devDependencies": {
    "babel-eslint": "^6.1.2",
    "babel-preset-es2015": "^6.14.0",
    "babel-register": "^6.14.0",
    "babelify": "^7.3.0",
    "del": "2.0.2",
    "envify": "3.4.0",
    "git-branch": "0.3.0",
    "gulp": "3.9.0",
    "gulp-awspublish": "3.0.1",
    "gulp-babel": "^6.1.2",
    "gulp-browserify": "0.5.1",
    "gulp-concat": "2.6.0",
    "gulp-eslint": "2.0.0",
    "gulp-if": "2.0.0",
    "gulp-insert": "0.5.0",
    "gulp-jasmine": "^2.2.1",
    "gulp-notify": "2.2.0",
    "gulp-rename": "1.2.2",
    "gulp-replace-task": "0.11.0",
    "gulp-uglify": "1.4.1",
    "gulp-util": "3.0.6",
    "jsdoc": "^3.4.1",
    "minami": "^1.1.1",
    "require-dir": "0.3.0",
    "serve-static": "1.10.0"
  },
  "gitHead": "fc20324a380fd183134c72c2e223237d50338d31",
  "bugs": {
    "url": "https://github.com/Clarifai/clarifai-javascript/issues"
  },
  "homepage": "https://github.com/Clarifai/clarifai-javascript#readme",
  "_id": "clarifai@2.1.5",
  "_shasum": "bc0f88542842b8cc55aff0c752f0f3997e0e2964",
  "_from": "clarifai@latest",
  "_npmVersion": "4.2.0",
  "_nodeVersion": "7.5.0",
  "_npmUser": {
    "name": "clarifai-jade",
    "email": "jade@clarifai.com"
  },
  "dist": {
    "shasum": "bc0f88542842b8cc55aff0c752f0f3997e0e2964",
    "tarball": "https://registry.npmjs.org/clarifai/-/clarifai-2.1.5.tgz"
  },
  "maintainers": [
    {
      "name": "clarifai-jade",
      "email": "jade@clarifai.com"
    },
    {
      "name": "dankantor-clarifai",
      "email": "dankantor@clarifai.com"
    }
  ],
  "_npmOperationalInternal": {
    "host": "packages-12-west.internal.npmjs.com",
    "tmp": "tmp/clarifai-2.1.5.tgz_1491344166566_0.17256766790524125"
  },
  "directories": {},
  "_resolved": "https://registry.npmjs.org/clarifai/-/clarifai-2.1.5.tgz"
}

},{}],41:[function(require,module,exports){
var Clarifai = require('clarifai');

var cstmMarker = "src/img/marker.png";

// Expiring access token => replace if unauthorized
var authToken = 'v^1.1#i^1#r^0#I^3#f^0#p^1#t^H4sIAAAAAAAAAOVXe2wURRjvtb2aBlCjBMvD9LqgjeLuzeztPXbDXXK0EBoprVx5tOXh3u5su3Rv99yZsz0NsSkJvkMQgybFUAWhKCoS66sJIQoR9Q/BRIyRRPhDJQiJUYIYAzq7d5RrJTyLkHj/XOabb775/X7f983sgO6y8vtXz1n9xzjPLcV93aC72OOBY0B5mXf6rSXFk7xFoMDB09c9rbu0p+ToDCynjLQ0H+G0ZWLk60oZJpZcY5TJ2KZkyVjHkimnEJaIIiXi9XMlngNS2raIpVgG46urjTIC5NVIJABQUozIPNSo1TwXs8mKMqIaEYKiygdCfDgS0RQ6j3EG1ZmYyCaJMjyAYRYILA+beCAJogRELhAMtjC+hcjGumVSFw4wMReu5K61C7BeHKqMMbIJDcLE6uKzEw3xutpZ85pm+AtixfI6JIhMMnj4qMZSkW+hbGTQxbfBrreUyCgKwpjxx3I7DA8qxc+BuQr4rtSRsBoMA0BlFkRFSY6OlLMtOyWTi+NwLLrKaq6rhEyik+ylFKVqJFcgheRH82iIulqf8/dQRjZ0TUd2lJk1M94cb2xkYnNkLJsNj8lso60rlJHKNs6vZREQoQADEcgm1VBYFORgfqNctLzMI3aqsUxVd0TDvnkWmYkoajRSm0CBNtSpwWyw4xpxEBX68ec0FEItTlJzWcyQdtPJK0pRIXzu8NIZGFpNiK0nMwQNRRg54UoUZeR0WleZkZNuLebLpwtHmXZC0pLf39nZyXUGOMtu8/MAQP/i+rkJpR2lZIb6Or2e89cvvYDVXSoKoiuxLpFsmmLporVKAZhtTIwXoBgK5HUfDis20vovQwFn//COGK0O0UQeJiEMIAhDkWRIHI0OieWL1O/gQEk5y6ZkuwORtCEriFVonWVSyNZVKRDU+EBEQ6waEjVWEDWNTQbVEAs1hABCyaQiRv5PjXK5pZ5QrDRqtAxdyY5KwY9asQdstVG2STaBDIMaLrfqL0gSOySvOz2n16+IohMD0yByWuec2uYUK+W3ZHqoOablLupr4q3T+/CmSiolmGOqq7mLjHPpcvhRhbMRtjI2vcO5Budcb7I6kEm7hNiWYSB7IbwmJUbvRL9Bp/kFWSmGTmVcfrMxu8Jj8iprWyY3kHVpj6f1AsyhIPIREA4L4jVxq3Hz2pT9Dw6tK0ushQlSr8MHiH/4cyhW5P5gj2cA9HjepS8q4Af3wKmgqqxkQWnJ2ElYJ4jTZY3DeptJv/JtxHWgbFrW7eIyT+uUHduWFzzA+paCiqEnWHkJHFPwHgNTzs944W13jYNhIPCQB4IIxBYw9fxsKZxQOv7o87/U/z7ArJ+08a2v132R7f9+1xOtYNyQk8fjLaKVUbQyVrk7ddjY/srhLbv3vbjk6E9dp0+UL9q64rmiD894FlVs6524taby9XWnjjxzoOZkhbV9C/+B9HPv2ul3L9s/+ODTvgnf/shM5ufs2Vbcsz3xt/oC2UJOrlEmqsHNZ2oX3ztl896q2vU7SWLZ503ex++z2Gf9s2dVfnWw/eS0E8eVlQf7j1Xc/tE3b09e0fpDeN2xTUzHJ0vCK0/1V1sdAy+rJemJa3btOzD2s0NLq7qbq8uaD/UeeSRENrRtWPrqAzsOaGc/nVHxZvNff7Y/ueol79kx/XcMSGAwUb13cN93FWXjoSe06rUJ74f2bKp6w7vg1K8bd55OBisf/vj4+Ln7d+4S3llzp/TeU52/fZlL3z9lFOv/Gg8AAA==';
var map = null;
var infoWindow;
var searchVal;
var obj = [];
var jsonLocation = [];

var app = new Clarifai.App(
    'MSvYSyN_ItFs5xu52i6XWgyny7gz2k2wvQYZWdoL',
    '-cjD0Rf4AB40DLuZ2mrIb9htyIK-UK4s7SkVVxOO'
);

console.log ("Starting...");

// AJAX calls

$(document).ready(function() {
    $('#txt_btn').on('click', function() {
        var searchVal = $('#txt_name').val();
        var $btn = $(this).button('loading');
        // business logic...
        $btn.button('reset');

        app.models.predict("e0be3b9d6a454f0493ac3a30784001ff", searchVal).then(
            function(response) {
                var obj = response.outputs[0].data.concepts[0].name;
                if (obj == "no person") {
                    obj = "product"
                    console.log(obj);
                }

                //var rand = obj[Math.floor(Math.random() * obj.length)];

                console.log(response.outputs[0].input.data.image.url);
                objects(obj);
            },
            function(err) {
                console.error(err);
                var unAuth = "<b>Bad Request!</b> Please fill in an image url...";
                var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                errorMessage.appendTo('.error');
            }
        );
        function objects(obj){
            $.ajax({
                url: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=' + obj + '&limit=10&offset=100&filter=itemLocationCountry:NL&filter=condition:USED',
                type: 'GET',
                dataType: 'JSON',
                headers: { 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer '+ authToken
                },
                statusCode: {
                  400:function() { 
                    var unAuth = "<b>Bad Request!</b> Please fill in an image url!.";
                    var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                        errorMessage.appendTo('.error');
                  },
                  401:function() { 
                    var unAuth = "<b>Oh snap!</b> You are unauthorized, please refresh your token.";
                    var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                        errorMessage.appendTo('.error');
                  },
                  500:function() { 
                    var unAuth = "<b>Oh snap!</b> Internal Server Error.";
                    var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                        errorMessage.appendTo('.error');
                  }
                },
                success: function(data) {
                    console.log('object name: ' + obj);
                    var json = $.parseJSON(JSON.stringify(data));        
                    console.log(json);

                    var mapId = $('<div id="map"></div>');
                    mapId.appendTo('.maps');

                    $('#txt_btn').css('background-color','#09A854');
                    $("#txt_btn").text('Success');

                    function disable(i){
                        $("#txt_btn"+i).prop("disabled",true);
                    }

                    $.each(json.itemSummaries, function(j, index) {
                        
                        jsonLocation = [ 
                            json.itemSummaries[j].itemLocation.postalCode,
                            json.itemSummaries[j].title,
                            json.itemSummaries[j].seller.username,
                            json.itemSummaries[j].price.value,
                            json.itemSummaries[j].image.imageUrl,
                            json.itemSummaries[j].itemWebUrl
                        ]

                    });

                        console.log(jsonLocation);

                        var priceVar = jsonLocation[3];
                        console.log("price: " + priceVar);

                        $.ajax({
                            url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+ jsonLocation[0] +'&key=AIzaSyBUg2DfJLopuzyKbLXhjc7V_DqYkpzQjEk',
                            type: 'GET',
                            dataType: 'JSON',
                            success: function(data) {
                                var json= $.parseJSON(JSON.stringify(data));
                                console.log(jsonLocation);

                                $('<div/>',{
                                    'id': 'info'
                                }).appendTo('#info_box');

                                var boxTitle = $('<h1 class="boxTitle">Your match</h1>');
                                boxTitle.appendTo('#info');

                                var title = $('<h4 class="advheader">'+ jsonLocation[1] +'</h4>');
                                title.appendTo('#info');

                                var seller = $('<p class="advseller"> <b>Seller:</b> <br> '+ jsonLocation[2] +'</p>');
                                seller.appendTo('#info');

                                var price = $('<p class="advprice"> <b>Price:</b> <br> €'+ jsonLocation[3] +'</p>');
                                price.appendTo('#info');

                                var loc = $('<p class="advloc"> <b>Location:</b> <br> '+ json.results[0].formatted_address +'</p>');
                                loc.appendTo('#info');

                                var img = $('<img class="advimg">'); //Equivalent: $(document.createElement('img'))
                                img.attr('src', jsonLocation[4]);
                                img.appendTo('#info');

                                var button = $('<a class="advbtn btn btn-primary" href="'+ jsonLocation[5] +'" role="button">Contact directly</a>');
                                button.appendTo('#info_box');

                                console.log(jsonLocation[0]);

                                 if (jsonLocation[0] == null) {
                                    jsonLocation[0] == "3144LE";
                                    console.log("No location found, using default location")
                                }
                                
                                var coords = [
                                json.results[0].geometry.location.lat,
                                json.results[0].geometry.location.lng
                                ];

                                initMap(coords, jsonLocation, json);
                                createMakers(coords, map);
                                console.log("coords: " + coords);

                                function initMap(coords, jsonLocation, json) {

                                  var latlng = new google.maps.LatLng(coords[0], coords[1]);
                                  console.log("latlng: " + latlng);
                                  
                                    map = new google.maps.Map(document.getElementById('map'), {
                                    zoom: 8,
                                    center: latlng, /* COORDS VAR */
                                    draggable: true, 
                                    zoomControl: false, 
                                    scrollwheel: false, 
                                    disableDoubleClickZoom: true,
                                    styles: [
                                              {
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#242f3e"
                                                  }
                                                ]
                                              },
                                              {
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#746855"
                                                  }
                                                ]
                                              },
                                              {
                                                "elementType": "labels.text.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#242f3e"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "administrative.locality",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#d59563"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "poi",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#d59563"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "poi.park",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#263c3f"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "poi.park",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#6b9a76"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#38414e"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road",
                                                "elementType": "geometry.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#212a37"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#9ca5b3"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road.highway",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#746855"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road.highway",
                                                "elementType": "geometry.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#1f2835"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road.highway",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#f3d19c"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "transit",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#2f3948"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "transit.station",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#d59563"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "water",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#17263c"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "water",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#515c6d"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "water",
                                                "elementType": "labels.text.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#17263c"
                                                  }
                                                ]
                                              }
                                            ]
                                    });

                                    infoWindow = new google.maps.InfoWindow;

                                    if (navigator.geolocation) {
                                      navigator.geolocation.getCurrentPosition(function(position) {
                                        var pos = {
                                          lat: position.coords.latitude,
                                          lng: position.coords.longitude
                                        };

                                        infoWindow.setPosition(pos);
                                        infoWindow.setContent('You are here');
                                        infoWindow.open(map);
                                        map.setCenter(pos);
                                      }, function() {
                                        handleLocationError(true, infoWindow, map.getCenter());
                                      });
                                    } else {
                                      // Browser doesn't support Geolocation
                                      handleLocationError(false, infoWindow, map.getCenter());
                                    }

                                };

                                    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                                        infoWindow.setPosition(pos);
                                        infoWindow.setContent(browserHasGeolocation ?
                                                              'Error: The Geolocation service failed.' :
                                                              'Error: Your browser doesn\'t support geolocation.');
                                        infoWindow.open(map);
                                    }

                                    function createMakers(coords, map){
                                        var marker = new google.maps.Marker({
                                            position: new google.maps.LatLng(coords[0], coords[1]),
                                            map: map,
                                            animation: google.maps.Animation.DROP,
                                            icon: 
                                            {
                                                url: cstmMarker
                                            },
                                            title: "Hello World"
                                        });  

                                        var infowindow = new google.maps.InfoWindow({
                                          content: "<b>"+jsonLocation[1]+"</b><br><u>Seller: <i>"+jsonLocation[2]+"</u></i><br> $"+jsonLocation[3]
                                        }), marker, i;

                                        marker.addListener('click', function() {
                                            infowindow.open(map, marker);
                                        });
                                    }
                            }
                      });
                }
            }); 
        }
    }); 
});

},{"clarifai":10}],42:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[41]);
