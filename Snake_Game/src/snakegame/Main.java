package snakegame;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;

import java.io.IOException;

/**
 * Main entry point for the Snake game application.
 * This class extends {@link javafx.application.Application} and sets up the primary stage for the game.
 *
 * @author Nicole Guri - modified
 */
public class Main extends Application {

    /**
     * The main method that launches the JavaFX application.
     *
     * @param args Command line arguments passed to the application.
     */
    public static void main(String[] args) {
        // Launch the JavaFX application
        launch(args);
    }

    /**
     * Starts the primary stage of the application by loading the FXML view,
     * setting up the scene, and displaying the stage.
     *
     * @param primaryStage The primary stage for this application, onto which
     *                     the application scene can be set. The primary stage will be embedded in
     *                     the JavaFX Runtime when the application is launched.
     * @throws IOException If the FXML file is not found or cannot be loaded.
     */
    @Override
    public void start(Stage primaryStage) throws IOException {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/views/startview.fxml"));
        Parent root = loader.load();

        // Set the scene and show the stage
        Scene scene = new Scene(root);
        primaryStage.setScene(scene);
        primaryStage.setTitle("Snake Game");
        primaryStage.show();
        primaryStage.show();

        // Set the close request handler
        primaryStage.setOnCloseRequest(this::handleStageClose);

    }

    /**
     * Handles the close request for a stage.
     * When this method is called, it will terminate the JavaFX application.
     *
     * @param event The window event associated with the close request.
     */
    private void handleStageClose(WindowEvent event) {
        Platform.exit();
    }
}
