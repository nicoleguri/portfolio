package snakegame;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.ColorPicker;
import javafx.scene.control.ComboBox;
import javafx.scene.layout.AnchorPane;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import javafx.event.ActionEvent;
import java.io.IOException;

/**
 * Controller class responsible for handling view transitions in the Snake game.
 * This class manages the transition from the start screen to the main game screen.
 *
 * @author Nicole Guri
 */
public class ViewController {

    @FXML
    private ColorPicker colorPicker;

    @FXML
    private AnchorPane anchorPane;

    @FXML
    private ComboBox<String> musicComboBox;

    @FXML
    private void handleColorChange() {
        Color selectedColor = colorPicker.getValue();
        String hexColor = String.format("#%02X%02X%02X",
                (int) (selectedColor.getRed() * 255),
                (int) (selectedColor.getGreen() * 255),
                (int) (selectedColor.getBlue() * 255));
        anchorPane.setStyle("-fx-background-color: " + hexColor + ";");
    }


    /**
     * Initiates the transition from the start screen to the main game screen.
     * Loads the main game view, sets up the GameController, and plays background music.
     *
     * @param event The ActionEvent triggered by user interaction.
     * @throws IOException If the FXML file for the main view cannot be loaded.
     */
    public void startGame(ActionEvent event) throws IOException {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/views/main.fxml"));
        Parent root = loader.load();
        GameController gameController = loader.getController();

        // Retrieve the current stage from the event source
        Stage currentStage = (Stage) ((javafx.scene.Node) event.getSource()).getScene().getWindow();

        // Store the selected music in GameSettings
        String selectedMusic = musicComboBox.getSelectionModel().getSelectedItem();
        GameSettings.setSelectedMusic(selectedMusic);

        // Create and set the scene on the current stage, then show it
        Scene scene = new Scene(root);
        currentStage.setScene(scene);
        currentStage.setTitle("Snake Game");
        currentStage.show();

        // Store the selected color
        Color selectedColor = colorPicker.getValue();

        // Pass this color to the GameController or store it statically to be retrieved by the GameController
        // For example, using a static variable or singleton pattern
        GameSettings.setSelectedBackgroundColor(selectedColor);

        // Initialize the game controller
        gameController.initialize(currentStage);

    }


}
