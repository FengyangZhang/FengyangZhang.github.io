<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fengyang Zhang's Web Project</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <?php
        $dir = "./images";
        echo "<h1>The author's images: </h1>";
        if ($dh = opendir($dir)){
            while (($file = readdir($dh))){
                if (substr($file, strrpos($file, ".")+1) == 'png' ||
                    substr($file, strrpos($file, ".")+1) == 'jpg') {
                    echo "<img src='../php/images/".$file."'/>";
                }
            }
            closedir($dh);
        }
    ?>
</body>
</html>
