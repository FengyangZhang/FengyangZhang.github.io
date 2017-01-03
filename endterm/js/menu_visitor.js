$("#grade").click(function(e) {
    var href = "grade_visitor.html";
    var windowname = "grade";
    window.open(href, windowname, 'height=400,width=400,left=100,top=100,resizable=yes,scrollbars=yes,toolbar=no,status=yes'); 
});

$("#picture").click(function(e) {
    $("#images").load("../php/loadimages.php");
});