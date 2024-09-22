<h4>Get started</h4>
<p>yarn install aryiosoft-template-engine</p>
<p>or:</p>
<p>npm i aryiosoft-template-engine</p>
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
