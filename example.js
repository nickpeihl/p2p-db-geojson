var P2P = require('p2p-db')
var GeoJson = require('./')
var hyperdb = require('hyperdb')
var ram = require('random-access-memory')
var series = require('run-series')

var fixtures = require('geojson-fixtures')

var hyper = hyperdb(ram, { valueEncoding: 'json' })
var db = P2P(hyper)
db.install('geojson', new GeoJson(hyper))

var insert = Object.keys(fixtures.all).map(function (k) {
  return function (cb) {
    db.geojson.create(fixtures.all[k], cb)
  }
})

series(insert, function (err, res) {
  if (err) return console.error(err)
  var get = res.map(function (k) {
    return function (cb) {
      db.geojson.get(k, cb)
    }
  })
  series(get, function (err, res) {
    if (err) return console.error(err)
    res.forEach(function (node) {
      console.log(node)
    })
  })
})
