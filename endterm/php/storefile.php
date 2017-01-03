<html>
<head>
<title>Fengyang Zhang's Web Project</title>
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
  <?php
    if ($_FILES['picture']['name']==""){
      echo "You didn't choose a picture to upload, please <a href=../html/image.html>go back</a> and choose it";    
      exit;
    }
    $rand1=rand(0,9);
    $rand2=rand(0,9);
    $rand3=rand(0,9);
    $filename="image".$rand1.$rand2.$rand3;
    $oldfilename=$_FILES['picture']['name'];
    $filetype=substr($oldfilename,strrpos($oldfilename,"."),strlen($oldfilename)-strrpos($oldfilename,"."));
    if(($filetype!='.png')&&($filetype!='.PNG')&&($filetype!='.jpg')&&($filetype!='.JPG')){
      echo "<script>alert('Not an accepted type!');</script>";
      echo "<script>location.href='../html/image.html';</script>";
      exit;
    }
    if ($_FILES['picture']['size']>1000000) {
      echo "<script>alert('The file is too large to upload!');</script>";
      echo "<script>location.href='../html/image.html';</script>";
      exit;
    }
    $filename=$filename.$filetype; 
    $savedir='images/'.$filename;
    if(move_uploaded_file($_FILES['picture']['tmp_name'],$savedir)){
      $file_name=basename($savedir);
    }else{
      echo "<script language=javascript>";
      echo "alert('Sorry, cannot write into directory!');";
      echo "location.href='../html/image.html';";
      echo "</script>";
      exit;
    }
    echo "<h1>Your image has been uploaded! </h1><br/>";
    echo "<h1>You can <a href=../html/image.html>upload another one</a></h1>";
  ?>
</body>
</html>
