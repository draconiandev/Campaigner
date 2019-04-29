const templateTransformer = function(html, options) {
  let literalIdentifier = /<%([^%>]+)?%>/g,
      keywordIdentifier = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
      code = 'var r=[];\n',
      cursor = 0,
      match;

  const add = function(line, js) {
    js ? (code += line.match(keywordIdentifier) ? `${line}\n` : 'r.push(' + line + ');\n') :
         (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
    return add;
  }

  while (match = literalIdentifier.exec(html)) {
    add(html.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }

  add(html.substr(cursor, html.length - cursor));
  code += 'return r.join("");';
  return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}

exports.templateTransformer = templateTransformer;
