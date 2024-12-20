<p>A simple and fast template engine for NodeJS.</p>
<h4>Install</h4>
<p>yarn add aryosoft-template-engine</p>
<p>or:</p>
<p>npm i aryosoft-template-engine</p>
<hr/>
<h4>Initializing the engine</h4>

```
  import express, { Request, Response } from 'express';
  import { readFile, readFileSync } from 'fs';
  import path from 'path';
  import * as aryo from 'aryiosoft-template-engine';

  const templatePath: string = './src/templates';

  const templateLoader: aryo.types.ITemplateLoader = Object.freeze({
    load: (filename: string): string => {
        filename = path.resolve(templatePath, filename);
        return readFileSync(filename, 'utf-8');
    },
    loadAsync: (filename: string): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            filename = path.resolve(templatePath, filename);
            readFile(filename, 'utf-8', (err, content) => {
                if (err)
                    reject(err);
                else
                    resolve(content);
            });
        });
    }
});

const compiler: aryo.types.ICompiler = new aryo.Compiler(templateLoader, aryo.ConsoleLogger);
const templateEngine = new aryo.Engine(compiler, templateLoader);

const app = express();
const port = 3000;

const countries: = [
    { id: 100, code:'us', name: 'United State' },
    { id: 101, code:'de' name: 'Germany' },
    { id: 102, code:'UK', name: 'United Kingdom' },
    { id: 103, code:'FR' name: 'France' },
    { id: 104, code:'IT' name: 'Italy' },
];

app.get('/', (req: Request, resp: Response) => {
    try {
        let html = templateEngine.render({
            template: { template: 'index.html', isFile: true },
            cache: { key: 'c378b36b-ee9d-478d-bada-7ca70849b4c2', duration: 30/*30 Seconds*/ }
        }, {
            pageTitle: 'SYNC Rendring',
            author: {name:'Pouya', surname:'Faridi'},
            items: countries
        });

        resp.status(200)
            .contentType('text/html')
            .send(html);
    }
    catch (err: any) {
        resp.status(500)
            .contentType('text/plain')
            .send(err.message);
    }

});

app.get('/async', (req: Request, resp: Response) => {
    try {
        templateEngine.renderAsync({
            template: { template: 'index.html', isFile: true },
            cache: { key: 'c378b36b-ee9d-478d-bada-7ca70849b4c2', duration: 30 /*30 Seconds*/ }
        }, {
            pageTitle: 'ASYNC Rendring',
            author: {name:'Pouya', surname:'Faridi'},
            items: countries
        }).then(html => {
            resp.status(200)
                .contentType('text/html')
                .send(html);
        })
            .catch(err => {
                resp.status(500)
                    .contentType('text/plain')
                    .send(err.message);
            });


    }
    catch (err: any) {
        resp.status(500)
            .contentType('text/plain')
            .send(err.message);
    }

});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
```
<hr/>
<h4>Accessing to the data model inside templates</h4>
<p>Use <code>$model</code> in order to access the passed data into the template.<p/>
<code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;title&gt;&lt;%= $model.pageTitle%&gt;&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;fieldset&gt;
    &lt;legend&gt;Author&lt;/legend&gt;
    &lt;p&gt;Name:&lt;%= $model.author.name%&gt;&lt;/p&gt;
    &lt;p&gt;Name:&lt;%= $model.author.surname%&gt;&lt;/p&gt;
  &lt;/fieldset&gt;
  &lt;table class=&quot;table table-bordered&quot;&gt;
    &lt;thead&gt;
      &lt;tr&gt;
        &lt;th colspane=&quot;3&quot;&gt;Countries&lt;/th&gt;
      &lt;/tr&gt;
      &lt;tr&gt;
        &lt;th&gt;#&lt;/th&gt;
        &lt;th&gt;Code&lt;/th&gt;
        &lt;th&gt;Name&lt;/th&gt;
      &lt;/tr&gt;
    &lt;/thead&gt;
    &lt;tbody&gt;
      &lt;% for(let i=0; i &lt; $model.items.length; i++) { %&gt;
        &lt;tr&gt;
            &lt;th&gt;&lt;%= (i+1)%&gt;&lt;/th&gt;
            &lt;td&gt;&lt;%= $model.items[i].code%&gt;&lt;/td&gt;
            &lt;td&gt;&lt;%= $model.items[i]name%&gt;&lt;/td&gt;
        &lt;/tr&gt;
      &lt;%}%&gt;
    &lt;/tbody&gt;
  &lt;/table&gt;
  &lt;/body&gt;
