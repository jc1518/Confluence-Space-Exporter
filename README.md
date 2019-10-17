# Confluence Space Exporter

## Overview

Confluence Space Exporter is a handy command line tool that can export a Confluence space into XML or HTML or PDF file. A good use case is archving space to a offsite storage. 

XML export includes almost everything in the existing space. To restore the space, you need to import the export file into a compatible Confluence server. This is the recommended export type.

PDF and HTML export only covers part of the contents in the space, the details can be found in the following table. The pro is obvious that the export file is immediately readble therefore easy for distribution. 

|Content|PDF export|XML export|HTML export|          
|-------------|-------------|-------------|-------------|
|Pages|Yes|Yes|Yes|
|Blogs|No|Yes|No|
|Comments|No|Optional|Optional|
|Attachments|Images only|Yes|Yes|
|Unpublished changes|No|Yes|No|
|Page numbers|Optional|N/A|N/A|

## Install 

```
npm i -g confluence-space-exporter
```

## Configuration
Setup the Confluence login information environment variables, please refer the [sample](./envvar).
```
source envvar
```

## Usage

```
Usage: confluence-space-exporter -k [key] -t [type]

Options:
  --help      Show help                                                [boolean]
  --version   Show version number                                      [boolean]
  -k, --key   Confluence space key                                    [required]
  -t, --type  Export file type: xml, html or pdf                      [required]

Examples:
  confluence-space-exporter -k CAP -t xml  Export Confluence space CAP to XML file
```

## Sample

```
$ confluence-space-exporter -k CAP -t xml
Generating export file for space CAP ...
CAP space archiving file download link: https://confluence.jackiechen.org/download/temp/Confluence-space-export-221847-204.xml.zip
CAP space download starting time: 2019-10-17 10:18:47 
Downloading...
status code is: 200
CAP space export file size: 0.01 MB
100.00 % has been downloaded for CAP
CAP space download finished! confluence.jackiechen.org-CAP-Confluence_Automation_Poc.xml.zip
CAP space download ending time: 2019-10-17 10:18:48
```

