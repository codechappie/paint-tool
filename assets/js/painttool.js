


// region Shape
/**
 * The parent class for anything drawn on the canvas.
 */
class Shape {
    /**
     * Create a new Shape.
     *
     * @param position The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     */
    constructor(position, settings) {
        this.position = position;
        this.settings = settings;
    }

    /**
     * Draw the shape.
     *
     * @param ctx A 2d context for the canvas to which the Shape should be drawn to
     */
    render(ctx) {
        ctx.fillStyle = this.settings.color;
        ctx.strokeStyle = this.settings.color;
        ctx.lineWidth = this.settings.width;
        ctx.font = this.settings.font;
    }

    /**
     * Move the shape's position by a provided new one.
     *
     * @param position A 2d position
     */
    move(position) {
        this.position = position;
    }

    /**
     * Resize the object, from its position to the new one
     *
     * @param x Horizontal coordinate
     * @param y Vertical coordinate
     */
    resize(x, y) {

    }
}
// endregion

// region Rectangle
/**
 * A drawable rectangular shape.
 */
class Rectangle extends Shape {
    /**
     * Create a new rectangle.
     *
     * @param position The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     * @param width Horizontal length of rectangle
     * @param height Vertical length of rectangle
     */
    constructor(position, settings, width, height) {
        super(position, settings);
        this.width = width;
        this.height = height;
    }

    /** @inheritDoc */
    render(ctx) {
        ctx.globalCompositeOperation = "source-over";
        super.render(ctx);
        if (this.settings.filled) {
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        } else {
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        }
    }

    /** @inheritDoc */
    resize(x, y) {
        this.width = x - this.position.x;
        this.height = y - this.position.y;
    }
}
// endregion

// region Oval
/**
 * A drawable ellipse.
 */
class Oval extends Shape {
    /**
     * Create a new Oval.
     *
     * @param position The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     * @param xRadius The horizontal half width of the oval
     * @param yRadius The vertical half width of the oval
     */
    constructor(position, settings, xRadius, yRadius) {
        super(position, settings);
        this.xRadius = xRadius;
        this.yRadius = yRadius;
        // The width and height of the oval is determined by
        // the distance from position to (x,y). The center
        // of the oval is their mid point.
        this.x = position.x;
        this.y = position.y;
    }

    /** @inheritDoc */
    render(ctx) {
        ctx.globalCompositeOperation = "source-over";
        super.render(ctx);
        ctx.beginPath();
        let c_x = (this.position.x + this.x) / 2;
        let c_y = (this.position.y + this.y) / 2;
        ctx.ellipse(c_x, c_y, this.xRadius, this.yRadius, 0, 0, 2 * Math.PI);
        if (this.settings.filled) {
            ctx.fill();
        } else {
            ctx.stroke();
            ctx.closePath();
        }
    }

    /** @inheritDoc */
    resize(x, y) {
        this.x = x;
        this.y = y;
        this.xRadius = Math.abs(x - this.position.x) / 2;
        this.yRadius = Math.abs(y - this.position.y) / 2;
    }
}
// endregion

// region Circle
/**
 * A drawable circle.
 */
class Circle extends Oval {
    /**
     * Create a new Circle.
     *
     * @param position The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     * @param radius The half width of the circle
     */
    constructor(position, settings, radius) {
        super(position, settings, radius, radius);
    }

    /** @inheritDoc */
    resize(x, y) {
        this.x = x;
        this.y = y;
        let radius = Math.max(Math.abs(x - this.position.x), Math.abs(y - this.position.y)) / 2;
        this.xRadius = radius;
        this.yRadius = radius;
    }
}
// endregion

// region Line
/**
 * A drawable line segment.
 */
class Line extends Shape {
    /**
     * Create a new Line.
     *
     * @param startPosition The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     * @param endPosition The end point of the line segment
     */
    constructor(startPosition, settings, endPosition) {
        super(startPosition, settings);
        this.endPosition = { x: endPosition.x, y: endPosition.y };
    }

