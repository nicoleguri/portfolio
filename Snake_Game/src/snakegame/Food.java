package snakegame;

import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.scene.image.Image;
import javafx.geometry.Rectangle2D;

import java.io.Serial;
import java.util.Random;
import java.io.Serializable;


/**
 * Represents the food in the Snake game. This class is responsible for
 * managing the properties of the food such as its position, size, and availability.
 *
 * @author Nicole Guri - modified
 */
public class Food implements Serializable {
    @Serial
    private static final long serialVersionUID = -3641221053272056036L;

    // Boolean property to track if the food is available or not
    private final BooleanProperty available = new SimpleBooleanProperty();

    // Variables to store the position and dimensions of the food
    double x, y, w, h;

    // Image representing the food
    public Image image;

    /**
     * Constructor for Food. Initializes the food's availability,
     * randomly selects an image, and sets its position and size.
     */
    public Food() {
        available.set(true);
        this.image = ImageUtil.images.get(String.valueOf(new Random().nextInt(17)));
        this.w = image.getWidth();
        this.h = image.getHeight();
        this.x = Math.random() * (800 - getImageWidth() + 30);
        this.y = Math.random() * (560 - getImageHeight() - 40);
    }

    /**
     * Gets the bounding rectangle of the food, which is used for collision detection.
     * @return A {@code Rectangle2D} object representing the bounding rectangle of the food.
     */
    public Rectangle2D getRectangle() {
        return new Rectangle2D(x, y, getImageWidth(), getImageHeight());
    }

    /**
     * Gets the width of the food's image.
     * @return The width of the food's image, or 0 if the image is null.
     */
    public double getImageWidth() {
        if (image != null) {
            return image.getWidth();
        }
        return 0;
    }

    /**
     * Gets the height of the food's image.
     * @return The height of the food's image, or 0 if the image is null.
     */
    public double getImageHeight() {
        if (image != null) {
            return image.getHeight();
        }
        return 0;
    }

    /**
     * Checks if the food is available.
     * @return True if the food is available, false otherwise.
     */
    public boolean isAvailable() {
        return available.get();
    }

    /**
     * Sets the availability of the food.
     * @param available A boolean indicating the new availability status of the food.
     */
    public void setAvailable(boolean available) {
        this.available.set(available);
    }

}

