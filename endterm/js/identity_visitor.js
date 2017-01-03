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
        $('#identity').html("<h1>Logged in as <u style='color:#f1c40f;'>visitor</u></h1>"); 
      }
    }
  });
}