    /** @inheritDoc */
    render(ctx) {
        ctx.globalCompositeOperation = "source-over";
        super.render(ctx);
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        ctx.lineTo(this.endPosition.x, this.endPosition.y);
        ctx.stroke();
        ctx.closePath();
    }

    /** @inheritDoc */
    resize(x, y) {
        this.endPosition.x = x;
        this.endPosition.y = y;
    }
}
// endregion

// region LineList
/**
 * A drawable list of smoothed line segments.
 */
class LineList extends Shape {
    /**
     * Create a new LineList.
     *
     * @param position The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     */
    constructor(position, settings) {
        super(position, settings);
        // All coordinates are kept in two separated arrays
        this.xList = [];
        this.yList = [];
    }

    /** @inheritDoc */
    render(ctx) {
        ctx.globalCompositeOperation = "source-over";
        super.render(ctx);
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y);
        // Segments are smoothed using quadratic curves
        for (let i = 0; ; i++) {
            if (i > this.xList.length - 1) {
                ctx.quadraticCurveTo(this.xList[i], this.yList[i], this.xList[i + 1], this.yList[i + 1]);
                break;
            }
            let center = { x: (this.xList[i] + this.xList[i + 1]) / 2, y: (this.yList[i] + this.yList[i + 1]) / 2 };
            ctx.quadraticCurveTo(this.xList[i], this.yList[i], center.x, center.y);
        }
        ctx.stroke();
        ctx.closePath();
    }

    /** @inheritDoc */
    resize(x, y) {
        this.xList.push(x);
        this.yList.push(y);
    }
}
// endregion



// region EraseList
/**
 * A drawable list of smoothed line segments.
 */
class EraseList extends Shape {
    /**
     * Create a new EraseList.
     *
     * @param position The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     */
    constructor(position, settings) {
        super(position, settings);
        // All coordinates are kept in two separated arrays
        this.xList = [];
        this.yList = [];
    }

    /** @inheritDoc */
    render(ctx) {
        super.render(ctx);
        ctx.beginPath();
        ctx.globalCompositeOperation = "destination-out";
        ctx.moveTo(this.position.x, this.position.y);
        // Segments are smoothed using quadratic curves
        for (let i = 0; ; i++) {
            if (i > this.xList.length - 1) {
                ctx.quadraticCurveTo(this.xList[i], this.yList[i], this.xList[i + 1], this.yList[i + 1]);
                break;
            }
            let center = { x: (this.xList[i] + this.xList[i + 1]) / 2, y: (this.yList[i] + this.yList[i + 1]) / 2 };
            ctx.quadraticCurveTo(this.xList[i], this.yList[i], center.x, center.y);
        }
        ctx.stroke();
        ctx.closePath();
    }

    /** @inheritDoc */
    resize(x, y) {
        this.xList.push(x);
        this.yList.push(y);
    }
}
// endregion


// region DrawnText
/**
 * A drawable text.
 */
class DrawnText extends Shape {
    /**
     * Create a new DrawnText.
     *
     * @param position The x and y position of the shape
     * @param settings Various settings for drawing the shape {color, filled, width, font}
     */
    constructor(position, settings) {
        super(position, settings);
        // Letters are stored as internal char array.
        this.chars = [];
    }

    /** @inheritDoc */
    render(ctx) {
        ctx.globalCompositeOperation = "source-over";
        super.render(ctx);
        if (this.settings.filled) {
            ctx.fillText(this.chars.join(''), this.position.x, this.position.y);
        } else {
            ctx.fillText(this.chars.join(''), this.position.x, this.position.y);
        }
    }

    /**
     * @inheritDoc
     *
     * @param key The button which was pressed to add to the text
     */
    resize(key) {
        // Delete last character if backspace
        if (key === 'Backspace') {
            if (this.chars.length > 0) {
                this.chars.pop();
            }
            return;
        }

        // Discard all non-single-character-keys
        if (key.length === 1) {
            this.chars.push(key);
        }
    }
}
// endregion


