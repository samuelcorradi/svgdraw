/**
 * Use the module patter to
 * create the jsdraw lib.
 */
 // TODO: Definir em cada elemento dados.
jsdraw = (function(escope) {

	/**
	 * Main "class" defined by
	 * the constructor function.
	 * Used to create the SVG
	 * element where everythink
	 * will be drawned.
	 */
	escope.Canvas = function Canvas(tag, width, height)
	{

		/**
		 * Return the SVG node.
		 */
		this.getSvg = function()
		{

			return this.getContainer().getElementsByTagName("svg")[0];

		}

		/**
		 * Return a tag utilizada como 
		 * container.
		 */
		this.getContainer = function()
		{
			try
			{
				return window.document.getElementById(tag);
			}
			catch(e)
			{
				throw "Invalid container tag."
			}
		}

		/**
		 * Remove all elements from
		 * the canvas.
		 */
		this.clear = function()
		{

			this.getContainer().removeChild(this.getSvg());

			this.getContainer().appendChild(createSvg(width, height));

		};

		/**
		 * Private function to create a
		 * SVG DOM element.
		 */
		function createSvg(width, height)
		{

			if( ! width ) width = 200;

			if( ! height ) height = 200;

			var svg = window.document.createElementNS("http://www.w3.org/2000/svg", "svg");

			svg.setAttribute('width', width);
			
			svg.setAttribute('height', height);

			return svg;

		}

		/**
		 * Factory for circle objects.
		 */
		this.circle = function(id, attr)
		{

			return new escope.lib.Circle(this, id, attr);
		
		}

		/**
		 * Factory for circle objects.
		 */
		this.rect = function(id, attr)
		{

			return new escope.lib.Rect(this, id, attr);
		
		}
		

		/**
		 * Adicina uma tag SVG dentro do
		 * do container.
		 */
		this.getContainer().appendChild(createSvg(width, height));
		
		return this;

	};

	/**
	 * Método construtor único para todos
	 * elementos.
	 */
	escope.Element = function(Canvas, id, attr)
	{

		var svg = Canvas.getSvg();

		if( svg.getElementById(id) ) throw "Object id already exists.";

		try
		{
			var el = this.draw(attr);
		}
		catch(e)
		{
			throw "Element construct error.";
		}

		el.setAttribute("id", id);

		svg.appendChild(el);

		el, svg = null;


		/**
		 * Adiciona um evento ao clique.
		 */
		this.click = function(func)
		{

			el.addEventListener("click", func);

		}

		this.mousedown = function(func)
		{

			el.addEventListener("mousedown", func);
		
		}

		this.unmousedown = function(func)
		{

			el.removeEventListener("mousedown", func);
		
		}

		/**
		 * Define um elemento do SVG
		 * como arrastável.
		 */
		this.mousemove = function(func)
		{

			var click = false; // flag to indicate when shape has been clicked

			var clickX, clickY; // stores cursor location upon first click
			
			var moveX=0, moveY=0; // keeps track of overall transformation
			
			var lastMoveX=0, lastMoveY=0; // stores previous transformation (move)
			
			var target;

			var el = this.getNode();

			el.setAttribute("draggable", "true");

			var that = this;

			el.addEventListener("mousedown", function(evt)
			{
				
				evt.preventDefault(); // Needed for Firefox to allow dragging correctly
				
				click=true;
				
				clickX = evt.clientX; 
				
				clickY = evt.clientY;

				if( evt.target.parentNode == that.getCanvas().getSvg())
				{
					target = evt.target;
				}
				else
				{
					target = evt.target.parentNode;
				}

			});

			el.addEventListener("mousemove", function(evt)
			{

				evt.preventDefault();

				if(click==true)
				{

					func(evt);

					moveX = lastMoveX + ( evt.clientX - clickX );
					
					moveY = lastMoveY + ( evt.clientY - clickY );

					target.setAttribute("transform", "translate(" + moveX + "," + moveY + ")");
				
				}

			});

			el.addEventListener("mouseup", function(evt)
			{
			
				click = false;
			
				lastMoveX = moveX;

				lastMoveY = moveY;
			
			});

		};

		/**
		 * Return the HTML element.
		 */
		this.getNode = function()
		{

			return Canvas.getSvg().getElementById(id);

		};

		/**
		 * Return id element.
		 */
		this.getId = function()
		{

			return id;

		};



		/**
		 * Return the Canvas object.
		 */
		this.getCanvas = function()
		{

			return Canvas;

		};

		/**
		 * Change background color.
		 */
		this.background = function(color)
		{

			this.getNode().style.fill = color;

		};

		/**
		 * Change border' properties.
		 */
		this.border = function(color, width)
		{

			var el = this.getNode();

			el.style.stroke = color;

			el.style.strokeWidth = width;

			el = null;

		};

		return this;

	}

	escope.Element.prototype.draw = function(attr)
	{

		throw "Abstract method.";
	
	}

	escope.lib = {};

	/**
	 * Elemento círculo.
	 */
	escope.lib.Circle = function(Canvas, id, attr)
	{

		escope.Element.call(this, Canvas, id, attr)
	
	};

	escope.lib.Circle.prototype.draw = function(attr)
	{

		attr = attr || {};

		var el = document.createElementNS("http://www.w3.org/2000/svg", "circle");

		el.setAttribute("cx", attr.cx || 20);
		
		el.setAttribute("cy", attr.cy || 20);

		el.setAttribute("r", attr.r || 20);

		return el;

	}

	/**
	 * Elemento quadrado.
	 */
	escope.lib.Rect = function(Canvas, id, attr)
	{

		escope.Element.call(this, Canvas, id, attr)
	
	};

	escope.lib.Rect.prototype.draw = function(attr)
	{

		attr = attr || {};

		var el = document.createElementNS("http://www.w3.org/2000/svg", "rect");

		el.setAttribute("width", attr.width || 50);
		
		el.setAttribute("height", attr.height || 40);

		el.setAttribute("x", attr.x || 40);

		el.setAttribute("y", attr.y || 40);

		return el;

	}

	/**
	 * Permite agupar elementos no SVG.
	 */
	escope.Group = function(Canvas)
	{

		var svg = Canvas.getSvg();

		var g = window.document.createElementNS("http://www.w3.org/2000/svg", "g");

		svg.appendChild(g);

		this.getNode = function()
		{

			return g;

		}

		/**
		 * Remove a element from SVG parent
		 * and add inside the group.
		 */
		this.push = function(element_id)
		{

			var svg = Canvas.getSvg();

			var e = svg.getElementById(element[i]);

			if(e)
			{

				svg.removeChild(e);

				g.appendChild(e);

				return true;

			}
			
			throw "Element id not exists."

		}
		
		return this;

	}

	return escope;
	
})(window.jsdraw || {})