&lt;/html&gt;
     
</code>
<hr/>
<h4>Include</h4>
<p>Use <code>include('template-name', [data])</code> in order to embed an external partial template.</p>
<code>
  &lt;!DOCTYPE html&gt;
  &lt;html&gt;
  &lt;head&gt;
    &lt;title&gt;&lt;%= $model.pageTitle%&gt;&lt;/title&gt;
  &lt;/head&gt;
  &lt;body&gt;
    &lt;%- include('author.html', $model.author) %&gt;
    &lt;table class=&quot;table table-bordered&quot;&gt;
      &lt;thead&gt;
        &lt;tr&gt;
          &lt;th colspane=&quot;3&quot;&gt;Countries&lt;/th&gt;
        &lt;/tr&gt;
        &lt;tr&gt;
          &lt;th&gt;#&lt;/th&gt;
          &lt;th&gt;Code&lt;/th&gt;
          &lt;th&gt;Name&lt;/th&gt;
        &lt;/tr&gt;
      &lt;/thead&gt;
      &lt;tbody&gt;
        &lt;% for(let i=0; i &lt; $model.items.length; i++) { %&gt;
          &lt;tr&gt;
              &lt;th&gt;&lt;%= (i+1)%&gt;&lt;/th&gt;
              &lt;td&gt;&lt;%= $model.items[i].code%&gt;&lt;/td&gt;
              &lt;td&gt;&lt;%= $model.items[i]name%&gt;&lt;/td&gt;
          &lt;/tr&gt;
        &lt;%}%&gt;
      &lt;/tbody&gt;
    &lt;/table&gt;
    &lt;/body&gt;
  &lt;/html&gt;
  </code>
</br>
</br>
<div>author.html</div>
<code>
  &lt;fieldset&gt;
    &lt;legend&gt;Author&lt;/legend&gt;
    &lt;p&gt;Name:&lt;%= $model.name%&gt;&lt;/p&gt;
    &lt;p&gt;Name:&lt;%= $model.surname%&gt;&lt;/p&gt;
  &lt;/fieldset&gt;
</code>
<hr/>
<h4>Layouts and Partials</h4>
<p>Use <code>&lt;partial layout=&quot;layout-name&quot;&gt;&lt;/partial&gt;</code> in order to create a partial template that uses another template as its layout.</p>
<p>
  Inside the layout:</br>
  <ul>
    <li><b>&lt;render-body/&gt;</b>&nbsp;&nbsp; In order to specify the place where the body of the partial will appear into. This tag is mandatory and layout templates must have only and only one of this tag.</li>
    <li><b>&lt;render-section name="section-name"/&gt;</b>&nbsp;&nbsp; In order to define sections. This tag is not mandatory. Layout templates might have several render-section tags.</li>
  </ul>
</p>
<p>Bellow is an example of a layout template:</p>
<code>
  &lt;!DOCTYPE html&gt;
  &lt;html&gt;
  &lt;head&gt;
    &lt;meta name=&quot;encoding&quot; content=&quot;utf8&quot; /&gt;
    &lt;render-section name=&quot;meta-tags&quot; /&gt;
    &lt;title&gt;&lt;%= $model.pageTitle%&gt;&lt;/title&gt;
    &lt;link href=&quot;https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css&quot; rel=&quot;stylesheet&quot; /&gt;
          &lt;style&gt;
              body&gt;main {
                  border-radius: 5px;
                  border: 1px double #000;
              }
          &lt;/style&gt;
          &lt;render-section name=&quot;styles&quot; /&gt;
  &lt;/head&gt;
  &lt;body&gt;
      &lt;main&gt; &lt;render-body /&gt;&lt;/main&gt;
      &lt;render-section name=&quot;scripts&quot; /&gt;
  &lt;/body&gt;
  &lt;/html&gt;
