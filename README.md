<h4>Get started</h4>
<p>yarn install aryiosoft-template-engine</p>
<p>or:</p>
<p>npm i aryiosoft-template-engine</p>
<hr/>
<h4>Initializing the engine</h4>
<code>
  import express, { Request, Response } from 'express';
  import { readFile, readFileSync } from 'fs';
  import path from 'path';
  import * as aryo from 'aryiosoft-template-engine';
</code>
<table>
  <thead>
    <tr>
      <th colspan="4">
        <h4>Tags</h4>
      </th>
    </tr>
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
