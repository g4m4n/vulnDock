<!DOCTYPE html>
<html>
<head>
    <title>Comments Page</title>
    <link rel="stylesheet" type="text/css" href="css/styles.css">
</head>
<body>
    <h2>Comments Section</h2>
    
    <!-- Form for submitting comments -->
    <form action="scripts/process_comment.php" method="post">
        <label for="username">Username:</label><br>
        <input type="text" id="username" name="username"><br>
        <label for="comment">Comment:</label><br>
        <textarea id="comment" name="comment" rows="4" cols="50"></textarea><br><br>
        <input type="submit" value="Submit">
    </form>
    
    <hr>
    
    <!-- Displaying existing comments -->
    <h3>Existing Comments:</h3>
    <?php
    // Retrieve and display existing comments from a hypothetical database
    // This can be replaced with actual database retrieval logic
    $comments = array(
        array("username" => "User1", "comment" => "This is comment 1."),
        array("username" => "User2", "comment" => "This is comment 2."),
        array("username" => "User3", "comment" => "This is comment 3.")
    );

    foreach ($comments as $comment) {
        echo "<div class='comment'>";
        echo "<strong>" . $comment['username'] . "</strong>: ";
        echo $comment['comment'];
        echo "</div>";
    }
    ?>
</body>
</html>
