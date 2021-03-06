const port = process.env.PORT || 3030
const CAMPAIGN_EXTENSION = 'cmp'
const VIEWS_PATH = './views'

const express = require('express');
const fs = require('fs');
const request = require('request');
const jsonDataFromFile = require('./data.json');
const mockAPI = 'http://www.mocky.io/v2/5cc7140f320000af39b950a3';

const templateTransformer = function(html, options) {
  let literalIdentifier = /<%([^%>]+)?%>/g,
      keywordIdentifier = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
      code = 'var r=[];\n',
      cursor = 0,
      _html = html.toString(),
      match;

  const add = function(line, js) {
    js ? (code += line.match(keywordIdentifier) ? `${line}\n` : 'r.push(' + line + ');\n') :
         (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }

  while (match = literalIdentifier.exec(_html)) {
    add(_html.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }

  add(_html.substr(cursor, _html.length - cursor));
  code += 'return r.join("");';
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
};

var app = express();

app.engine(CAMPAIGN_EXTENSION, function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err)
    // templater goes here
    let rendered = templateTransformer(content, options);
    return callback(null, rendered)
  })
});

app.set('views', VIEWS_PATH);
app.set('view engine', CAMPAIGN_EXTENSION);

app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.listen(port, err => {
  if (err) throw err
  console.log(`> Ready On Server http://localhost:${port}`)
});

app.get('/', function (_req, res) {
  res.render('home', jsonDataFromFile)
});

app.get('/file', function (_req, res) {
  res.render('index', jsonDataFromFile)
});

app.get("/api", (req, res) => {
  console.log(req)
  let mockQueryApi = req.query.mockAPI;
  console.log(mockQueryApi)
  let finalAPI;
  if (mockQueryApi) {
    finalAPI = mockQueryApi
  } else {
    finalAPI = mockAPI
  }
  console.log(finalAPI)
  request(finalAPI, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.render('index', JSON.parse(body))
    }
  })
});
