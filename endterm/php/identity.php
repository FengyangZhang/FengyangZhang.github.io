<?php
    if ($_POST['action'] == "check") {
        session_start();
        if (isset($_SESSION["name"])) {
            $response = 'success';
        } else {
            $response = 'error';
        }
        echo $response;
    }

    if ($_POST['action'] == "signoff") {
        session_start();
        $_SESSION["name"] = null;
    }
?>