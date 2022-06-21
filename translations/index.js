// Arguments from the command line
const args = process.argv

const credentials = require(args[3]);
const fs = require("fs");
const xml2js = require('xml2js');

// Imports the Google Cloud client library
const {Translate} = require('@google-cloud/translate').v2;

// Creates a client
const translate = new Translate({
    projectId: args[2],
    credentials: credentials,
});

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const langs = ['ar', 'de', 'es', 'fr', 'id', 'it', 'ja', 'ko', 'nl', 'pt', 'ru', 'sv', 'th', 'vi', 'zh']
const values = [];

async function translateText(value, target) {
  let [translation] = await translate.translate(value, target);
  return translation;
}

fs.readFile('./messages.xlf', function(err, data) {
  parser.parseString(data, async function (err, result) {
    result.xliff.file[0].body[0]['trans-unit'][0].target = ['test'];
    for (const item of result.xliff.file[0].body[0]['trans-unit']) {
      values.push(typeof item.source[0] === 'string' ? item.source[0] : '');
    }
      console.dir(result.xliff.file[0]['$']);
      // console.log('Done');
      // console.log('file', values.length);

      // fs.writeFile('./test.json', JSON.stringify(values), function(err, data){ 
      //   if (err) console.log(err);
      // });

      for (const lang of langs) {
        const targetLanguage = lang === 'zh' ? 'zf' : lang;
        result.xliff.file[0]['$']['target-language'] = targetLanguage;
        for (let index = 0; index < values.length; index++) {
          const value = values[index];
          const target = await translateText(value, lang);
          console.log('target:', target, 'index:', index);
          result.xliff.file[0].body[0]['trans-unit'][index].target = [ target ];
        }
        let xml_string = builder.buildObject(result);
        fs.writeFile('../src/locale/messages.' + targetLanguage + '.xlf', xml_string, function(err, data){ 
          if (err) console.log(err);
        });
      }
  });
});
