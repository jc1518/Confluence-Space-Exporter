/**
 * Confluence promise client
 */

'use strict'

const request = require('request-promise')
const Promise = require('promise')

class ConfluenceClient {
  constructor (protocol, host, port, username, password) {
    this.protocol = protocol
    this.host = host
    this.port = port
    this.username = username
    this.password = password
    this.baseurl = `${this.protocol}://${this.host}:${this.port}`
    this.headers = { 'Content-Type': 'application/json' }
    this.auth = {
      user: this.username,
      password: this.password
    }
  }

  // API request generator
  async makeRequest (options) {
    try {
      const response = await request(options)
      return response
    } catch (err) {
      console.log(err.message)
      process.exit(1)
    }
  }

  // Get a space
  // Params:
  // key - space key
  getSpace (params) {
    const options = {
      url: `${this.baseurl}/rest/api/space/${params.key}`,
      method: 'GET',
      headers: this.headers,
      auth: this.auth,
      json: true
    }
    return this.makeRequest(options)
  }

  // Set a space status to archive
  // Params:
  // key - space key
  archiveSpace (params) {
    const options = {
      url: `${this.baseurl}/rpc/json-rpc/confluenceservice-v2/setSpaceStatus`,
      method: 'POST',
      headers: this.headers,
      auth: this.auth,
      body: `[ "${params.key}", "ARCHIVED" ]`
    }
    return this.makeRequest(options)
  }

  // Export a space to XML or HTML file
  // Params:
  // key - space key
  // type - export file type (TYPE_XML or TYPE_HTML)
  exportSpace (params) {
    const options = {
      url: `${this.baseurl}/rpc/json-rpc/confluenceservice-v2/exportSpace`,
      method: 'POST',
      headers: this.headers,
      auth: this.auth,
      timeout: 600000,
      body: `["${params.key}", "${params.type}", "true"]`
    }
    return this.makeRequest(options)
  }

  // Params:
  // key - space key
  exportSpace2Xml (params) {
    return this.exportSpace({ key: params.key, type: 'TYPE_XML' })
  }

  // Params:
  // key - space key
  exportSpace2Html (params) {
    return this.exportSpace({ key: params.key, type: 'TYPE_HTML' })
  }

  // Retrive token to access plugin
  async pluginLogin () {
    const loginString = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rpc="http://rpc.confluence.atlassian.com">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
    '<rpc:login soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    '<in0 xsi:type="xsd:string">' + this.username + '</in0>' +
    '<in1 xsi:type="xsd:string">' + this.password + '</in1>' +
    '</rpc:login>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>'
    const options = {
      url: `${this.baseurl}/plugins/servlet/soap-axis1/pdfexport`,
      method: 'POST',
      headers: { 'Content-Type': 'text/html', 'SOAPAction': '' },
      auth: this.auth,
      body: loginString
    }
    const data = await this.makeRequest(options)
    const pattern = /xsd:string">(.*)<\/loginReturn/
    const token = data.match(pattern)[1]
    return token
  }

  // Export a space to PDF file
  // Params:
  // key - space key
  async exportSpace2Pdf (params) {
    const token = await this.pluginLogin()
    const exportPdfString = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:rpc="http://rpc.flyingpdf.extra.confluence.atlassian.com">' +
    '<soapenv:Header/>' +
    '<soapenv:Body>' +
    '<rpc:exportSpace soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    '<in0 xsi:type="xsd:string">' + token + '</in0>' +
    '<in1 xsi:type="xsd:string">' + params.key + '</in1>' +
    '</rpc:exportSpace>' +
    '</soapenv:Body>' +
    '</soapenv:Envelope>'
    const options = {
      url: `${this.baseurl}/plugins/servlet/soap-axis1/pdfexport`,
      method: 'POST',
      headers: { 'Content-Type': 'text/html', 'SOAPAction': '' },
      timeout: 600000,
      body: exportPdfString
    }
    const data = await this.makeRequest(options)
    const pattern = /xsd:string">(.*)<\/exportSpaceReturn/
    const downloadLink = data.match(pattern)[1]
    return downloadLink
  }

}

module.exports = ConfluenceClient
