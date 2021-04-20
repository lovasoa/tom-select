/**
* Tom Select v1.4.3
* Licensed under the Apache License, Version 2.0 (the "License");
*/

/**
 * sifter.js
 * Copyright (c) 2013–2020 Brian Reavis & contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */
// utilities
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
var cmp = function cmp(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a > b ? 1 : a < b ? -1 : 0;
  }

  a = asciifold(String(a || ''));
  b = asciifold(String(b || ''));
  if (a > b) return 1;
  if (b > a) return -1;
  return 0;
};
/**
 * A property getter resolving dot-notation
 * @param  {Object}  obj     The root object to fetch property on
 * @param  {String}  name    The optionally dotted property name to fetch
 * @param  {Boolean} nesting Handle nesting or not
 * @return {Object}          The resolved property value
 */


var getattr = function getattr(obj, name, nesting) {
  if (!obj || !name) return;
  if (!nesting) return obj[name];
  var names = name.split(".");

  while (names.length && (obj = obj[names.shift()]));

  return obj;
};

var escape_regex = function escape_regex(str) {
  return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
};

var DIACRITICS = {
  'a': '[aḀḁĂăÂâǍǎȺⱥȦȧẠạÄäÀàÁáĀāÃãÅåąĄÃąĄ]',
  'b': '[b␢βΒB฿𐌁ᛒ]',
  'c': '[cĆćĈĉČčĊċC̄c̄ÇçḈḉȻȼƇƈɕᴄＣｃ]',
  'd': '[dĎďḊḋḐḑḌḍḒḓḎḏĐđD̦d̦ƉɖƊɗƋƌᵭᶁᶑȡᴅＤｄð]',
  'e': '[eÉéÈèÊêḘḙĚěĔĕẼẽḚḛẺẻĖėËëĒēȨȩĘęᶒɆɇȄȅẾếỀềỄễỂểḜḝḖḗḔḕȆȇẸẹỆệⱸᴇＥｅɘǝƏƐε]',
  'f': '[fƑƒḞḟ]',
  'g': '[gɢ₲ǤǥĜĝĞğĢģƓɠĠġ]',
  'h': '[hĤĥĦħḨḩẖẖḤḥḢḣɦʰǶƕ]',
  'i': '[iÍíÌìĬĭÎîǏǐÏïḮḯĨĩĮįĪīỈỉȈȉȊȋỊịḬḭƗɨɨ̆ᵻᶖİiIıɪＩｉ]',
  'j': '[jȷĴĵɈɉʝɟʲ]',
  'k': '[kƘƙꝀꝁḰḱǨǩḲḳḴḵκϰ₭]',
  'l': '[lŁłĽľĻļĹĺḶḷḸḹḼḽḺḻĿŀȽƚⱠⱡⱢɫɬᶅɭȴʟＬｌ]',
  'n': '[nŃńǸǹŇňÑñṄṅŅņṆṇṊṋṈṉN̈n̈ƝɲȠƞᵰᶇɳȵɴＮｎŊŋ]',
  'o': '[oØøÖöÓóÒòÔôǑǒŐőŎŏȮȯỌọƟɵƠơỎỏŌōÕõǪǫȌȍՕօ]',
  'p': '[pṔṕṖṗⱣᵽƤƥᵱ]',
  'q': '[qꝖꝗʠɊɋꝘꝙq̃]',
  'r': '[rŔŕɌɍŘřŖŗṘṙȐȑȒȓṚṛⱤɽ]',
  's': '[sŚśṠṡṢṣꞨꞩŜŝŠšŞşȘșS̈s̈]',
  't': '[tŤťṪṫŢţṬṭƮʈȚțṰṱṮṯƬƭ]',
  'u': '[uŬŭɄʉỤụÜüÚúÙùÛûǓǔŰűŬŭƯưỦủŪūŨũŲųȔȕ∪]',
  'v': '[vṼṽṾṿƲʋꝞꝟⱱʋ]',
  'w': '[wẂẃẀẁŴŵẄẅẆẇẈẉ]',
  'x': '[xẌẍẊẋχ]',
  'y': '[yÝýỲỳŶŷŸÿỸỹẎẏỴỵɎɏƳƴ]',
  'z': '[zŹźẐẑŽžŻżẒẓẔẕƵƶ]'
};

