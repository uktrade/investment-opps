'use strict';

/**
 * Dependencies
 */
var metalsmith = require('metalsmith');
var json = require('metalsmith-json');
var path = require('path');
var debug = require('debug')('structure-parser');


/**
 * Helpers
 */
var handle = require('./helpers/error-handler').handle;


/**
 * Expose `plugin`.
 */
module.exports = structureParser;


/**
 * Metalsmith plugin to parse iigb path structure.
 *
 * Parses each {language-code}_{country-code}.json file under structure folder
 * and puts mapped content data into releavent page entries.
 
 *
 * @param  {Object} opts options
 * @return {Function}
 */
function structureParser(structuesDirectory) {
  var directory = structuesDirectory || './structure';

  return parseStructure;

  /**
   * Using contents supplied, parser replaces actual content with content path defined in sections in structure file.
   *
   * The parser clears supplied markdown and html files (@param contents) and supplies each page entry as an index.html
   * file to be created by metalsmith. Each page entry can have multiple contents mapped to it in sections. The
   * content is attached as metadata (data field) to each filed.
   *
   * The resulting file list can be processed using markdown layout plugin.
   *
   * @param  {Object}   contents markdown or html files
   * @param  {[type]}   msmith   metalsmith
   * @param  {Function} done     callback
   */
  function parseStructure(contents, msmith, done) {
    // debug('Contents', contents);
    var baseDir = msmith._directory;
    debug('Using directory:', path.join(baseDir, directory));
    parse();

    function parse() {
      var results = {}; //resulting index.html file to replace content file list
      metalsmith(baseDir)
        .source(directory)
        .use(json())
        .process(function(err, structureFiles) {
          handle(err);
          Object.keys(structureFiles)
            .forEach(function(structure) {
              if (isJson(structure)) {
                debug('Processing ' + structure);
                var codes = path.basename(structure, '.json').split('_');
                var locale = {
                  language: codes[0],
                  country: codes[1].toLowerCase()
                };
                processStructure(locale, structureFiles[structure], results);
              } else {
                debug('Skipping file ' + structure);
              }
            });

          clearContentFiles(contents);
          extend(contents, results); //push index.html files into file list
          debug('Files:', contents);
          done();
        });
    }

    /**
     * Clear content files (namely .html files in file list)
     * to no to be copied over to build.
     *
     * Note: Since markdown files are expected to be processed before
     * they also will have .htm extension
     *
     * @param  {Object} obj the object
     */
    function clearContentFiles(obj) {
      Object.keys(obj).forEach(function(key) {
        delete obj[key];
      });
    }

    /**
     * Extend object properties with another given object
     * @param  {Object} source      source object
     * @param  {[type]} destination destionation object
     */
    function extend(source, destination) {
      Object.keys(destination).forEach(function(key) {
        source[key] = destination[key];
      });
    }


    function processStructure(locale, structure, results) {
      var data = structure.data;
      if (!data) {
        return;
      }

      var structureRoot = {
        path: locale.country,
        breadcrumb: []
      };
      parsePages(locale, structure.data, structureRoot, results);
    }

    function parsePages(locale, pages, parent, results) {
      for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        debug('Processing page entry ' + page.url);

        //put new page to resulting file list
        page = inflateContent(locale, page, parent, contents);
        results[page.path + 'index.html'] = page;

        //Process sub pages
        if (page.children) {
          parsePages(locale, page.children, page, results);
          delete page.children;
        }
      }
    }

    /**
     * Load content into contentBlock, adds path, breadcrumb
     * and transform page object to a metalsmith processable file entry
     *
     * @return {Object} inflated page entry
     */
    function inflateContent(locale, page, parent, contents) {
      page.language = locale.language;
      page.country = locale.country;
      page.path = buildPath(page, parent.path);
      page.breadcrumb = parent.breadcrumb.concat({
        pageTitle: page.pageTitle,
        link: '/' + page.path
      });

      debug(page.url + ' breadcrumb ' + JSON.stringify(page.breadcrumb));
      var contentBlocks = page.contentBlocks;

      Object.keys(contentBlocks).forEach(function(key) {
        var block = contentBlocks[key];
        // debug(key, ':', typeof block);
        if (isArray(block)) { //content path list
          for (var i = 0; i < block.length; i++) {
            block[i].content = getContent(block[i].file, key);
          }
        } else if (typeof block === 'object') { //content path
          contentBlocks[key].content = getContent(block.file, key);
        } else {
          throw ('Invalid content block definition ' + key + '. Use object or array of objects');
        }
      });

      //metalsmith layouts skips file entries with non-utf8 or empty contents.
      //This will make it work
      page.contents = '';
      return page;


      function getContent(cPath, sectionKey) {
        var p = path.parse(cPath);
        //content files are transformed into html after markdown process
        var contentPath = p.dir + path.sep + p.name + '.html';
        var content = contents[contentPath];
        if (content) {
          debug('Map:"' + cPath + '" -> "' + page.layout + ':' + sectionKey + '"');
          if (content.contents) {
            content.contents = content.contents.toString(); //buffer to string
          }
        } else {
          throw 'Content not found ' + contentPath;
        }
        return content;
      }

    }


    function isArray(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    }

    /**
     * Builds path by appending page path to parent path
     * @param  {Object} page       page entry
     * @param  {String} parentPath parent page path
     * @return {String}            resulting path
     */
    function buildPath(page, parentUrl) {
      var p;
      p = parentUrl + page.url;

      return trail(p);

      //add trailing slash to path
      function trail(p) {
        if (p.endsWith('/')) {
          return p; //paths should be ralative to build folder
        }
        return p + path.sep;
      }
    }

    function isJson(file) {
      return /\.json$/.test(path.extname(file));
    }

  }
}