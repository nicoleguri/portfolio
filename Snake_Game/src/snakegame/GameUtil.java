package snakegame;

import javafx.scene.image.Image;

import java.util.Objects;

/**
 * Utility class containing methods to assist in the game's functionality.
 * This class provides methods for loading resources such as images.
 *
 * @author Nicole Guri - modified
 */
public class GameUtil {

	/**
	 * Retrieves an image from the specified path. If the image is not found or an error occurs,
	 * the method prints an error message and returns null.
	 *
	 * @param imagePath The relative path to the image file.
	 * @return An {@code Image} object if the image is successfully loaded, otherwise null.
	 * @throws IllegalArgumentException If the image cannot be found or if there's an error loading the image.
	 */
	public static Image getImage(String imagePath) {
		Image image = new Image(Objects.requireNonNull(GameUtil.class.getResourceAsStream("/" + imagePath)));
		if (image.isError()) {
			throw new IllegalArgumentException("Cannot find image: " + imagePath);
		}
		return image;
	}
}
