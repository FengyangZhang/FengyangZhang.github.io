var classnum = 2;
function checkoutAll() {
    var result = true;
    $("input").each(function(i){
        var text = $(this).val();
        if(text ==""){
            alert("Please fill in all the blanks!");
            result = false;
            return result;
        }
    });
    return result;
}
$("#addclass").click(function(e) {
    var newDiv = document.createElement("div");
    newDiv.innerHTML='<li><input type="classname" id="classname" class="classname" placeholder="name" onfocus="this.placeholder=\'\'" onblur="this.placeholder=\'name\'"/><input type="classgrade" id="classgrade" class="classgrade" placeholder="grade" onfocus="this.placeholder=\'\'" onblur="this.placeholder=\'grade\'"/></li>';
    classnum = classnum + 1;
    document.getElementById("classes").appendChild(newDiv);
});

$("#removeclass").click(function(e) {
    if(classnum > 1) {
        $("li:last").remove();
        classnum = classnum - 1; 
    }
});

$("#submit").click(function(e) {
    var status = checkoutAll();
    if(status == false) {
        return;
    }
    var names = new Array();
    var grades = new Array();
    var url = "../php/writetodb.php";
    if(status == true) {
        $("input[id=classname]").each(function(i){
            var text = $(this).val();
            names.push(text);
        });
        $("input[id=classgrade]").each(function(i){
            var text = $(this).val();
            grades.push(text);
        });
    }

    $.ajax({
        type: "POST",
        url: url,
        data: {'action': 'classentry', 'names': names, 'grades': grades},
        success: function(data) {
            alert("Successfully recorded your grades!")
        }
    });
});