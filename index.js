var randomBytes = require('randombytes')
var geojsonhint = require('@mapbox/geojsonhint')

module.exports = GeoJson

/**
 * Create a GeoJson API to install into a p2p-db
 * @see {@link https://github.com/noffle/p2p-db|p2p-db}
 * @see {@link https://github.com/noffle/p2p-db-osm|p2p-db-osm}
 * @see {@link https://github.com/mafintosh/hyperdb|hyperdb}
 * @param {Function} db a hyperdb instance
 * @param {Object} [opts]
 * @param {string} [opts.prefix='/geojson'] A prefix to add to the hyperdb key
 * @example
 * var P2P = require('p2p-db')
 * var GeoJson = require('p2p-db-geojson')
 * var hyperdb = require('hyperdb')
 * var ram = require('random-access-memory')
 *
 * var hyper = hyperdb(ram, { valueEncoding: 'json' })
 * var db = P2P(hyper)
 * db.install('geojson', new GeoJson(hyper))
 *
 * var gj = {
 *   type: "Feature",
 *   properties: {},
 *   geometry: {
 *     type: "Point",
 *     coordinates: [
 *       -123.017349,
 *       48.535021
 *     ]
 *   }
 * }
 *
 * db.geojson.create(gj, function (err, key) {
 *   if (err) throw err
 *   console.log(key)
 *   db.geojson.get(key, function (err, feature) {
 *     if (err) throw err
 *     console.log(feature)
 *   })
 * })
 */
function GeoJson (db, opts) {
  if (!(this instanceof GeoJson)) return new GeoJson(db, opts)
  if (!db) throw new Error('missing param "db"')
  opts = opts || {}

  this.db = db
  this.dbPrefix = opts.prefix || '/geojson'
}

GeoJson.prototype.create = function (element, cb) {
  var errors = geojsonhint.hint(element)
  if (errors.length) cb(errors.join(', '))
  var id = generateId()
  var key = this._constructKey(id)
  element.id = id
  this.db.put(key, element, function (err) {
    if (err) return cb(err)
    cb(null, id)
  })
}

GeoJson.prototype.put = function (id, element, cb) {
  var errors = geojsonhint.hint(element)
  if (errors.length) cb(errors.join(', '))
  var key = this._constructKey(id)
  this.db.put(key, element, function (err) {
    if (err) return cb(err)
    cb(null, id)
  })
}

GeoJson.prototype.get = function (id, cb) {
  var key = this._constructKey(id)
  this.db.get(key, function (err, res) {
    if (err) return cb(err)
    var values = res.map(function (node) {
      var v = node.value
      return v
    })
    cb(null, values)
  })
}

GeoJson.prototype._constructKey = function (id) {
  return this.dbPrefix + '/elements/' + id
}

function generateId () {
  return randomBytes(8).toString('hex')
}
