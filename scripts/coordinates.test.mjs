import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCoordinate, parseCoordinatePair, isCoordinates } from '../src/services/coordinate-input.ts';
test('decimal, comma decimals, unicode minus and hemispheres',()=>{
  for(const value of ['-98.2062','−98.2062','98.2062 W','98,2062 O'])assert.equal(parseCoordinate(value,'longitude'),-98.2062);
  assert.equal(parseCoordinate('19,0413° N','latitude'),19.0413);
  assert.equal(parseCoordinate('19.0413 S','latitude'),-19.0413);
});
test('degrees minutes and seconds convert correctly',()=>{
  assert.equal(parseCoordinate('19° 2′ 28.68″ N','latitude'),19+2/60+28.68/3600);
  assert.equal(parseCoordinate('98° 12\' 22.32" O','longitude'),-(98+12/60+22.32/3600));
});
test('pairs accept common copied coordinate formats',()=>{
  for(const value of ['19.0413, -98.2062','(19.0413, -98.2062)','19.0413 -98.2062','19,0413; -98,2062','19.0413° N, 98.2062° W'])assert.deepEqual(parseCoordinatePair(value),{latitude:19.0413,longitude:-98.2062});
  assert.deepEqual(parseCoordinatePair('19° 0\' 0" N 98° 0\' 0" O'),{latitude:19,longitude:-98});
});
test('reject invalid ranges, ambiguous pairs, swapped axes and conflicting signs',()=>{
  for(const value of ['', '91','19 N extra','19° 60\'','19° 2\' 60"','-19 N'])assert.equal(parseCoordinate(value,'latitude'),null,value);
  assert.equal(parseCoordinate('19 W','latitude'),null);
  assert.equal(parseCoordinate('181','longitude'),null);
  for(const value of ['-98.2062,19.0413','19,0413,-98,2062','https://maps.google.com/','19, -98, 22'])assert.equal(parseCoordinatePair(value),null,value);
  assert.ok(isCoordinates(parseCoordinatePair('0, 0')));
});
