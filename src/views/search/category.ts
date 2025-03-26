<div class="main-container mb-3">
  <!-- <h6><%= category.name %></h6> -->

  <div class="card">
    <%_ if (mapUrl) { -%>
    <img src="<%= mapUrl %> " class="d-block w-100 h-auto" />
    <%_ } -%>

    <div class="card-body">
      <h5 class="card-title mb-2"><%= category.name %></h5>
      <% if (description) { %>
      <div><%- description %></div>
      <% } %>
    </div>

    <div class="list-group list-group-flush">
      <% points.forEach(function(point) { %>
      <a href="#" class="list-group-item list-group-item-action">
        <div><%= point.name %></div>
        <div class="text-muted"><%= point.address %></div>
      </a>
      <% }) %>
    </div>
  </div>

</div>