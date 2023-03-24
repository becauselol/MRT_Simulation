/** Class representing a MapDrawer.
 * 
 * The main job of the MapDrawer class is to draw station, edges and trains as required
 */
class MapDrawer {

    /**
     * Create a MapDrawer class
     * @param {Context} ctx - Provides the context class to draw the map with
     * @param {integer} width - width of the canvas element
     * @param {integer} height - height of the canvas element
     * */
	constructor(ctx, width, height, x_padding=10, y_padding=10) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.x_padding = x_padding;
        this.y_padding = y_padding;
	}
}
