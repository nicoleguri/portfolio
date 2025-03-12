package snakegame;

/**
 * Model class for maintaining the score in the Snake game.
 * This class is responsible for storing and updating the game's score.
 *
 * @author Nicole Guri
 */
public class ScoreModel {
    public int score;

    /**
     * Constructs a ScoreModel with an initial score of 0.
     */
    public ScoreModel(){
        this.score = 0;
    }

    /**
     * Increments the score by a specified amount.
     *
     * @param newScore The amount by which to increment the score.
     */
    public void incrementScore(int newScore){
        this.score = newScore;
    }

    /**
     * Retrieves the current score.
     *
     * @return The current score.
     */
    public int getScore(){
        return score;
    }
}
