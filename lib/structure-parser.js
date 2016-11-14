'use strict';

/**
 * Dependencies
 */
var metalsmith = require('metalsmith');
var json = require('metalsmith-json');
var yaml = require('js-yaml');
var path = require('path');
var fs = require('fs');


/**
 * Helpers
 */
var logger = require('./helpers/logger')('structure-parser');
var debug = logger.debug;
var warn = logger.warn;

/**
 * Expose `plugin`.
 */
module.exports = structureParser;


/**
 * Metalsmith plugin to parse iigb path structure.
 *
 * Parses each {locale}.json file under structure folder
 * and puts mapped content data into releavent page entries.
 
 *
 * @param  {Object} opts options
 * @return {Function}
 */
function structureParser(options) {
  return parseStructure;

  /**
   * Using contents supplied, parser replaces actual content with content path defined in contentBlocks in
   * structure file.
   *
   * The parser clears supplied markdown and html files (@param contents) and supplies each page entry as an index.html
   * file to be created by metalsmith. Each page entry can have multiple contents mapped to it in contentBlocks. The
   * content is added as "content" to each contentBlock field.
   *
   * The resulting file list can be processed using markdown layout plugin.
   *
   * @param  {Object}   contents markdown or html files
   * @param  {[type]}   msmith   metalsmith
   * @param  {Function} done     callback
   */
  function parseStructure(contents, msmith, done) {
    var workingDidr = msmith._directory;
    var structureDirectory = options.structures || './structure';
    var labelsDirectory = path.join(workingDidr, (options.labels || './labels'));
    var labels = readLabels(labelsDirectory);

    debug('Reading structire files under %s', path.join(workingDidr, structureDirectory));

    parse();

    function parse() {
      var results = {}; //resulting index.html file to replace content file list

      metalsmith(workingDidr)
        .source(structureDirectory)
        .use(json())
        .process(function(err, structureFiles) {
          if (err) {
            return done(err);
          }
          try {
            parseStructure();
            clearContentFiles(contents);
            extend(contents, results); //push index.html files into file list
            debug('Finished parsing structure successfully .');
            done();
          } catch (err) {
            done(err);
          }

          function parseStructure() {
            Object.keys(structureFiles)
              .forEach(function(structure) {
                if (isJson(structure)) {
                  debug('Processing %s', structure);
                  processStructure(structureFiles[structure], results);
                } else {
                  debug('Skipping file %s', structure);
                }
              });
          }
        });
    }


    /**
     * Read label language files and puts in the a map of labels with locale id as key.
     *
     * e.g.
     * {
     * en_US: {
     *   onThisPage: 'On This Page'
     * }
     * }
     * @return {[type]} [description]
     */
    function readLabels(labelsDirectory) {
      debug('Reading label files from %s ', labelsDirectory);
      var files = fs.readdirSync(labelsDirectory);
      var labels = {};
      files.forEach(function(file) {
        var doc = yaml.safeLoad(fs.readFileSync(labelsDirectory + '/' + file));
        labels[path.parse(file).name] = doc;
      });
      return labels;
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
      if (!destination) {
        return;
      }
      Object.keys(destination).forEach(function(key) {
        source[key] = destination[key];
      });
    }


    function processStructure(structure, results) {
      var data = structure.data;
      if (!data) {
        return;
      }
      var structureRoot = {
        path: '',
        breadcrumb: []
      };

      var _labels = labels[structure.data.labels] || {};
      //Including English labels for all templates along with target language labels
      _labels.en = labels['en_US'];
      var sharedMeta = structure.data.sharedMeta;
      parsePages(structure.data.pages, structureRoot);

      function parsePages(pages, parent) {
        for (var i = 0; i < pages.length; i++) {
          var page = pages[i];
          debug('Processing page entry %s', page.url);

          //put new page to resulting file list
          page = inflateContent(page, parent);
	  var fileName = page.fileName || 'index.html';
          results[page.path + fileName] = page;

          //Process sub pages
          if (page.children) {
            parsePages(page.children, page);
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
      function inflateContent(page, parent) {
        page.labels = _labels;
        page.timestamp = Date.now() / 1000 | 0;
        extend(page, sharedMeta); // extend page with sharedMeta
        page.path = buildPath(page, parent.path);
        page.breadcrumb = parent.breadcrumb.concat({
          pageTitle: page.pageTitle,
          link: '/' + page.path
        });

        debug('%s breadcrumb %s', page.url, JSON.stringify(page.breadcrumb));
        var contentBlocks = page.contentBlocks || {};
        var filePath;

        //Inject markdown content to element in contentBlock
        Object.keys(contentBlocks).forEach(function(key) {
          var block = contentBlocks[key];
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
          if (!cPath) { //if not file path for content is given skip
            return;
          }
          var p = path.parse(cPath);
          var contentPath = p.dir + path.sep + p.name;
          //content files are transformed into html after markdown process
          var content = contents[contentPath + '.html'];
          if (content) {
            debug('Map: "%s" -> %s : %s [content]"', cPath, page.layout, sectionKey);
            if (content.contents) {
              content.contents = content.contents.toString(); //buffer to string

              //Prose inserts images with {{site.basUrl}} prefix. Having the media folder
              //of the content under root of the build, {{site.baseUrl}} needs to be removed from markdown content
              content.contents = content.contents.replace('{{site.baseurl}}', '');
            }
          } else {
            warn('Content not found %s', cPath);
            throw 'Content not found ' + cPath;
          }
          return content;
        }

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
        //paths should be ralative to build folder
        if (!p) {
          return './';
        } else if (p.endsWith('/')) {
          return p;
        }
        return p + path.sep;
      }
    }

    function isJson(file) {
      return /\.json$/.test(path.extname(file));
    }

  }
}
