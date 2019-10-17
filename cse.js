#!/usr/bin/env node 
/**
 * Confluence Space Exporter Starter
 */
const exporter = require('./lib/exporter')

const argv = require('yargs')
  .usage('Usage: $0 -k [key] -t [type]')
  .example('$0 -k CAP -t xml', 'Export Confluence space CAP to XML file')
  .alias('k', 'key')
  .describe('k', 'Confluence space key')
  .alias('t', 'type')
  .describe('t', 'Export file type: xml, html or pdf')
  .demandOption(['k', 't'])
  .argv

exporter(argv.key.toUpperCase(), argv.type)