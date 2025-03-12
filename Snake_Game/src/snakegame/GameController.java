package snakegame;

import javafx.animation.AnimationTimer;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.canvas.Canvas;
import javafx.scene.canvas.GraphicsContext;
import javafx.scene.image.Image;
import javafx.scene.layout.StackPane;
import javafx.scene.paint.Color;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.animation.PauseTransition;
import javafx.stage.Window;
import javafx.util.Duration;

import java.io.IOException;


/**
 * This class is responsible for controlling the game logic, rendering, and interactions within the Snake game.
 * It handles game initialization, game loop execution, and transitions between game states.
 *
 * @author Nicole Guri
 */

public class GameController {

    @FXML
    private StackPane stackPane = new StackPane();
    private boolean gameLoop = true;
    private Canvas canvas;

    public Scene scene;
    private GraphicsContext gc;
    private Image background;
    private Image fail;
    private SnakeModel snake;
    private Food food;
    private SnakeController snakeController;
    private FoodController foodController;
    private ScoreModel scoreModel;
    private Paddle paddle;
    private ScoreController scoreController;
    private boolean gamePaused = false;

    /**
     * Initializes the game by setting up the background, game elements, and their controllers.
     * It also initializes the canvas and starts the game loop.
     *
     * @param stage The primary stage of the application.
     */

    public void initialize(Stage stage) {
        this.background = ImageUtil.images.get("UI-background");
        this.fail = ImageUtil.images.get("game-scene-01");

        snake = new SnakeModel(100, 100);
        snakeController = new SnakeController(snake, stage);
        scoreModel = new ScoreModel();
        paddle= new Paddle();
        scoreController = new ScoreController(scoreModel);
        food = new Food();
        foodController = new FoodController(food, scoreModel);

        canvas = new Canvas(870, 560);
        stackPane.getChildren().addFirst(canvas);
        canvas.requestFocus();
        gc = canvas.getGraphicsContext2D();

        // Apply the stored selected color
        Color backgroundColor = GameSettings.getSelectedBackgroundColor();
        if (backgroundColor != null) {
            applyBackgroundColor(backgroundColor);
        }

        String selectedMusic = GameSettings.getSelectedMusic();
        if(selectedMusic == null) {
            selectedMusic = "Frogger";
        }
        String musicFile;

        boolean loopMusic = switch (selectedMusic) {
            case "Frogger" -> {
                musicFile = "src/sound/frogger.mp3";
                yield true;
            }
            case "Shota" -> {
                musicFile = "src/sound/shota.mp3";
                yield false;
            }
            case "Tocame" -> {
                musicFile = "src/sound/tocame.mp3";
                yield false;
            }
            default -> throw new IllegalStateException("Unexpected value: " + selectedMusic);
        };
        // Start music based on selection
        MusicPlayer.getMusicPlay(musicFile, loopMusic);

        startGameLoop();
    }

    /**
     * Applies a specified background color to the stack pane.
     * This method updates the stack pane's style to reflect the new color.
     *
     * @param color The color to be applied to the background of the stack pane.
     */
    public void applyBackgroundColor(Color color) {
        Platform.runLater(() -> {
            String hexColor = String.format("#%02X%02X%02X",
                    (int) (color.getRed() * 255),
                    (int) (color.getGreen() * 255),
                    (int) (color.getBlue() * 255));
            stackPane.setStyle("-fx-background-color: " + hexColor + ";");
        });
    }

    /**
     * Sets the scene for the game and sets up key listeners for snake control.
     * @param scene The scene of the application.
     */

    public void setScene(Scene scene) {
        this.scene = scene;
        snakeController.setupKeyListeners(); // Assuming this is where you set up key listeners
    }

    /**
     * Starts the game loop using an {@code AnimationTimer}.
     * This method contains the main game logic,
     * including rendering the game elements and handling game state transitions.
     */
    public void startGameLoop() {
        new AnimationTimer() {
            @Override
            public void handle(long now) {
                if(gameLoop){
                    if (!gamePaused) {
                        gc.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
                        gc.drawImage(background, 0, 0);
                        if (snake.isAlive()) {
                            snakeController.draw(gc);
                            if (food.isAvailable()) {
                                foodController.draw(gc);
                                foodController.eaten(snake);
                            } else {
                                food = new Food();
                                foodController = new FoodController(food, scoreModel);
                            }
                        } else {
                            gameLoop = false; // Stop the game loop
                            snake.setAlive(false);

                        }
                        scoreController.drawScore(gc);

                        if (scoreModel.getScore() >= 15) {
                            paddle.draw(gc);  // Continuously draw the paddle
                            paddle.start();
                            Rectangle2D brickBounds = paddle.getBrickBounds();
                            Rectangle2D snakeHeadBounds = snake.getRectangle();

                            if (brickBounds.intersects(snakeHeadBounds)) {
                                gameLoop = false; // Stop the game loop
                                snake.setAlive(false);

                            }
                        }
                    }
                }else {
                    this.stop();
                    gameOver();
                }
            }
        }.start();
    }

    /**
     * Pauses the game. This method is triggered when the pause button is pressed.
     * It sets the gamePaused flag to true.
     */
    @FXML
    private void handlePause() {
        gamePaused = true;
        canvas.requestFocus();
    }

    /**
     * Resumes the game. This method is triggered when the resume button is pressed.
     * It sets the gamePaused flag to false.
     */
    @FXML
    private void handleResume() {
        gamePaused = false;
        canvas.requestFocus();
    }

    /**
     * Ends the game and displays the game over screen.
     * This method clears the canvas, displays the fail image,
     * saves the current score, and initiates the transition to the high scores screen.
     */
    private void gameOver() {
        gc.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
        gc.drawImage(fail, 0, 0, canvas.getWidth(), canvas.getHeight());

        ScoreUtils.saveScore(scoreModel.getScore());

        MusicPlayer.stopMusic();

        PauseTransition pauseBeforeHighScores = new PauseTransition(Duration.seconds(2));
        pauseBeforeHighScores.setOnFinished(e -> {
            try {
                showHighScores();
            } catch (IOException ex) {
                throw new RuntimeException(ex);
            }
        });
        pauseBeforeHighScores.play();
    }

    /**
     * Closes all stages of the application except for the specified stage.
     * This method iterates through all currently open windows (stages) of the application
     * and hides each one, except for the provided stage.
     *
     * @param stage The stage that should remain open. All other stages will be closed.
     */
    public void closeStagesApartFromCurrent(Stage stage){
        for  (Window window : Stage.getWindows()){
            if(window != stage){
                window.hide();
            }
        }
    }

    /**
     * Displays the high scores screen.
     * This method loads the high scores view, sets up the stage, and handles the screen transition logic,
     * including closing the high score and application screens after a set duration.
     */
    private void showHighScores() throws IOException {
        FXMLLoader loader = new FXMLLoader(getClass().getResource("/views/highestScoreView.fxml"));
        Parent root = loader.load();
        Stage stage = new Stage();
        stage.setTitle("Highest Scores");
        stage.setScene(new Scene(root));
        stage.show();
        closeStagesApartFromCurrent(stage);

        // Close the high score screen and the application after 6 seconds
        PauseTransition pauseAfterHighScores = new PauseTransition(Duration.seconds(6));
        pauseAfterHighScores.setOnFinished(event -> Platform.exit());
        pauseAfterHighScores.play();
    }

}
