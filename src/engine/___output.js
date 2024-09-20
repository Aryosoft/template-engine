  var __output = "";
  function __append(s) { if (s !== undefined && s !== null) __output += s }
  var _renderTemplate = __append;
    ; __append("\r\n")
    ;  const getTitle=()=> {
        let pageTitle = 'Aryosoft';
        pageTitle = ($layout.pageTitle ?? '').toString().trim();
        if($layout.pageTitle != '')
            pageTitle += ` | ${$layout.pageTitle}`;
        return pageTitle;
    }

    
    ; __append("\r\n    <!DOCTYPE html>\r\n    <html>\r\n\r\n    <head>\r\n        <title>\r\n            ")
    ; __append(escapeFn(getTitle()))
    ; __append("\r\n        </title>\r\n        <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css\" rel=\"stylesheet\"\r\n            integrity=\"sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC\"\r\n            crossorigin=\"anonymous\">\r\n        <style>\r\n            header {\r\n                border-bottom: solid 1px #ccc;\r\n                margin-bottom: 20px;\r\n            }\r\n\r\n            footer {\r\n                border-top: solid 1px #ccc;\r\n                margin-top: 20px;\r\n            }\r\n        </style>\r\n    </head>\r\n\r\n    <body>\r\n        <header>\r\n            ")
    ; __append( include('header') )
    ; __append("\r\n        </header>\r\n        <div class=\"container\">\r\n            ")
    ; __append( include($layout.body, this) )
    ; __append("\r\n        </div>\r\n        <footer>\r\n            ")
    ; __append( include('footer') )
    ; __append("\r\n        </footer>\r\n    </body>\r\n\r\n    </html>")
debugger; return __output;
