package snakegame;

import javafx.scene.SnapshotParameters;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.image.Image;
import javafx.scene.transform.Rotate;
import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for managing and manipulating images in the Snake game.
 * This class loads and stores game images and provides utility methods for image manipulation.
 *
 * @author Nicole Guri - modified
 */
public class ImageUtil
{
	// Static map to store game images with their identifiers.
	public static Map<String, Image> images = new HashMap<>();

	// Static initializer block to load images into the map.
	static
	{
		// snake
		images.put("snake-head-right", GameUtil.getImage("images/snake-head-right.png"));
		images.put("snake-body", GameUtil.getImage("images/snake-body.png"));
		// obstacles
		images.put("0", GameUtil.getImage("images/food-kiwi.png"));
		images.put("1", GameUtil.getImage("images/food-lemon.png"));
		images.put("2", GameUtil.getImage("images/food-litchi.png"));
		images.put("3", GameUtil.getImage("images/food-mango.png"));
		images.put("4", GameUtil.getImage("images/food-apple.png"));
		images.put("5", GameUtil.getImage("images/food-banana.png"));
		images.put("6", GameUtil.getImage("images/food-blueberry.png"));
		images.put("7", GameUtil.getImage("images/food-cherry.png"));
		images.put("8", GameUtil.getImage("images/food-durian.png"));
		images.put("9", GameUtil.getImage("images/food-grape.png"));
		images.put("10", GameUtil.getImage("images/food-grapefruit.png"));
		images.put("11", GameUtil.getImage("images/food-peach.png"));
		images.put("12", GameUtil.getImage("images/food-pear.png"));
		images.put("13", GameUtil.getImage("images/food-orange.png"));
		images.put("14", GameUtil.getImage("images/food-pineapple.png"));
		images.put("15", GameUtil.getImage("images/food-strawberry.png"));
		images.put("16", GameUtil.getImage("images/food-watermelon.png"));
		images.put("UI-background", GameUtil.getImage("images/UI-background3.jpg"));
		images.put("game-scene-01", GameUtil.getImage("images/game-scene-01.jpg"));
		images.put("lego-brick", GameUtil.getImage("images/lego-brick.png"));
	}

	/**
	 * Rotates an image by a given angle.
	 * This method creates a new canvas, applies a rotation transformation to the graphics context,
	 * and then draws the rotated image.
	 *
	 * @param img The image to be rotated.
	 * @param angle The angle of rotation in degrees.
	 * @return A new Image object representing the rotated image.
	 */
	public static Image rotateImage(Image img, double angle) {
		Canvas canvas = new Canvas(img.getWidth(), img.getHeight());
		GraphicsContext gc = canvas.getGraphicsContext2D();

		Rotate rotate = new Rotate(angle, img.getWidth() / 2.0, img.getHeight() / 2.0);
		gc.save();
		gc.setTransform(rotate.getMxx(), rotate.getMyx(), rotate.getMxy(), rotate.getMyy(), rotate.getTx(), rotate.getTy());
		gc.drawImage(img, 0, 0);
		gc.restore();

		SnapshotParameters params = new SnapshotParameters();
		params.setFill(javafx.scene.paint.Color.TRANSPARENT);

		return canvas.snapshot(params, null);
	}

}
