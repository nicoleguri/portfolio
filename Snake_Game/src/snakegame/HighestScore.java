package snakegame;

import javafx.fxml.FXML;
import javafx.scene.control.ListView;
import java.io.IOException;
import java.util.List;

/**
 * This class is responsible for managing and displaying the high scores in the Snake game.
 * It interacts with the user interface, specifically a TextArea, to present the scores to the player.
 *
 * @author Nicole Guri
 */
public class HighestScore {

    /**
     * The TextArea defined in the FXML file for displaying high scores.
     * This TextArea is used to show the list of high scores to the user.
     */
    @FXML
    private ListView<String> scoreList;  // The TextArea defined in your FXML for displaying scores

    /**
     * Initializes the high scores display.
     * This method is called when the FXML is loaded. It retrieves the high scores from storage
     * and populates the TextArea with these scores. In case of an error, it displays a failure message.
     */
    @FXML
    public void initialize() {
        try {
            // Load the high scores
            List<String> scores = ScoreUtils.loadScores();

            // Populate the ListView with scores
            scoreList.getItems().addAll(scores);

            // Scroll to the last item (latest score)
            if (!scores.isEmpty()) {
                scoreList.scrollTo(scores.size() - 1);
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}