</code>
<p>Bellow is an example of a partial template:</p>
<code>
  &lt;partial layout=&quot;layout.html&quot;&gt;
    &lt;code&gt;
      &lt;% 
         $model.pageTitle += &#39; - Index&#39;;
      %&gt;
    &lt;/code&gt;
    &lt;section name=&quot;styles&quot;&gt;
        &lt;style&gt;
            .index-content {
                padding: 10px;
                margin: 5px;
                border: 1px solid #0f0;
            }
        &lt;/style&gt;
    &lt;/section&gt;
    &lt;section name=&quot;scripts&quot;&gt;
        &lt;script&gt;
            console.log(&quot;I&#39;m the index partial page.&quot;);
        &lt;/script&gt;
    &lt;/section&gt;
    &lt;body&gt;
        &lt;div class=&quot;index-content&quot;&gt;
            &lt;%- include(&#39;author.html&#39;, $model) %&gt;
                &lt;table class=&quot;table table-bordered&quot;&gt;
                    &lt;thead&gt;
                        &lt;tr&gt;
                            &lt;th&gt;#&lt;/th&gt;
                            &lt;th&gt;Id&lt;/th&gt;
                            &lt;th&gt;Code&lt;/th&gt;
                            &lt;th&gt;Name&lt;/th&gt;
                        &lt;/tr&gt;
                    &lt;/thead&gt;
                    &lt;tbody&gt;
                        &lt;% for(let i=0; i &lt; $model.items.length; i++) { %&gt;
                            &lt;tr&gt;
                                &lt;th&gt;
                                    &lt;%= (i+1)%&gt;
                                &lt;/th&gt;
                                &lt;td&gt;
                                    &lt;%= $model.items[i].code %&gt;
                                &lt;/td&gt;
                                &lt;td&gt;
                                    &lt;%= $model.items[i].code %&gt;
                                &lt;/td&gt;
                                &lt;td&gt;
                                    &lt;%= $model.items[i].name %&gt;
                                &lt;/td&gt;
                            &lt;/tr&gt;
                            &lt;%}%&gt;
                    &lt;/tbody&gt;
                    &lt;tfoot&gt;
                        &lt;tr&gt;
                            &lt;td colspan=&quot;4&quot;&gt;Total items: &lt;%= $model.items.length%&gt;&lt;/td&gt;
                        &lt;/tr&gt;
                    &lt;/tfoot&gt;
                &lt;/table&gt;
        &lt;/div&gt;
    &lt;/body&gt;
&lt;/partial&gt;
</code>
<hr/>
<h4>Tags</h4>
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Tag</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>&lt;%</td>
      <td>Script tag (for control-flow, no output)</td>
      <td><code><% let name='Pouya Faridi'; %><code></td>
      </tr>
      <tr>
        <th>2</th>
        <td>&lt;%_</td>
        <td>Script tag with whitespace slurping. Removes all whitespace before it.</td>
        <td><code><%_ let name='Pouya Faridi'; %><code></td>
      </tr>
      <tr>
        <th>3</th>
        <td>&lt;%=</td>
        <td>Writes the value into the template as a plain text(i.e. it ignores HTML tags)</td>
        <td>
          <p><code><% let name = 'Pouya Faridi'; %><%=name%></code></p>
        <p>Or:</p>
        <p><code><% let name = '&lt;b style=&quot;color:#f00&quot;&gt;Pouya Faridi&lt;/b&gt;' %><%=name%></code></p>
        <p style="margin-top: 7px;">Output:&nbsp;&nbsp;=>&nbsp;&nbsp;Pouya Faridi</p>
      </td>
    </tr>
    <tr>
      <th>4</th>
      <td>&lt;%-</td>
      <td>Writes the value into the template. HTML tags will be rendered.</td>
      <td>
        <p><code><% let name = '&lt;b style=&quot;color:#f00&quot;&gt;Pouya Faridi&lt;/b&gt;' %></code></p>
        <p><code><%=name%></code></p>
        <p style="margin-top: 7px;">Output&nbsp;&nbsp;=>&nbsp;&nbsp;<b style="color:#f00">Pouya Faridi</b></p>
      </td>
    </tr>
    <tr>
      <th>5</th>
      <td>&lt;%#</td>
      <td>Comment tag. Nothing will be write on the document, no script will be executed.</td>
      <td><code>&lt;%# Hello, I'm Pouya Faridi. %></code></td>
    </tr>
    <tr>
      <th>6</th>
      <td>&lt;%%</td>
      <td>Outputs a literal '&lt;%'</td>
      <td><code>&lt;%%%></code></td>
    </tr>
  </tbody>
</table>
