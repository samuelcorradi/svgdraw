function addClass(el, cls)
{

	// el.classList.add("iniciar");
	if( ! (-1 < el.className.indexOf(cls))  )
	{
		var classes = el.className.split(" ");
		
		classes.push(cls);

		el.className = classes.join(" ");
	}

}

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
		 * Factory for text objects.
		 */
		this.text = function(id, text, multiline, attr)
		{

			return new escope.lib.Text(this, id, attr, text, multiline);
		
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
		 * Store element associated data.
		 */
		var data = {};

		/**
		 * Define a data value.
		 */
		this.setData = function(k, v)
		{

			data[k] = v;
			
			return this;

		};

		/**
		 * Get a data value.
		 */
		this.data = function(k)
		{

			return data[k];

		};

		/**
		 * Define elements atributes.
		 */
		this.attr = function(k, v)
		{

			var el = this.getNode();

			if(typeof k == 'object')
			{

				var keys = Object.keys(k);

				for(var i=0; i<keys.length; i++)
				{
					el.setAttribute(keys[i], k[keys[i]]);
				}

			}
			else
			{
				el.setAttribute(k, v);
			}

			el = null;

			return this;

		};

		/**
		 * Move object do front.
		 */
		this.toFront = function()
		{

			var el = this.getNode();

			el.parentNode.appendChild(el.parentNode.removeChild(el));

			el = null;

			return this;
		
		};

		/**
		 * Move object do back of all.
		 */
		this.toBack = function()
		{

			var el = this.getNode();

			el.parentNode.removeChild(el)

			el.parentNode.insertBefore(el, el.parentNode.firstChild);

			el = null;

			return this;
		
		};

		/**
		 * Adiciona um evento ao clique.
		 */
		this.click = function(func)
		{

			el.addEventListener("click", func);

			return this;

		};

		this.mousedown = function(func)
		{

			el.addEventListener("mousedown", func);

			return this;
		
		};

		this.unmousedown = function(func)
		{

			el.removeEventListener("mousedown", func);

			return this;
		
		};


		this.undrag = function(func)
		{

			var el = this.getNode();

			el.setAttribute("draggable", "false");

			el = null;

			return this;

		};

		/**
		 * Define um elemento do SVG
		 * como arrastável.
		 */
		this.drag = function(func)
		{

			func = func || function(evt){}; // Apenas para garantir que uma função é passada.

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

				// that.toFront();

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

			return this;

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

			return this;

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

			return this;

		};

		this.attr(attr);

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

		escope.Element.call(this, Canvas, id, attr);
	
	};

	escope.lib.Circle.prototype = {

		draw: function(attr) {

			attr = attr || {};

			var el = document.createElementNS("http://www.w3.org/2000/svg", "circle");

			el.setAttribute("cx", 20);
			
			el.setAttribute("cy", 20);

			el.setAttribute("r", 20);

			return el;

		}

	};

	/**
	 * Elemento quadrado.
	 */
	escope.lib.Text = function(Canvas, id, attr, text, multiline)
	{

		this.multiline = multiline;

		escope.Element.call(this, Canvas, id, attr);

		this.setText(text);
	
	};

	escope.lib.Text.prototype = {

		/**
		 * Informa se o texto deve ser
		 * quebrado de acordo com seu
		 * atributo 'width'.
		 */
		wrap: false,

		draw: function(attr) {

			attr = attr || {};

			var el = document.createElementNS("http://www.w3.org/2000/svg", "text");

			if( this.multiline )
			{
				// addClass(el, "multiline-text");
			}

			el.setAttribute("width", 50);
			
			el.setAttribute("height", 40);

			el.setAttribute("x", 40);

			el.setAttribute("y", 40);

			/*
			var newText = document.createElementNS(svgNS,"text");
			newText.setAttributeNS(null,"x",x);     
			newText.setAttributeNS(null,"y",y); 
			newText.setAttributeNS(null,"font-size","100");
			var textNode = document.createTextNode(val);
			newText.appendChild(textNode);
			document.getElementById("g").appendChild(newText);
			*/

			return el;

		},

		/**
		 * TODO: forma que o texto deve ser quebrado.
		 * O SVG já define um objeto chamado textarea
		 * que faz a quebra automática. Fazer com que
		 * verifique o suporte 
		 * <text x="0" y="0">
		 *    <tspan x="0" dy="1.2em">very long text</tspan>
		 *    <tspan x="0" dy="1.2em">I would like to linebreak</tspan>
		 * </text>
		 */
		setText: function(text) {

			var el = this.getNode();

			if(this.multiline)
			{

				var words = text.split(' ');                        
				
				var node = this.getNode();
				
				var tspan_element = document.createElementNS("http://www.w3.org/2000/svg", "tspan"); // Create first tspan element

				var text_node = window.document.createTextNode(words[0]); // Create text in tspan element

				tspan_element.appendChild(text_node); // Add tspan element to DOM

				tspan_element.setAttributeNS(null, "x", 0);

				el.appendChild(tspan_element); // Add text to tspan element

				for(var i=1; i<words.length; i++)
				{

					var len = tspan_element.firstChild.data.length; // Find number of letters in string
					
					tspan_element.firstChild.data += " " + words[i]; // Add next word

					if (tspan_element.getComputedTextLength() > el.getAttribute("width"))
					{

						tspan_element.firstChild.data = tspan_element.firstChild.data.slice(0, len); // Remove added word
						
						var tspan_element = document.createElementNS("http://www.w3.org/2000/svg", "tspan");       // Create new tspan element
						
						tspan_element.setAttributeNS(null, "x", 0); // ajudar isso
						
						tspan_element.setAttributeNS(null, "dy", 18);
						
						text_node = window.document.createTextNode(words[i]);
						
						tspan_element.appendChild(text_node);
						
						el.appendChild(tspan_element);
					
					}

				}

			}
			else
			{
				el.appendChild(document.createTextNode(text));
			}

			return this;

		},

		getText: function() {

		},

		clearText: function() {

		},

		/**
		 * Pega a quantidade de caracteres 
		 * que cabem em uma determinada
		 * largura. Isso é usado para
		 * definir as quebras de linhas
		 * do texto dependendo das dimensões
		 * do local onde ele deve ser inserido.
		 * Ver a posibilidade de definir uma
		 * quebra automática baseado na largura
		 * do próprio elemento de texto.
		 */
		charLengthByWidth: function(width) {

		} 

	};

	/**
	 * Elemento quadrado.
	 */
	escope.lib.Rect = function(Canvas, id, attr)
	{

		escope.Element.call(this, Canvas, id, attr);
	
	};

	escope.lib.Rect.prototype = {

		draw: function(attr) {

			attr = attr || {};

			var el = document.createElementNS("http://www.w3.org/2000/svg", "rect");

			el.setAttribute("width", 50);
			
			el.setAttribute("height", 40);

			el.setAttribute("x", 40);

			el.setAttribute("y", 40);

			return el;

		}

	};

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