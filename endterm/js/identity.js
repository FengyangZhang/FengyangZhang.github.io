window.onload=checkIdentity;

function checkIdentity() {
    var url = "../php/identity.php";
    $.ajax({
    type: "POST",
    url: url,
    data: {'action': 'check'},
    success: function(data) {
      if(data == 'success') {
        $('#identity').html("<h1>Logged in as <u style='color:#f1c40f;'>administrator</u></h1>");
      } else if (data == 'error'){
        var message = "You are not allowed to access this page!";
        alert(message);
        window.location.href = "../index.html";
      }
    }
  });
}

$("#signoff").click(function(e) {
    var url = "../php/identity.php";
    $.ajax({
    type: "POST",
    url: url,
    data: {'action': 'signoff'},
    success: function(data) {
        var message = "Successfully signed off!";
        alert(message);
        window.location.href = "../index.html";
    }
  });
  e.preventDefault(); 
});