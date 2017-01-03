function checkoutField(field, alerttxt) {
  if (field==null || field=="") {
      alert(alerttxt);
      return false;
  }
  else {
      return true;
  }
}

$("#signup").click(function(e) {

  var url = "../php/writetodb.php";
  var name = $('#name').val();
  var password = $('#password').val();

  if (checkoutField(name, "Please fill in the username!")==false) {
    name.focus();
    return false
  }

  if (checkoutField(password, "Please fill in the password!")==false) {
    password.focus();
    return false
  }

  $.ajax({
    type: "POST",
    url: url,
    data: {'action': 'signup', 'name': name, 'password': password},
    success: function(data) {
      if(data == 'success') {
        var message = "Signed up successfully！";
        alert(message);
        $('#name').val('');
        $('#password').val('');
      } else if (data == 'error'){
        var message = "Username exists！";
        alert(message);
      }
    }
  });
  e.preventDefault(); 
});

$("#signin").click(function(e) {
  var url = "../php/writetodb.php";
  var name = $('#name').val();
  var password = $('#password').val();

  if (checkoutField(name, "Please fill in the username!")==false) {
    name.focus();
    return false
  }

  if (checkoutField(password, "Please fill in the password!")==false) {
    password.focus();
    return false
  }

  $.ajax({
    type: "POST",
    url: url,
    data: {'action': 'signin', 'name': name, 'password': password},
    success: function(data) {
      if(data == 'success') {
        var message = "Signed in successfully！";
        alert(message);
        window.location.href = "html/menu.html";
      } else if (data == 'error'){
        var message = "Username or password is wrong！";
        alert(message);
      }
    }
  });
  e.preventDefault(); 
});


$("#visitor").click(function(e) {
  var message = "Logged in as visitor!";
  window.location.href = "html/menu_visitor.html";
  alert(message);
  e.preventDefault(); 
});