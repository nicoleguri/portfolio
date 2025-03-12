package snakegame;

import javafx.geometry.Point2D;
import javafx.geometry.Rectangle2D;
import javafx.scene.image.Image;
import java.util.LinkedList;
import java.util.List;

/**
 * Model class representing the snake in the Snake game.
 * This class holds data related to the snake's position, size, direction, and state.
 *
 * @author Nicole Guri - modified
 */
public class SnakeModel {
    public static final double SNAKE_HEAD_WIDTH = 25;
    public static final double SNAKE_HEAD_HEIGHT = 25;
    public Image headImage = ImageUtil.images.get("snake-head-right");
    public Image bodyImage = ImageUtil.images.get("snake-body");
    public int speed_XY; //snake's speed
    public int num; //number of points per body segment
    public int length; //length of snake
    public boolean alive = true; //state of the snake
    public Direction currentDirection = Direction.RIGHT; //current movement direction
    public List<Point2D> bodyPoints = new LinkedList<>(); //points that make up the snakes body
    public boolean hasJustEaten = false; //flag to indicate that the snake has just eaten
    public int x, y; //position of the snake's head

    /**
     * Constructs a new SnakeModel with a starting position.
     *
     * @param startX The starting X coordinate of the snake.
     * @param startY The starting Y coordinate of the snake.
     */
    public SnakeModel(int startX, int startY) {
        this.x = startX;
        this.y = startY;
        this.speed_XY = 2;
        this.length = 1;
        this.num = (int)(getHeadImage().getWidth() / speed_XY);
    }

    /**
     * Gets the rectangle representing the snake's head, used for collision detection.
     *
     * @return A Rectangle2D object representing the snake's head.
     */
    public Rectangle2D getRectangle() {
        return new Rectangle2D(x, y, SNAKE_HEAD_WIDTH, SNAKE_HEAD_HEIGHT);
    }

    /**
     * Increases the length of the snake.
     *
     * @param i The new length of the snake.
     */
    public void grow(int i) {
        this.length = i;
        hasJustEaten = true;
    }

    /**
     * Changes the direction of the snake.
     *
     * @param newDirection The new direction for the snake.
     */
    public void changeDirection(Direction newDirection) {
        currentDirection = newDirection;
    }

    /**
     * Gets the list of points that make up the snake's body.
     *
     * @return A list of Point2D objects representing the snake's body.
     */
    public List<Point2D> getBodyPoints() {
        return bodyPoints;
    }

    /**
     * Gets the size of the list containing the snake's body points.
     *
     * @return The size of the body points list.
     */
    public int getBodyPointsSize(){
        return bodyPoints.size();
    }

    /**
     * Gets a specific point from the snake's body.
     *
     * @param i The index of the body point to retrieve.
     * @return The Point2D object at the specified index in the body points list.
     */
    public Point2D getBodyPoint(int i){
        return bodyPoints.get(i);
    }

    /**
     * Gets the current direction of the snake.
     *
     * @return The current direction of the snake.
     */
    public Direction getCurrentDirection() {
        return currentDirection;
    }

    /**
     * Gets the current length of the snake.
     *
     * @return The length of the snake.
     */
    public int getLength() {
        return length;
    }

    /**
     * Checks if the snake is alive.
     *
     * @return True if the snake is alive, false otherwise.
     */
    public boolean isAlive() {
        return alive;
    }

    /**
     * Sets the state of the snake to alive or dead.
     *
     * @param alive The state to set for the snake.
     */
    public void setAlive(boolean alive) {
        this.alive = alive;
    }

    /**
     * Enumeration for the possible directions the snake can move.
     */
    public enum Direction {
        UP, DOWN, LEFT, RIGHT
    }

    /**
     * Gets the image of the snake's head, rotated based on its current direction.
     *
     * @return An Image object representing the snake's head.
     */
    public Image getHeadImage() {
        if (currentDirection == Direction.RIGHT) {
            return headImage; // Original image is facing right, no rotation needed
        } else {
            // Rotate the image based on the current direction
            double angle = switch (currentDirection) {
                case UP -> -90;
                case DOWN -> 90;
                case LEFT -> -180;
                default -> 0;
            };
            return ImageUtil.rotateImage(headImage, angle);
        }
    }

/**
 * Sets the speed of the snake.
 *
 * @param speed The speed to set for the snake
 */
    public void setSpeed(int speed) {
        this.speed_XY = speed;
    }
}




