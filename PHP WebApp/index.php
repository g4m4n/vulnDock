<!DOCTYPE html>
<html>
<head>
    <title>Welcome Page</title>
    <link rel="stylesheet" type="text/css" href="css/styles.css">
</head>
<body>
    <?php
    // Check if form is submitted
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get input value from form
        $host = $_POST['host'];

        // Execute ping command and capture output
        $ping_result = shell_exec("ping -c 4 $host");

        // Display ping result
        echo "<pre>$ping_result</pre>";
    }
    ?>

    <h2>Welcome!</h2>
    
    <p>Please enter the host address or domain name to ping:</p>

    <!-- Form for submitting ping command -->
    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
        <label for="host">Host:</label><br>
        <input type="text" id="host" name="host"><br><br>
        <input type="submit" value="Ping">
    </form>
    <p>Want to leave a comment? <a href="comments.php">Click here</a> to go to the comment section.</p>
    <p>Want to register? <a href="register.php">Click here</a></p>
    <a href="login.php">Login</a>
</body>
</html>
