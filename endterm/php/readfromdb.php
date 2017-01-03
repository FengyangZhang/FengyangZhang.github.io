<?php
    $servername = "localhost";
    $username = "root";
    $password_db = "root";
    $database = "webdev";

    $conn = mysqli_connect($servername, $username, $password_db, $database);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 

    if ($_POST['action'] == "queryall") {
        $results = array();
        $query = "SELECT * from author_grade";
        $info = mysqli_query($conn, $query);
        $number = mysqli_num_rows($info);
        for ($i = 0; $i < $number; $i++) {
            $rowarray = array();
            $row = mysqli_fetch_row($info);
            array_push($rowarray, $row[0]);
            array_push($rowarray, $row[1]);
            array_push($results, $rowarray);
        }
        $js_names = json_encode($results);
        echo $js_names;
    }

    if ($_POST['action'] == "queryaclass") {
        $name = $_POST['name'];
        $results = array();
        $name = '%'.$name.'%';
        $query = "SELECT * from author_grade WHERE class_name LIKE '$name'";
        $info = mysqli_query($conn, $query);
        $number = mysqli_num_rows($info);
        for ($i = 0; $i < $number; $i++) {
            $rowarray = array();
            $row = mysqli_fetch_row($info);
            array_push($rowarray, $row[0]);
            array_push($rowarray, $row[1]);
            array_push($results, $rowarray);
        }
        $js_names = json_encode($results);
        echo $js_names;
    }

    mysqli_close($conn);
?>