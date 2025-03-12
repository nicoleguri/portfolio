package snakegame;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

/**
 * This class provides utility methods for managing the game scores in the Snake game.
 * It includes functionality to save and load scores to and from a file.
 *
 * @author Nicole Guri
 */
public class ScoreUtils {

    /**
     * Constant representing the file name where the scores are stored.
     */
    private static final String SCORE_FILE = "scores.txt"; // File to store the scores

    /**
     * Saves a given score to the score file.
     * The score is appended to the end of the file, each on a new line.
     * In case of an IOException, it prints the stack trace.
     *
     * @param score The score to be saved.
     */
    public static void saveScore(int score) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(SCORE_FILE, true))) {
            writer.write(score + "\n"); // Write the score and a newline
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Loads the high scores from the score file.
     * This method reads all the lines from the score file and returns them as a list.
     *
     * @return A List of Strings, each representing a high score.
     * @throws IOException If there is an error reading the file.
     */
    public static List<String> loadScores() throws IOException {
        return Files.readAllLines(Paths.get(SCORE_FILE));
    }
}

