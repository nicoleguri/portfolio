package snakegame;

import javazoom.jl.player.Player;
import java.io.BufferedInputStream;
import java.io.FileInputStream;

/**
 * A music player class for playing music in a separate thread.
 * This class extends {@code Thread} and is capable of playing music files in a loop or once.
 *
 * @author Nicole Guri - modified
 */
public class MusicPlayer extends Thread
{
	private final String filename;
	public Player player;
	private boolean loop;
	private static MusicPlayer currentInstance;

	/**
	 * Constructs a new MusicPlayer instance.
	 *
	 * @param filename The path to the music file to be played.
	 * @param loop True if the music should loop continuously, false otherwise.
	 */
	public MusicPlayer(String filename, boolean loop)
	{
		this.loop = loop;
		this.filename = filename;
		currentInstance = this;
	}

	/**
	 * The main execution method for the thread. This method plays the music file
	 * and repeats it if looping is enabled.
	 */
	public void run()
	{
		try {
			do {
				BufferedInputStream buffer = new BufferedInputStream(new FileInputStream(filename));
				player = new Player(buffer);
				player.play();
				buffer.close();
			} while (loop);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	/**
	 * Stops the currently playing music. If no music is playing, this method does nothing.
	 * It stops the looping, closes the player, and interrupts the music player thread.
	 */
	public static void stopMusic() {
		if (currentInstance != null && currentInstance.player != null) {
			currentInstance.loop = false;
			currentInstance.player.close();
			currentInstance.interrupt();
		}
	}

	/**
	 * Static method to start playing music. It creates a new MusicPlayer instance and starts the thread.
	 *
	 * @param filename The path to the music file to be played.
	 * @param loop True if the music should loop continuously, false otherwise.
	 */
	public static void getMusicPlay(String filename, boolean loop) {
		new MusicPlayer(filename, loop).start();
	}
}
