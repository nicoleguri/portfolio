package snakegame;


import javafx.geometry.Point2D;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.scene.canvas.GraphicsContext;


/**
 * Controller class for the snake in the Snake game.
 * Manages the snake's movements, direction changes, collision detection, and drawing on the canvas.
 *
 * @author Nicole Guri
 */
public class SnakeController {
    private final SnakeModel snakeModel;
    private final Scene scene;

    /**
     * Constructs a SnakeController with a given SnakeModel and Stage.
     * Sets up key listeners for controlling the snake.
     *
     * @param snakeModel The SnakeModel object representing the snake.
     * @param stage The Stage object where the game is displayed.
     */
    public SnakeController(SnakeModel snakeModel, Stage stage) {
        this.snakeModel = snakeModel;
        this.scene = stage.getScene();
        setupKeyListeners();
    }

    /**
     * Sets up key listeners on the scene for snake movement control.
     */
    public void setupKeyListeners() {
        final int normalSpeed = 2;
        final int fastSpeed = 6;
        scene.setOnKeyPressed(e -> {
            snakeModel.setSpeed(fastSpeed); // Increase speed
            switch (e.getCode()) {
                case UP -> {
                    if (snakeModel.getCurrentDirection() != SnakeModel.Direction.DOWN) {
                        snakeModel.changeDirection(SnakeModel.Direction.UP);
                    }
                }
                case DOWN -> {
                    if (snakeModel.getCurrentDirection() != SnakeModel.Direction.UP) {
                        snakeModel.changeDirection(SnakeModel.Direction.DOWN);
                    }
                }
                case LEFT -> {
                    if (snakeModel.getCurrentDirection() != SnakeModel.Direction.RIGHT) {
                        snakeModel.changeDirection(SnakeModel.Direction.LEFT);
                    }
                }
                case RIGHT -> {
                    if (snakeModel.getCurrentDirection() != SnakeModel.Direction.LEFT) {
                        snakeModel.changeDirection(SnakeModel.Direction.RIGHT);
                    }
                }
                default -> {
                }
            }
        });
        // Key Released
        scene.setOnKeyReleased(e -> {
            snakeModel.setSpeed(normalSpeed); // Reset to normal speed
        });
    }

    /**
     * Moves the snake according to its current direction.
     */
    public void move() {
        if(snakeModel.currentDirection == SnakeModel.Direction.UP) {
            snakeModel.y -= snakeModel.speed_XY;
        } else if(snakeModel.currentDirection == SnakeModel.Direction.DOWN) {
            snakeModel.y += snakeModel.speed_XY;
        } else if(snakeModel.currentDirection == SnakeModel.Direction.LEFT) {
            snakeModel.x -= snakeModel.speed_XY;
        } else if(snakeModel.currentDirection == SnakeModel.Direction.RIGHT) {
            snakeModel.x += snakeModel.speed_XY;
        }
    }

    /**
     * Draws the snake on the canvas, including its head and body.
     *
     * @param gc The GraphicsContext of the canvas on which to draw the snake.
     */
    public void draw(GraphicsContext gc) {

        snakeModel.getBodyPoints().add(new Point2D(snakeModel.x, snakeModel.y));
        move();
        outOfBounds();
        eatBody();

        if (snakeModel.getBodyPointsSize() == (snakeModel.getLength() + 1) * snakeModel.num) {
            snakeModel.getBodyPoints().remove(0);
        }
        gc.drawImage(snakeModel.getHeadImage(), snakeModel.x, snakeModel.y);
        drawBody(gc);
    }

    /**
     * Checks if the snake has eaten its own body, which ends the game.
     */
    public void eatBody() {
        for (Point2D point : snakeModel.getBodyPoints()) {
            for (Point2D point2 : snakeModel.getBodyPoints()) {
                if(point.equals(point2) && point != point2) {
                    snakeModel.alive = false;
                    break;
                }
            }
        }
    }

    /**
     * Draws the snake's body on the canvas.
     *
     * @param gc The GraphicsContext of the canvas on which to draw the snake's body.
     */
    public void drawBody(GraphicsContext gc) {
        int length = snakeModel.getBodyPointsSize() - 1 - snakeModel.num;
        for (int i = length; i >= snakeModel.num; i -= snakeModel.num) {
            Point2D point = snakeModel.getBodyPoint(i);
            gc.drawImage(snakeModel.bodyImage, point.getX(), point.getY());
        }
    }

    /**
     * Checks if the snake has moved out of bounds, which ends the game.
     */
    public void outOfBounds() {
        boolean xOut = (snakeModel.x <= 0 || snakeModel.x >= (870 - snakeModel.getHeadImage().getWidth()));
        boolean yOut = (snakeModel.y <= 0 || snakeModel.y >= (560 - snakeModel.getHeadImage().getHeight()));
        if (xOut || yOut) {
           snakeModel.setAlive(false);
        }
    }

}

