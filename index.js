var randomBytes = require('randombytes')

module.exports = GeoJson

function GeoJson (db, opts) {
  if (!(this instanceof GeoJson)) return new GeoJson(db, opts)
  if (!db) throw new Error('missing param "db"')
  opts = opts || {}

  this.db = db
  this.dbPrefix = opts.prefix || '/geojson'
}

GeoJson.prototype.create = function (element, cb) {
  // TODO element check

  var id = generateId()
  var key = this._constructKey(id)
  element.id = id
  this.db.put(key, element, function (err) {
    if (err) return cb(err)
    cb(null, id)
  })
}

GeoJson.prototype.put = function (id, element, cb) {
  // TODO element check

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
