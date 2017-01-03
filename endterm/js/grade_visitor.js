window.onload=queryAll;

function onPageLoad() {
    checkIdentity();
    queryAll();
}

function queryAll() {
    var url = "../php/readfromdb.php";
    $.ajax({
        type: "POST",
        url: url,
        data: {'action': 'queryall'},
        success: function(data) {
            var pairs = eval(data);
            for (var i = 0; i < pairs.length; i++) {
                var newDiv = document.createElement("div");
                newDiv.innerHTML='<li><i>'+ pairs[i][0] + ':' + '\t' + pairs[i][1] + '</i></li>';
                document.getElementById("classes").appendChild(newDiv);
            }
        }
    });
}

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


$("#search").click(function(e) {
    var url = "../php/readfromdb.php";
    var name = $('#name').val();
    if(name == '' || name == null) {
        return;
    }
    $.ajax({
        type: "POST",
        url: url,
        data: {'action': 'queryaclass', 'name': name},
        success: function(data) {
            var pairs = eval(data);
            $('#classes').empty();
            for (var i = 0; i < pairs.length; i++) {
                var newDiv = document.createElement("div");
                newDiv.innerHTML='<li><i>'+ pairs[i][0] + ':' + '\t' + pairs[i][1] + '</i></li>';
                document.getElementById("classes").appendChild(newDiv);
            }
        }
    });
    e.preventDefault();    
});