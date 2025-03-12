package snakegame;

import javafx.animation.Animation;
import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.geometry.Rectangle2D;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.image.Image;
import javafx.util.Duration;
import java.util.Random;

/**
 * Represents a paddle object in the Snake game.
 * This class manages the movement and rendering of a paddle-like obstacle.
 *
 * @author Nicole Guri
 */
public class Paddle {
    private final Image brickImage;
    private double x, y;
    private final Random random = new Random();
    private final Timeline timeline;

    /**
     * Constructor for Paddle. Loads the brick image and initializes the timeline for movement.
     */
    public Paddle() {
        // Load the brick image
        this.brickImage =ImageUtil.images.get("lego-brick");
        if (this.brickImage == null) {
            throw new RuntimeException("Image could not be loaded: lego-brick");
        }
        this.timeline = createTimeline();
        resetBrick();
    }

    /**
     * Resets the brick to its starting position.
     */
    private void resetBrick() {
        x = -brickImage.getWidth(); // start off-screen
        y = 30 + (540 - 30) * random.nextDouble(); // random Y between 30 and 540
    }

    /**
     * Updates the position of the paddle, moving it across the screen.
     */
    public void update() {
        double speed = 3;
        x += speed;
        // If the brick has moved off the right side of the stage, reset its position
        if (x > 800) { // Assuming stage width is 800
            resetBrick();
        }
    }

    /**
     * Draws the paddle on the given GraphicsContext.
     *
     * @param gc The GraphicsContext on which to draw the paddle.
     */
    public void draw(GraphicsContext gc) {
        gc.drawImage(brickImage, x, y);
    }

    /**
     * Starts the paddle's movement if it's not already running.
     */
    public void start() {
        if (!timeline.getStatus().equals(Animation.Status.RUNNING)) {
            timeline.play();
        }
    }

    /**
     * Gets the bounds of the paddle as a Rectangle2D.
     *
     * @return A Rectangle2D object representing the bounds of the paddle.
     */
    public Rectangle2D getBrickBounds() {
        return new Rectangle2D(x, y, brickImage.getWidth(), brickImage.getHeight());
    }

    /**
     * Creates and returns a Timeline for updating and redrawing the paddle.
     *
     * @return A Timeline object for paddle movement.
     */
    public Timeline createTimeline() {
        // Create a Timeline that updates and redraws the brick
        Timeline timeline = new Timeline(new KeyFrame(Duration.millis(33), e -> update())); // 33ms for 30 FPS
        timeline.setCycleCount(Timeline.INDEFINITE);

        // Delay the start of the timeline by 4 seconds after the brick disappears
        timeline.setOnFinished(e -> {
            try {
                Thread.sleep(4000); // 4 second delay
            } catch (InterruptedException ex) {
                ex.printStackTrace();
            }
            timeline.play();
        });

        return timeline;
    }
}