// Render HTML
let htmlContent = `
<!-- Navigation bar -->
    <nav id="main-nav" class="navbar-paintme">
      <div class="container-fluid">
        <!-- Shapes -->
        <ul id="shape-list" class="nav-paintme">
          <li class="nav-item-paintme" data-shape="rectangle">
            <a>
              <img src="./assets/icons/box.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme" data-shape="oval">
            <a>
              <img src="./assets/icons/ellipse.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme" data-shape="circle">
            <a>
              <img src="./assets/icons/circle.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme" data-shape="line">
            <a>
              <img src="./assets/icons/ruler.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme" class="active" data-shape="lineList">
            <a>
              <span class="glyphicon glyphicon-pencil"></span>
              <img src="./assets/icons/pen.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme" data-shape="text">
            <a>
              <img src="./assets/icons/text--font.svg" alt="" />
            </a>
          </li>
          <!-- <li class="nav-item-paintme" data-shape="move">
              <a>
                <img src="./assets/icons/icons8_text.svg" alt="" />
              </a>
            </li> -->
        </ul>
        <!-- Settings -->
        <ul id="settings-list" class="nav-paintme">
          <li class="nav-item-paintme">
            <a>
              <input id="color-selector" type="color" />
            </a>
          </li>
          <li class="nav-item-paintme">
            <a data-toggle="modal" id="btn-size">
              <img src="./assets/icons/zoom--in-area.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme">
            <a id="fill-toggle" data-filled="no">
              <img src="./assets/icons/shape--except.svg" alt="" />
            </a>
          </li>
        </ul>
        <!-- IO -->
        <ul id="io-list" class="nav-paintme">
          <li class="nav-item-paintme">
            <a id="img-save">
              <img src="./assets/icons/download.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme">
            <a id="img-load">
              <img src="./assets/icons/upload.svg" alt="" />
            </a>
          </li>
        </ul>
        <!-- Undo + Redo -->
        <ul id="time-travel" class="nav-paintme">
          <li class="nav-item-paintme">
            <a id="img-clear">
              <img src="./assets/icons/trash-can.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme">
            <a id="btn-undo">
              <img src="./assets/icons/undo.svg" alt="" />
            </a>
          </li>
          <li class="nav-item-paintme">
            <a id="btn-redo">
              <img src="./assets/icons/redo.svg" alt="" />
            </a>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Canvas -->
    <div class="container-fluid">
      <canvas id="canvas"> Tu navegador no soporta esta aplicación :( </canvas>
    </div>

    <!-- Hidden modal for size adjustments -->
    <div id="size-modal" class="modal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Modificar tamaños</h4>
            <button type="button" class="close btn-close-modal-size abort" data-dismiss="modal">
              <img src="./assets/icons/icons8_multiply.svg" alt="">
            </button>
          </div>
          <div class="modal-body">
            <table class="table" id="size-table">
              <tbody>
                <tr id="font-row" data-value="12pt">
                  <td>Tamaño de fuente</td>
                  <td>
                    <a class="decrease">
                      <i class="fas fa-minus"></i>
                    </a>
                  </td>
                  <td class="value-data center">12pt</td>
                  <td class="center">
                    <a class="increase">
                      <i class="fas fa-plus"></i>
                    </a>
                  </td>
                </tr>
                <tr id="width-row" data-value="1">
                  <td>Ancho de linea</td>
                  <td>
                    <a class="decrease">
                      <i class="fas fa-minus"></i>
                    </a>
                  </td>
                  <td class="value-data center">1</td>
                  <td class="center">
                    <a class="increase">
                      <i class="fas fa-plus"></i>
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-close-modal-size abort">
              Cancelar
            </button>
            <button type="button" class="btn btn-close-modal-size confirm">
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
`;


