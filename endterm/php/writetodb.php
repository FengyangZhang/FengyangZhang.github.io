<?php
    $servername = "localhost";
    $username = "root";
    $password_db = "root";
    $database = "webdev";

    $conn = mysqli_connect($servername, $username, $password_db, $database);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 

    if ($_POST['action'] == "signup") {
        $name = $_POST['name'];
        $password = $_POST['password'];
        $query_user = "SELECT * FROM author_info WHERE user_id='$name'";
        $user_info = mysqli_query($conn, $query_user);
        if(mysqli_num_rows($user_info)>=1) {
            $response = 'error';
        }
        else {
            $query_newuser = "INSERT INTO author_info (user_id, passwd) VALUES ('$name', '$password')";
            mysqli_query($conn, $query_newuser);
            $response = 'success';
        }
        echo $response;
    }

    if ($_POST['action'] == "signin") {
        $name = $_POST['name'];
        $password = $_POST['password'];
        $query_user = "SELECT * FROM author_info WHERE user_id='$name'";
        $user_info = mysqli_query($conn, $query_user);
        if(mysqli_num_rows($user_info)==1) {
            $row = mysqli_fetch_row($user_info);
            if($password == $row[1]) {
                session_start(); 
                $_SESSION["name"] = $name;
                $response = 'success';
            }
            else {
                $response = 'error';
            }
        }
        else{
            $response = 'error';
        }
        echo $response;
    }

    if ($_POST['action'] == "classentry") {
        $names = $_POST['names'];
        $grades = $_POST['grades'];
        for ($i = 0; $i < count($names); $i++) {
            $name = $names[$i];
            $grade = $grades[$i];
            $query_insert = "INSERT INTO author_grade (class_name, grade) VALUES ('$name', '$grade')";
            mysqli_query($conn, $query_insert);    
        }
        
    }

    mysqli_close($conn);
?>