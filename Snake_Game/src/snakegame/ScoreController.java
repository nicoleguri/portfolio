package snakegame;

import javafx.scene.canvas.GraphicsContext;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;

/**
 * Controller class for managing and rendering the game score in the Snake game.
 * This class is responsible for drawing the score on the screen.
 *
 * @author Nicole Guri
 */
public class ScoreController {
    ScoreModel scoreModel;

    /**
     * Constructs a ScoreController with the specified ScoreModel.
     *
     * @param scoreModel The ScoreModel instance that this controller will use to obtain score information.
     */
    public ScoreController(ScoreModel scoreModel){
        this.scoreModel = scoreModel;
    }

    /**
     * Draws the current score on the screen using the provided GraphicsContext.
     *
     * @param gc The GraphicsContext of the canvas on which the score is to be drawn.
     */
    public void drawScore(GraphicsContext gc){
        gc.setFont(Font.font("Arial", FontWeight.BOLD, 30));
        gc.setFill(Color.ORANGE); // Set text color
        gc.fillText("Score: " + scoreModel.getScore(), 60, 40);
    }
}