var asciifold = function () {
  var i, n, k, chunk;
  var foreignletters = '';
  var lookup = {};

  for (k in DIACRITICS) {
    if (DIACRITICS.hasOwnProperty(k)) {
      chunk = DIACRITICS[k].substring(2, DIACRITICS[k].length - 1);
      foreignletters += chunk;

      for (i = 0, n = chunk.length; i < n; i++) {
        lookup[chunk.charAt(i)] = k;
      }
    }
  }

  var regexp = new RegExp('[' + foreignletters + ']', 'g');
  return function (str) {
    return str.replace(regexp, function (foreignletter) {
      return lookup[foreignletter];
    }).toLowerCase();
  };
}();

class Sifter {
  /**
   * Textually searches arrays and hashes of objects
   * by property (or multiple properties). Designed
   * specifically for autocomplete.
   *
   * @constructor
   * @param {array|object} items
   * @param {object} items
   */
  constructor(items, settings) {
    this.items = void 0;
    this.settings = void 0;
    this.items = items;
    this.settings = settings || {
      diacritics: true
    };
  }

  /**
   * Splits a search string into an array of individual
   * regexps to be used to match results.
   *
   * @param {string} query
   * @returns {array}
   */
  tokenize(query, options) {
    query = String(query || '').toLowerCase().trim();
    if (!query || !query.length) return [];
    var letter;
    var tokens = [];
    var words = query.split(/\s+/);
    const field_regex = new RegExp('^(' + options.fields.map(escape_regex).join('|') + ')\:(.*)$');
    words.forEach(word => {
      let field_match;
      let field = null;
      let regex = null; // look for "field:query" tokens

      if (options.fields.length > 1 && (field_match = word.match(field_regex))) {
        field = field_match[1];
        word = field_match[2];
      }

      if (word.length > 0) {
        regex = escape_regex(word);

        if (this.settings.diacritics) {
          for (letter in DIACRITICS) {
            if (DIACRITICS.hasOwnProperty(letter)) {
              regex = regex.replace(new RegExp(letter, 'g'), DIACRITICS[letter]);
            }
          }
        }

        if (options.respect_word_boundaries) regex = "\\b" + regex;
        regex = new RegExp(regex, 'i');
      }

      tokens.push({
        string: word,
        regex: regex,
        field: field
      });
    });
    return tokens;
  }

  /**
   * Iterates over arrays and hashes.
   *
   * ```
   * this.iterator(this.items, function(item, id) {
   *    // invoked for each item
   * });
   * ```
   *
   * @param {array|object} object
   */
  iterator(object, callback) {
    var iterator;

    if (Array.isArray(object)) {
      iterator = Array.prototype.forEach || function (callback) {
        for (var i = 0, n = this.length; i < n; i++) {
          callback(this[i], i, this);
        }
      };
    } else {
      iterator = function (callback) {
        for (var key in this) {
          if (this.hasOwnProperty(key)) {
            callback(this[key], key, this);
          }
        }
      };
    }

    iterator.apply(object, [callback]);
  }

  /**
   * Returns a function to be used to score individual results.
   *
   * Good matches will have a higher score than poor matches.
   * If an item is not a match, 0 will be returned by the function.
   *
   * @returns {function}
   */
  getScoreFunction(query, options) {
    var self, fields, tokens, token_count, nesting, search;
    self = this;
    search = self.prepareSearch(query, options);
    tokens = search.tokens;
    fields = search.options.fields;
    token_count = tokens.length;
    nesting = search.options.nesting;
    /**
     * Calculates how close of a match the
     * given value is against a search token.
     *
     * @param {string} value
     * @param {object} token
     * @return {number}
     */

    var scoreValue = function scoreValue(value, token) {
      var score, pos;
      if (!value) return 0;
      value = String(value || '');
      pos = value.search(token.regex);
      if (pos === -1) return 0;
      score = token.string.length / value.length;
      if (pos === 0) score += 0.5;
      return score;
    };
    /**
     * Calculates the score of an object
     * against the search query.
     *
     * @param {object} token
     * @param {object} data
     * @return {number}
     */


    var scoreObject = function () {
      var field_count = fields.length;

      if (!field_count) {
        return function () {
          return 0;
        };
      }

      if (field_count === 1) {
        return function (token, data) {
          return scoreValue(getattr(data, fields[0], nesting), token);
        };
      }

      return function (token, data) {
        var sum = 0;
 // is the token specific to a field?

        if (token.field) {
          const field = getattr(data, token.field, nesting);

          if (!token.regex && field) {
            sum += 0.1;
          } else {
            sum += scoreValue(field, token);
          }
        } else {
          fields.forEach(field => {
            sum += scoreValue(getattr(data, field, nesting), token);
          });
        }

        return sum / field_count;
      };
    }();

    if (!token_count) {
      return function () {
        return 0;
      };
    }

    if (token_count === 1) {
      return function (data) {
        return scoreObject(tokens[0], data);
      };
    }

    if (search.options.conjunction === 'and') {
      return function (data) {
        var score;

        for (var i = 0, sum = 0; i < token_count; i++) {
          score = scoreObject(tokens[i], data);
          if (score <= 0) return 0;
          sum += score;
        }

        return sum / token_count;
      };
    } else {
      return function (data) {
        for (var i = 0, sum = 0; i < token_count; i++) {
          sum += scoreObject(tokens[i], data);
        }

        return sum / token_count;
      };
    }
  }

