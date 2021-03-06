'use strict'

/* global describe, it */

const assert = require('assert')
const rdf = require('rdf-data-model')
const FilterStream = require('rdf-filter-stream')
const Source = require('..')

function streamToPromise (stream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}

describe('rdf-source', () => {
  it('should be a constructor', () => {
    assert.equal(typeof Source, 'function')
  })

  it('should implement the Stream interface', () => {
    let source = new Source()

    assert.equal(typeof source.on, 'function')
  })

  it('should have a .match method', () => {
    let source = new Source()

    assert.equal(typeof source.match, 'function')
  })

  it('.match should return a FilterStream instance', () => {
    let source = new Source()
    let filter = source.match()

    assert.equal(filter instanceof FilterStream, true)
  })

  it('.match should forward the quad pattern to the FilterStream', () => {
    let subject1 = rdf.namedNode('http://example.org/subject1')
    let subject2 = rdf.namedNode('http://example.org/subject2')
    let predicate1 = rdf.namedNode('http://example.org/predicate1')
    let predicate2 = rdf.namedNode('http://example.org/predicate2')
    let object1 = rdf.namedNode('http://example.org/object1')
    let object2 = rdf.namedNode('http://example.org/object2')
    let graph1 = rdf.namedNode('http://example.org/graph1')
    let graph2 = rdf.namedNode('http://example.org/graph2')
    let quads = [
      rdf.quad(subject1, predicate1, object1, graph1),
      rdf.quad(subject2, predicate1, object1, graph1),
      rdf.quad(subject1, predicate2, object1, graph1),
      rdf.quad(subject1, predicate1, object2, graph1),
      rdf.quad(subject1, predicate1, object1, graph2)
    ]

    let source = new Source()
    let filter = source.match(subject1, predicate1, object1, graph1)
    let output = []

    filter.on('data', (quad) => {
      output.push(quad)
    })

    let result = streamToPromise(filter).then(() => {
      assert.equal(output.length, 1)
    })

    quads.forEach((quad) => {
      source.emit('data', quad)
    })

    source.emit('end')

    return result
  })
})
