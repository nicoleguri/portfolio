package snakegame;

import javafx.scene.paint.Color;

/**
 * This class manages the game settings for the Snake game.
 * It primarily handles the storage and retrieval of user-selected settings,
 * such as the background color of the game scene.
 *
 * @author - Nicole Guri
 */
public class GameSettings {

    /**
     * Static variable to hold the currently selected background color.
     */
    public static Color selectedBackgroundColor;

    private static String selectedMusic;

    /**
     * Retrieves the currently selected background color.
     * This method is used to obtain the color that the user has chosen for the game's background.
     *
     * @return The currently selected background color. Returns {@code null} if no color has been set.
     */
    public static Color getSelectedBackgroundColor() {
        return selectedBackgroundColor;
    }

    /**
     * Sets the background color for the game.
     * This method is used to update the game's background color based on the user's selection.
     *
     * @param color The new background color to set. It should not be null.
     */
    public static void setSelectedBackgroundColor(Color color) {
        selectedBackgroundColor = color;
    }

    /**
     * Sets the background music for the game.
     * This method allows the user to select and update the background music to be played during the game.
     * The chosen music is stored as a static variable and can be retrieved and played by the game controller.
     *
     * @param music The name or identifier of the music to be set. It should not be null.
     */
    public static void setSelectedMusic(String music) {
        selectedMusic = music;
    }

    /**
     * Retrieves the currently selected background music.
     * This method is used to obtain the music selection made by the user for the game's background.
     * The returned value can be used by the music player to load and play the corresponding music file.
     *
     * @return The currently selected background music. Returns {@code null} if no music has been set.
     */
    public static String getSelectedMusic() {
        return selectedMusic;
    }
}


