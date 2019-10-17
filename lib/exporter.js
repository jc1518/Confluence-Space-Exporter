/**
 * Export a Confluence space into XML or HTML or PDF
 */

'use strict'

const ConfluenceClient = require('./confluence-client-promise')
const Promise = require('promise')
const fs = require('fs')
const path = require('path')
const request = require('request')
const moment = require('moment')

const confluence = new ConfluenceClient(process.env.PROTOCOL, process.env.HOST, process.env.PORT, process.env.USERNAME, process.env.PASSWORD)

function downloadProgress (key, received, total) {
  const percentage = ((received * 100) / total).toFixed(2)
  console.log(percentage + " % has been downloaded for " + key)
}

async function downloadExportFile (key, type, downloadLink) {
  return new Promise(async function (resolve, reject) {
    const spaceDetail = await confluence.getSpace({ key: key })
    let savePath = path.join(process.env.HOST + '-' + key + '-' + spaceDetail.name.replace(/[^A-Z0-9]/ig, '_') + '.' + type + '.zip')
    if (type === 'pdf') {
      savePath = path.join(process.env.HOST + '-' + key + '-' + spaceDetail.name.replace(/[^A-Z0-9]/ig, '_') + '.pdf')
    }
    const writer = fs.createWriteStream(savePath)
    let receivedBytes = 0
    let totalBytes = 0
    const options = {
      url: downloadLink,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        user: process.env.USERNAME,
        password: process.env.PASSWORD
      }
    }
    request
      .get(options)
      .on('error', function (err) {
        console.error('Oops, something went wrong. ', err)
        reject(err)
      })
      .on('response', function (data) {
        console.log('status code is:', data.statusCode)
        if (data.statusCode !== 200) {
          reject('status code is: ' + data.statusCode)
        } else {
          totalBytes = data.headers[ 'content-length' ]
          console.log(key, 'space export file size:', (data.headers[ 'content-length' ] / 1048576).toFixed(2), 'MB')
        }
      })
      .on('data', function (chunk) {
        receivedBytes += chunk.length
        downloadProgress(key, receivedBytes, totalBytes)
      })
      .on('end', function () {
        if ((totalBytes / 1048576).toFixed(2) > 0) {
          console.log(key, 'space download finished!', savePath)
          console.log(key, 'space download ending time:', moment().format('YYYY-MM-DD hh:mm:ss'))
          resolve()
        } else {
          reject('File size does not look right, is it a empty space?')
        }
      })
      .pipe(writer)
  })
}

async function exportSpace (key, type) {
  try {
    console.log('Generating export file for space', key, '...')
    let downloadLink = ''
    if (type.toLowerCase() === 'xml') {
      downloadLink = await confluence.exportSpace2Xml({ key: key })
      downloadLink = JSON.parse(downloadLink)
    }
    if (type.toLowerCase() === 'html') {
      downloadLink = await confluence.exportSpace2Html({ key: key})
      downloadLink = JSON.parse(downloadLink)
    }
    if (type.toLowerCase() === 'pdf') {
      downloadLink = await confluence.exportSpace2Pdf({ key: key })
    }
    console.log(key, 'space archiving file download link:', downloadLink)
    console.log(key, 'space download starting time:', moment().format('YYYY-MM-DD hh:mm:ss'), '\nDownloading...')
    await downloadExportFile(key, type, downloadLink)
  } catch (err) {
    console.log('Oops, something went wrong\n', err)
  }
}

module.exports = exportSpace