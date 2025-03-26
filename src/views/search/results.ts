<div class="main-container">
  <%_ if (results.length === 0) { -%>
  <h5 class="text-center text-muted font-weight-light">Nothing found</h5>
  <%_ } else { -%>
  <%_ results.forEach(function(result) { -%>
  <a class="d-block h6" href="<%= result.url %>"><%= result.name %></a>
  <div class="mb-2">
    <%_ result.categories.forEach(function(category) { -%>
    <a class="btn btn-sm btn-outline-dark mb-2 mr-2" href="<%= category.url %>"><%= category.name %></a>
    <%_ }) -%>
  </div>
  <%_ }) -%>
  <%_ } -%>
</div>