/**
 * Function scope wrapper.
 */
(function () {
    const paintme = document.getElementById('paintme');

    paintme.innerHTML = htmlContent;

    // region Drawer
    /**
     * An object that holds shapes and current settings
     */
    let drawer = {
        // A list of shapes on the canvas
        shapes: [],
        // If any shapes are undone they are kept here temporarily
        undoneShapes: [],
        // The shape currently selected
        selectedShape: "lineList",
        // Canvas DOM element
        canvas: document.getElementById("canvas"),
        // The context of the canvas
        ctx: document.getElementById("canvas").getContext("2d"),
        // The element currently being drawn
        selectedElement: null,
        // The shapes we can choose from
        availableShapes: {
            RECTANGLE: "rectangle",
            OVAL: "oval",
            CIRCLE: "circle",
            LINE: "line",
            LINE_LIST: "lineList",
            ERASE_LIST: "eraseList",
            DrawnText: "text",
            MOVE: "move", // TODO
        },
        // Settings for selectedElement
        settings: {
            color: "#000000",
            filled: false,
            width: 10,
            font: "36pt sans-serif",
        },
        /**
         * Deep copy of settings.
         *
         * @returns {{color: string, filled: boolean, width: number, font: string}}
         */
        currentSettings: function () {
            return {
                color: drawer.settings.color.slice(0, drawer.settings.color.length),
                filled: drawer.settings.filled,
                width: drawer.settings.width,
                font: drawer.settings.font.slice(0, drawer.settings.font.length),
            };
        },
        currentSettingsEraser: function () {
            return {
                color: drawer.settings.color.slice(0, drawer.settings.color.length),
                filled: drawer.settings.filled,
                width: drawer.settings.width + 10,
                font: drawer.settings.font.slice(0, drawer.settings.font.length),
            };
        },

        /**
         * Draw all stored shapes.
         */
        drawAllStoredShapes: function () {
            for (let i = 0; i < drawer.shapes.length; i++) {
                if (drawer.shapes[i]) {
                    drawer.shapes[i].render(drawer.ctx);
                }
            }
        },
        /**
         * Draw the selected shape in its current state.
         */
        drawSelected: function () {
            if (drawer.selectedElement) {
                drawer.selectedElement.render(drawer.ctx);
            }
        },
        /**
         * Redraws all elements to the canvas.
         */
        redraw: function () {
            // Wipe everything off the canvas
            drawer.ctx.canvas.width = window.innerWidth;
            drawer.ctx.canvas.height = window.innerHeight;
            width = canvas.width;
            height = canvas.height;
            drawer.ctx.clearRect(
                0,
                0,
                drawer.ctx.canvas.width,
                drawer.ctx.canvas.height
            );
            drawer.drawAllStoredShapes();
            drawer.drawSelected();
        },
        /**
         * Add the last undone shape back to the list of shapes.
         */
        redo: function () {
            if (drawer.undoneShapes.length > 0) {
                drawer.shapes.push(drawer.undoneShapes.pop());
                drawer.redraw();
            }
        },
        /**
         * Remove the last shape drawn and place in temporary redo storage.
         */
        undo: function () {
            if (drawer.shapes.length > 0) {
                drawer.undoneShapes.push(drawer.shapes.pop());
                drawer.redraw();
            }
        },
    };
    // endregion
    let pos;

    // Set up touch events for mobile, etc
    drawer.canvas.addEventListener(
        "touchstart",
        function (e) {
            mousePos = getTouchPos(canvas, e);
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
            drawer.canvas.dispatchEvent(mouseEvent);
        },
        false
    );
    drawer.canvas.addEventListener(
        "touchend",
        function (e) {
            var mouseEvent = new MouseEvent("mouseup", {});
            drawer.canvas.dispatchEvent(mouseEvent);
        },
        false
    );
    drawer.canvas.addEventListener(
        "touchmove",
        function (e) {
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY,
            });
            drawer.canvas.dispatchEvent(mouseEvent);
        },
        false
    );

    // Get the position of a touch relative to the canvas
    function getTouchPos(canvasDom, touchEvent) {
        var rect = canvasDom.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top,
        };
    }

    // region Mouse events
    // region Mouse down
    drawer.canvas.addEventListener(
        "mousedown",
        /**
         * Starts drawing the chosen shape.
         *
         * @param mouseEvent The event that trigger this callback
         */
        function (mouseEvent) {
            pos = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
            switch (drawer.selectedShape) {
                case drawer.availableShapes.RECTANGLE:
                    drawer.selectedElement = new Rectangle(
                        pos,
                        drawer.currentSettings(),
                        0,
                        0
                    );
                    break;
                case drawer.availableShapes.OVAL:
                    drawer.selectedElement = new Oval(
                        pos,
                        drawer.currentSettings(),
                        0,
                        0
                    );
                    break;
                case drawer.availableShapes.CIRCLE:
                    drawer.selectedElement = new Circle(pos, drawer.currentSettings(), 0);
                    break;
                case drawer.availableShapes.LINE:
                    drawer.selectedElement = new Line(pos, drawer.currentSettings(), pos);
                    break;
                case drawer.availableShapes.LINE_LIST:
                    drawer.selectedElement = new LineList(pos, drawer.currentSettings());
                    break;
                case drawer.availableShapes.ERASE_LIST:
                    drawer.selectedElement = new EraseList(pos, drawer.currentSettingsEraser());
                    break;
                case drawer.availableShapes.DrawnText:
                    // If we are already drawing text, store that one
                    if (drawer.selectedElement) {
                        drawer.shapes.push(drawer.selectedElement);
                        drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                    }
                    drawer.selectedElement = new DrawnText(pos, drawer.currentSettings());
                    break;
                case drawer.availableShapes.MOVE:
                    // TODO
                    break;
            }
        }
    );
    // endregion

    // region Mouse move
    drawer.canvas.addEventListener(
        "mousemove",
        /**
         * If any shape other than text is being drawn, we resize it.
         *
         * @param mouseEvent The event that trigger this callback
         */
        function (mouseEvent) {
            if (
                drawer.selectedElement &&
                drawer.selectedShape !== drawer.availableShapes.DrawnText
            ) {
                drawer.selectedElement.resize(mouseEvent.offsetX, mouseEvent.offsetY);
                drawer.redraw();
            }
        }
    );
    // endregion

    // region Mouse up
    document.addEventListener(
        "mouseup",
        /**
         * If any element is being drawn and it's not text, then
         * we store it when the mouse is released.
         *
         * @param mouseEvent  The event that trigger this callback
         */
        function (mouseEvent) {
            if (
                drawer.selectedElement &&
                drawer.selectedShape !== drawer.availableShapes.DrawnText
            ) {
                drawer.shapes.push(drawer.selectedElement);
                drawer.selectedElement = null;
                drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
            }
        }
    );
    // endregion
    // endregion

    // region Key events
    /**
     * If we are drawing a text and we press Enter, then
     * we store the text and stop drawing it. Otherwise the
     * key pressed is added to it.
     *
     * @param key A key that was pressed
     */
    function textKeyPress(key) {
        if (key === "Enter") {
            drawer.shapes.push(drawer.selectedElement);
            drawer.selectedElement = null;
            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
        } else {
            drawer.selectedElement.resize(key);
            drawer.redraw();
        }
    }

    document.addEventListener(
        "keypress",
        /**
         * If a key is pressed, we first check to see if a text
         * is being drawn and if so, handle that accordingly. If
         * not, we check for undo and redo combos.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            if (
                drawer.selectedShape === drawer.availableShapes.DrawnText &&
                drawer.selectedElement
            ) {
                textKeyPress(evt.key);
            } else if (evt.key.toUpperCase() === "Z" && evt.ctrlKey) {
                if (evt.shiftKey) {
                    drawer.redo();
                } else {
                    drawer.undo();
                }
            }
        }
    );
    // endregion



    document.addEventListener(
        "keydown",
        /**
         * If a key is pressed, we first check to see if a text
         * is being drawn and if so, handle that accordingly. If
         * not, we check for undo and redo combos.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            if (
                drawer.selectedShape === drawer.availableShapes.DrawnText &&
                drawer.selectedElement
            ) {
                let key = evt.key;
                if (key === "Backspace") {
                    drawer.selectedElement.resize(key);
                    drawer.redraw();
                } else {
                    // console.log("borrando")
                }
            }
        }
    );



    // region OnClick events

    // region Undo and Redo
    // Undo and redo can also be done from the navigation bar by clicking icons
    document.getElementById("btn-undo").addEventListener("click", drawer.undo);
    document.getElementById("btn-redo").addEventListener("click", drawer.redo);
    // endregion

    // region Select element
    // Add click events to the shape part of our navigation bar
    document.querySelectorAll("#shape-list li").forEach(
        /**
         * Foreach function that is applied to all elements from the query selector.
         *
         * @param elem The current element of the query selector
         */
        function (elem) {
            elem.addEventListener(
                "click",
                /**
                 * If the shape is changed, we begin by checking to see
                 * if the previous one was a text and if so, store it as is.
                 * Then we change the selected shape and toggle the DOM element
                 * class list for the class active, for both the previously selected
                 * DOM and the new one.
                 *
                 * @param evt The event that triggered this callback
                 */
                function (evt) {
                    if (filled.dataset["filled"] === "no") {
                        drawer.settings.filled = false;
                    }
                    let clickedShape = elem.dataset.shape;
                    if (
                        clickedShape === drawer.availableShapes.DrawnText
                    ) {
                        drawer.settings.filled = true;
                        drawer.shapes.push(drawer.selectedElement);
                        drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
                    }
                    if (clickedShape !== drawer.selectedShape) {

                        drawer.selectedElement = null;
                        drawer.selectedShape = clickedShape;

                        document
                            .querySelectorAll("#shape-list li.active")[0]
                            .classList.toggle("active");
                        elem.classList.toggle("active");
                    }
                }
            );
        }
    );
    // endregion

    // region Filled setting
    // On click event for the star (which is either filled or not)
    let filled = document.getElementById("fill-toggle");
    filled.addEventListener(
        "click",
        /**
         * A boolean value for filled is toggled by clicking
         * the star and the glyph is toggled as well, between
         * a filled star and a hollow one.
         *
         * @param evt The event that triggered this callback.
         */
        function (evt) {
            filled.firstElementChild.classList.toggle("far");
            filled.firstElementChild.classList.toggle("fas");
            // filled.classList("active");
            if (filled.dataset["filled"] === "no") {
                filled.dataset["filled"] = "yes";
                drawer.settings.filled = true;
            } else {
                filled.dataset["filled"] = "no";
                drawer.settings.filled = false;
            }
        }
    );
    // endregion

    // region Color picker
    // HTML5 color picker, black by default
    let colorPicker = document.getElementById("color-selector");
    colorPicker.value = "#000000";
    colorPicker.addEventListener(
        "change",
        /**
         * Set the color settings to the chosen color.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            drawer.settings.color = colorPicker.value;
        }
    );
    // endregion

    // region Size settings
    // region Line width
    // The DOM elements within the modal belonging to line width
    let widthSetting = document.getElementById("width-row");
    let widthDecrease = widthSetting.querySelectorAll("td > a.decrease")[0];
    let widthIncrease = widthSetting.querySelectorAll("td > a.increase")[0];
    let widthValue = widthSetting.querySelectorAll("td.value-data")[0];
    widthDecrease.addEventListener(
        "click",
        /**
         * Decrease the value of the text node down to a minimum of 1.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            widthValue.innerHTML = Math.max(1, parseInt(widthValue.innerHTML) - 4);
        }
    );
    widthIncrease.addEventListener(
        "click",
        /**
         * Increase the value of the text node up to a maximum of 50.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            widthValue.innerHTML = Math.min(70, parseInt(widthValue.innerHTML) + 4);
        }
    );
    // endregion

    // region Font size
    // The DOM elements within the modal belonging to font size
    let fontSetting = document.getElementById("font-row");
    let fontDecrease = fontSetting.querySelectorAll("td > a.decrease")[0];
    let fontIncrease = fontSetting.querySelectorAll("td > a.increase")[0];
    let fontValue = fontSetting.querySelectorAll("td.value-data")[0];
    fontDecrease.addEventListener(
        "click",
        /**
         * Decrease the value of the text node down to a minimum of 6.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            fontValue.innerHTML = ((s) =>
                Math.max(6, parseInt(s.slice(0, s.length - 2)) - 4) + "pt")(
                    fontValue.innerHTML
                );
        }
    );
    fontIncrease.addEventListener(
        "click",
        /**
         * Increase the value of the text node up to a maximum of 42.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            fontValue.innerHTML = ((s) =>
                Math.min(70, parseInt(s.slice(0, s.length - 2)) + 4) + "pt")(
                    fontValue.innerHTML
                );
        }
    );
    // endregion

    // region Modal
    let sizeModal = document.getElementById("size-modal");
    // DOM elements that will cancel the changes made to line width and font size
    let sizeAbort = sizeModal.querySelectorAll("button.abort");
    for (let i = 0; i < sizeAbort.length; i++) {
        sizeAbort[i].addEventListener(
            "click",
            /**
             * Change the text nodes back to the value they had
             * when the modal was opened (the actual value is
             * stored in a data set within the node).
             *
             * @param evt The event that triggered this callback
             */
            function (evt) {
                widthValue.innerHTML = widthSetting.dataset["value"];
                fontValue.innerHTML = fontSetting.dataset["value"];
            }
        );
    }
    // The DOM element that will confirm the changes made to line width and font size
    sizeModal.querySelectorAll("button.confirm")[0].addEventListener(
        "click",
        /**
         * Update both the data set containing the actual value
         * and the settings object in our drawer.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            widthSetting.dataset["value"] = widthValue.innerHTML;
            drawer.settings.width = parseInt(widthValue.innerHTML);
            fontSetting.dataset["value"] = fontValue.innerHTML;
            drawer.settings.font =
                fontValue.innerHTML + " " + drawer.settings.font.split(" ")[1];
        }
    );
    // endregion
    // endregion

    // region FILE IO
    // region Save
    /**
     * Creates a json object and from it a file blob. The json object
     * additionally adds types of the shapes it holds since json does
     * not store functions.
     *
     * @returns {Blob} A file blob with all the shapes in a json format.
     */
    function createJsonBlob() {
        let lst = [];
        for (let i = 0; i < drawer.shapes.length; i++) {
            let tmp = JSON.parse(JSON.stringify(drawer.shapes[i]));
            tmp["type"] = drawer.shapes[i].__proto__.constructor.name;
            lst.push(tmp);
        }
        return new Blob([JSON.stringify(lst)], { type: "application/json" });
    }

    /**
     * Create a temporary anchor to download a blob, click it
     * and then remove it.
     */
    function saveAsJsonFile() {
        let tmp = window.document.createElement("a");
        tmp.href = window.URL.createObjectURL(createJsonBlob());
        tmp.download = "image.json";
        document.body.appendChild(tmp);
        tmp.click();
        document.body.removeChild(tmp);
    }

    // Add download event for anchor in navigation bar.
    document.getElementById("img-save").addEventListener("click", saveAsJsonFile);
    // endregion

    // region Load
    /**
     * Convert a json object to its corresponding shape
     * and add it to the list of shapes to draw.
     *
     * @param jsonShape Json equivalent of a shape
     */
    function createShapeFromJson(jsonShape) {
        switch (jsonShape.type) {
            case "Rectangle":
                drawer.shapes.push(
                    new Rectangle(
                        jsonShape.position,
                        jsonShape.settings,
                        jsonShape.width,
                        jsonShape.height
                    )
                );
                break;
            case "Oval":
                drawer.shapes.push(
                    new Oval(
                        jsonShape.position,
                        jsonShape.settings,
                        jsonShape.xRadius,
                        jsonShape.yRadius
                    )
                );
                break;
            case "Circle":
                drawer.shapes.push(
                    new Circle(jsonShape.position, jsonShape.settings, jsonShape.xRadius)
                );
                break;
            case "Line":
                drawer.shapes.push(
                    new Line(
                        jsonShape.position,
                        jsonShape.settings,
                        jsonShape.endPosition
                    )
                );
                break;
            case "LineList":
                let ll = new LineList(jsonShape.position, jsonShape.settings);
                for (let j = 0; j < jsonShape.xList.length; j++) {
                    ll.resize(jsonShape.xList[j], jsonShape.yList[j]);
                }
                drawer.shapes.push(ll);
                break;
            case "EraseList":
                let eli = new EraseList(jsonShape.position, jsonShape.settings);
                for (let j = 0; j < jsonShape.xList.length; j++) {
                    eli.resize(jsonShape.xList[j], jsonShape.yList[j]);
                }
                drawer.shapes.push(eli);
                break;
            case "DrawnText":
                let dt = new DrawnText(jsonShape.position, jsonShape.settings);
                for (let j = 0; j < jsonShape.chars.length; j++) {
                    dt.resize(jsonShape.chars[j]);
                }
                drawer.shapes.push(dt);
                break;
        }
    }

    /**
     * Parses the json object, which should be an
     * array of shape objects. Also restarts the
     * canvas and redraws it.
     *
     * @param e On file loaded event
     */
    function constructShapesFromFile(e) {
        let contents = e.target.result;
        let tmpList = JSON.parse(contents);
        drawer.selectedElement = null;
        drawer.shapes.splice(0, drawer.shapes.length);
        drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
        for (let i = 0; i < tmpList.length; i++) {
            createShapeFromJson(tmpList[i]);
        }
        drawer.redraw();
    }

    /**
     * Uses the first file (if multiples), reads
     * it and adds a callback for the event of
     * being done reading it.
     *
     * @param evt The event of uploading a file.
     */
    function uploadFile(evt) {
        let file = evt.target.files[0];
        if (!file) {
            return;
        }
        let reader = new FileReader();
        reader.addEventListener("load", constructShapesFromFile);
        reader.readAsText(file);
    }

    /**
     * Create temporary file input node, click it
     * and handle the event for uploading one.
     * Then it will be removed.
     */
    function createTemporaryFileLoader() {
        let inp = window.document.createElement("input");
        inp.type = "file";
        document.body.appendChild(inp);
        inp.style.visibility = "hidden";
        inp.addEventListener("change", uploadFile, false);
        inp.click();
        document.body.removeChild(inp);
    }

    // Add upload event for anchor in navigation bar.
    document
        .getElementById("img-load")
        .addEventListener("click", createTemporaryFileLoader);
    // endregion

    // region New image
    document.getElementById("img-clear").addEventListener(
        "click",
        /**
         * Restart the drawing.
         *
         * @param evt The event that triggered this callback
         */
        function (evt) {
            drawer.selectedElement = null;
            drawer.shapes.splice(0, drawer.shapes.length);
            drawer.undoneShapes.splice(0, drawer.undoneShapes.length);
            drawer.redraw();
        }
    );
    // endregion
    // endregion
    // endregion


})();

