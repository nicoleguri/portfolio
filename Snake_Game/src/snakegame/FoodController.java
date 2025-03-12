package snakegame;

import javafx.scene.canvas.GraphicsContext;

/**
 * Controls the behavior and rendering of food in the Snake game.
 * This class is responsible for managing the food's interaction with the snake and updating the game's score.
 *
 * @author Nicole Guri
 */
public class FoodController {
    Food food;
    ScoreModel scoreModel;

    /**
     * Constructs a FoodController with a specific instance of Food and ScoreModel.
     *
     * @param food The Food object that this controller will manage.
     * @param model The ScoreModel object for updating the score based on game events.
     */
    public FoodController(Food food, ScoreModel model){
        this.food = food;
        this.scoreModel = model;
    }

    /**
     * Handles the scenario when the snake eats the food.
     * It checks for collision between the snake and food, updates the snake's length,
     * marks the food as eaten, and updates the score.
     *
     * @param snakeModel The SnakeModel representing the snake in the game.
     */
    public void eaten(SnakeModel snakeModel){
        // Check if the snake has intersected the food, the food is available, and the snake is alive
        if (snakeModel.getRectangle().intersects(food.getRectangle()) && food.isAvailable() && snakeModel.alive)
        {
            food.setAvailable(false);
            snakeModel.grow(snakeModel.getLength() + 1); //increase the length of the snake by 1
            scoreModel.incrementScore(scoreModel.getScore() + 5); //increase score by 5
        }
    }

    /**
     * Draws the food on the canvas using the provided GraphicsContext.
     * It renders the food's image at its current position.
     *
     * @param gc The GraphicsContext of the canvas on which to draw the food.
     */
    public void draw(GraphicsContext gc) {
        gc.drawImage(food.image, food.x, food.y);
    }
}
