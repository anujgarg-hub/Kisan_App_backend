$(document).ready(function () {
  $.getJSON(
    "http://localhost:3000/farmerpolicies/fetchpolicies",
    function (data) {
      $.each(data, function (index, item) {
        $("#policyid").append(
          $("<option>").text(item.policiesname).val(item.policies_id)
        );
      });
    }
  );
});
