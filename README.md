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
      <td>
        <%< /td>
      <td>Script tag (for control-flow, no output)</td>
      <td><code><% let name='Pouya Faridi'; %><code></td>
      </tr>
      <tr>
        <th>2</th>
        <td><%_</td>
        <td>Script tag with whitespace slurping. Removes all whitespace before it.</td>
        <td><code><%_ let name='Pouya Faridi'; %><code></td>
      </tr>
      <tr>
        <th>3</th>
        <td><%=</td>
        <td>Writes the value into the template as a plain text(i.e. it ignores HTML tags)</td>
        <td>
          <code><% let name = 'Pouya Faridi'; %><%=name%></code>
        Or:</br>
        <code><% let name = '<b style="color:#f00">Pouya Faridi</b>'; %><%=name%></code>
        Output:</br>
        <span>Pouya Faridi</span>
      </td>
    </tr>
    <tr>
      <th>4</th>
      <td><%-< /td>
      <td>Writes the value into the template. HTML tags will be rendered.</td>
      <td>
        <code><% let name = '<b style="color:#f00">Pouya Faridi</b>'; %><%=name%></code>
        <p>Output&nbsp;&nbsp;=>&nbsp;&nbsp;<b style="color:#f00">Pouya Faridi</b></p>
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
