require('es6-promise').polyfill();
require('universal-fetch');
const R = require('ramda');

const baseUrl = 'https://api.spotify.com';

const endpoints = {
  artist: '/v1/artists/{id}',
  relatedArtists: '/v1/artists/{id}/related-artists',
};

const finalEndpoint = id => R.replace(/\{.*\}/, id);

const artists = [
  '7xZHrltZh8zIRvjimgABvj',
  '1uFG5Tg7iA7wd56RchxvWw',
  '4boY3fDYvqcujNmLZpQdbc',
  '4ksCwAPgMi8rkQwwR3nMos',
  '4ksdsPgMi8rkQwwR3nMos',
  '2tyMOS8xKREgpEwHnLc6EX',
  '0dmPX6ovclgOy8WWJaFEUU',
];

const request = (endpoint) => fetch(`${baseUrl}${endpoint}`).then(r => r.json()).catch(R.identity);

const isNotNull = x => x.id || x.artists;
const knownArtists = R.filter(isNotNull);

// step 1
const requestArtist = id => request(finalEndpoint(id)(endpoints['artist']));
const requestAllArtists = R.map(requestArtist);
const getNames = R.compose(R.pluck('name'), knownArtists);

// step 2
const requestRelated = id => request(finalEndpoint(id)(endpoints['relatedArtists']));
const requestAllRelateds = R.map(requestRelated);
const getTwoFirstNames = R.compose(R.pluck('name'), R.take(2));
const getTwoFirstNamesByArtists = R.compose(R.flatten, R.map(getTwoFirstNames), R.map(R.prop('artists')), knownArtists);
const mergeAndSort = R.compose(R.dropRepeats, R.sort(R.tolower), R.flatten);

const printStep = (promise, name) => promise.then(r => { console.log(`-> ${name}\n`, r, '\n'); return r; }).catch(console.log);

const step1 = Promise.all(requestAllArtists(artists));
printStep(step1.then(getNames), 'step1');

const step2 = Promise.all([
    Promise.all(requestAllArtists(artists)),
    Promise.all(requestAllRelateds(artists)),
  ]).then(p => [getNames(p[0]), getTwoFirstNamesByArtists(p[1])])

printStep(step2.then(mergeAndSort), 'step2');