  /**
   * Returns a function that can be used to compare two
   * results, for sorting purposes. If no sorting should
   * be performed, `null` will be returned.
   *
   * @param {string|object} search
   * @return function(a,b)
   */
  getSortFunction(search, options) {
    var i, n, self, field, fields, fields_count, multiplier, multipliers, get_field, implicit_score, sort;
    self = this;
    search = self.prepareSearch(search, options);
    sort = !search.query && options.sort_empty || options.sort;
    /**
     * Fetches the specified sort field value
     * from a search result item.
     *
     * @param  {string} name
     * @param  {object} result
     * @return {string}
     */

    get_field = function (name, result) {
      if (name === '$score') return result.score;
      return getattr(self.items[result.id], name, options.nesting);
    }; // parse options


    fields = [];

    if (sort) {
      for (i = 0, n = sort.length; i < n; i++) {
        if (search.query || sort[i].field !== '$score') {
          fields.push(sort[i]);
        }
      }
    } // the "$score" field is implied to be the primary
    // sort field, unless it's manually specified


    if (search.query) {
      implicit_score = true;

      for (i = 0, n = fields.length; i < n; i++) {
        if (fields[i].field === '$score') {
          implicit_score = false;
          break;
        }
      }

      if (implicit_score) {
        fields.unshift({
          field: '$score',
          direction: 'desc'
        });
      }
    } else {
      for (i = 0, n = fields.length; i < n; i++) {
        if (fields[i].field === '$score') {
          fields.splice(i, 1);
          break;
        }
      }
    }

    multipliers = [];

    for (i = 0, n = fields.length; i < n; i++) {
      multipliers.push(fields[i].direction === 'desc' ? -1 : 1);
    } // build function


    fields_count = fields.length;

    if (!fields_count) {
      return null;
    } else if (fields_count === 1) {
      field = fields[0].field;
      multiplier = multipliers[0];
      return function (a, b) {
        return multiplier * cmp(get_field(field, a), get_field(field, b));
      };
    } else {
      return function (a, b) {
        var i, result, field;

        for (i = 0; i < fields_count; i++) {
          field = fields[i].field;
          result = multipliers[i] * cmp(get_field(field, a), get_field(field, b));
          if (result) return result;
        }

        return 0;
      };
    }
  }

  /**
   * Parses a search query and returns an object
   * with tokens and fields ready to be populated
   * with results.
   *
   */
  prepareSearch(query, options) {
    if (typeof query === 'object') return query;
    options = Object.assign({}, options);
    var option_fields = options.fields;
    var option_sort = options.sort;
    var option_sort_empty = options.sort_empty;
    if (option_fields && !Array.isArray(option_fields)) options.fields = [option_fields];
    if (option_sort && !Array.isArray(option_sort)) options.sort = [option_sort];
    if (option_sort_empty && !Array.isArray(option_sort_empty)) options.sort_empty = [option_sort_empty];
    return {
      options: options,
      query: String(query || '').toLowerCase(),
      tokens: this.tokenize(query, options),
      total: 0,
      items: []
    };
  }

  /**
   * Searches through all items and returns a sorted array of matches.
   *
   */
  search(query, options) {
    var self = this,
        score,
        search;
    var fn_sort;
    var fn_score;
    search = this.prepareSearch(query, options);
    options = search.options;
    query = search.query; // generate result scoring function

    fn_score = options.score || self.getScoreFunction(search); // perform search and sort

    if (query.length) {
      self.iterator(self.items, function (item, id) {
        score = fn_score(item);

        if (options.filter === false || score > 0) {
          search.items.push({
            'score': score,
            'id': id
          });
        }
      });
    } else {
      self.iterator(self.items, function (item, id) {
        search.items.push({
          'score': 1,
          'id': id
        });
      });
    }

    fn_sort = self.getSortFunction(search, options);
    if (fn_sort) search.items.sort(fn_sort); // apply limits

    search.total = search.items.length;

    if (typeof options.limit === 'number') {
      search.items = search.items.slice(0, options.limit);
    }

    return search;
  }

}

export default Sifter;
//# sourceMappingURL=sifter.js.map