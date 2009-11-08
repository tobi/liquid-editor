if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
  };
}


var LiquidParser = Editor.Parser =(function() {
    var isQuote = /[\'\"]/;
    var isWordChar = /[\w\_]/
    var isPunctuation = /[\.\|\=\:\[\]]/;
    
    var keywords = {};
    
    ['in'].forEach(function(element, index, array) {
      keywords[element] = true;
    });
  
    function inLiquidOutput(source, setState) {
      var ch = source.next();
      if (ch == "}") {
        setState(inText);
        return "liquid-punctuation";
      }
      else if (isQuote.test(ch)) {
        setState(inLiquidString(ch, inLiquidOutput));
        return null;        
      }
      else if (isPunctuation.test(ch)) {
        return "liquid-punctuation";
      }
      else {
        source.nextWhileMatches(/[\s\n]/);
        return "liquid-text";
      }
    }
    
    function inLiquidTagName(source, setState) {
      source.nextWhileMatches(isWordChar);
      setState(inLiquidTag);
      return "liquid-tag-name";      
    }

    function inLiquidTag(source, setState) {
      var ch = source.next();
      if (ch == "%") {
        setState(inText);
        return "liquid-punctuation";
      }
      else if (isQuote.test(ch)) {
        setState(inLiquidString(ch, inLiquidTag));
        return null;        
      }
      else if (isPunctuation.test(ch)) {
        return "liquid-punctuation";
      }
      else {        
        return readWord(source, keywords)
      }
    }
    
    function readWord(source, keywords) {
      source.nextWhileMatches(isWordChar);      
      var word = source.get();
      console.log('"' + word + '"')
            
      if (keywords && keywords.propertyIsEnumerable(word)) {
        return {type: "liquid-keyword", style: "liquid-keyword", content: word};
      }
      else {
        return {type: "liquid-text", style: "liquid-text", content: word};
      }
      
      // var known = keywords.hasOwnProperty(word) && keywords.propertyIsEnumerable(word) && keywords[word];
      // since we called get(), tokenize::take won't get() anything. Thus, we must set token.content
      // return known ? {type: known.type, style: known.style, content: word} :
      // {type: "t_string", style: "php-t_string", content: word};
    }
    
  
  
    function inLiquidVariable(quote, outer) {
      return function(source, setState) {
        while (!source.endOfLine()) {
          var ch = source.next();
          if (ch == ' ') {
            setState(outer);
            break;
          }
        }
        return "liquid-variable";
      };
    }
  
  
    function inLiquidString(quote, outer) {
      return function(source, setState) {
        while (!source.endOfLine()) {
          if (source.next() == quote) {
            setState(outer);
            break;
          }
        }
        return "liquid-string";
      };
    }
  
  function inText(source, setState) {
    var ch = source.next();
 
    if (ch == "{") {        
      setState(inLiquidOutput);
      return 'liquid-punctuation';
    }
    else if (ch == "%") {
      setState(inLiquidTagName);
      return 'liquid-punctuation';
    }
    else {
      return "text";
    }
  }
  
  
  function parseLiquid(source) {
    function indentTo(n) {return function() {return n;}}
    source = tokenizer(source, inText);
    var space = 0;

    var iter = {
      next: function() {
        var tok = source.next();
        if (tok.type == "whitespace") {
          if (tok.value == "\n") tok.indentation = indentTo(space);
          else space = tok.value.length;
        }
        return tok;
      },
      copy: function() {
        var _space = space;
        return function(_source) {
          space = _space;
          source = tokenizer(_source, inText);
          return iter;
        };
      }
    };
    return iter;
  }
  return {make: parseLiquid};
})();
