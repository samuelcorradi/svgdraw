function addClass(el, cls)
{

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
 // DONE: Definir em cada elemento dados. (29/12/2015)
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
		 * TODO: Exportar o conteúdo
		 * do canvas para algum
		 * formato bitmap.
		 */
		this.export = function()
		{

		};

		/**
		 * Return the SVG node.
		 */
		this.getSvg = function()
		{

			return this.getContainer().getElementsByTagName("svg")[0];

		};

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
		};

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
		
		};

		/**
		 * Factory for circle objects.
		 */
		this.path = function(id, x, y, attr)
		{

			return new escope.lib.Path(this, id, x, y, attr);
		
		};

		/**
		 * Factory for text objects.
		 */
		this.text = function(id, text, multiline, attr)
		{

			return new escope.lib.Text(this, id, attr, text, multiline);
		
		};

		/**
		 * Factory for circle objects.
		 */
		this.rect = function(id, attr)
		{

			return new escope.lib.Rect(this, id, attr);
		
		};
		

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
		 * Store all functions for each
		 * data set on Element.
		 * This functions are trigged
		 * on set data.
		 */
		var _dtActions = {};

		/**
		 * Define a data value.
		 */
		this.setData = function(k, v, func)
		{

			data[k] = v;

			func = func || _dtActions[k] || null;

			if( func ) func(this);
			
			return this;

		};

		/**
		 * Get a data value.
		 */
		this.getData = function(k)
		{

			return data[k];

		};

		/*
		 * DONE: Registrar funções que são
		 * invocadas sempre q atualiza um dado.
		 * (29/12/2015)
		 */
		this.dataAction = function(k, func)
		{
			_dtActions[k] = func;
		}

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
		 * TODO: Forma que o texto deve ser quebrado.
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

		// TODO: Retornar a string do texto.
		getText: function() {

		},

		// TODO: Limpar o texto do elemento.
		clearText: function() {

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
	 * Elemento caminho.
	 */
	escope.lib.Path = function(Canvas, id, x, y, attr)
	{

		escope.Element.call(this, Canvas, id, attr);

		/*
		 * Define o ponto inicial de acordo
		 * com os pontos x e y informados.
		 */
		this.getNode().setAttribute("d", "M" + (x || 0) + " " + (y || 0));

		/**
		 * Limpa todas informações do caminho.
		 */ 
		this.clear = function()
		{
			
			this.getNode().setAttribute("d", "");
			
			return this;

		}

		/**
		 * Diz se uma curva está fechada.
		 */
		this.isEmpty = function()
		{

			if( this.getNode().getAttribute("d")=="" )
			{
				return true;
			}

			return false;

		}

		/**
		 * Pega informações sobre o
		 * seguimento especificado.
		 */
		this.getSeguiment = function(i)
		{

		};

		/**
		 * Pega o ponto espeficado
		 * pelo índice.
		 */
		this.getPoint = function(i)
		{

		};

		/**
		 * Adiciona controle para um seguimento
		 * específico do caminho.
		 */
		this.addControler = function(seg_index)
		{

		};

		/**
		 * Informa se o caminho já está
		 * fechado ou não.
		 * @return bool True if it's closed or false if not.
		 */
		this.isClosed = function()
		{



		};

		/**
		 * Adiciona um seguimento
		 * ao caminho.
		 * @param string type Tipo de seguimento.
		 * @param object param Lista de propriedades para o seguimento.
		 */
		this.add = function(type, param)
		{

		};

		/**
		 * Adiciona um ponto que gera um
		 * seguimento reto ao caminho.
		 */
		this.straight = function(x, y)
		{

			return this;

		};

		/**
		 * Adiciona um ponto que gera um
		 * seguimento reto ao caminho.
		 */
		this.hori = function(width)
		{

			return this;

		};

		/**
		 * Adiciona um ponto que gera um
		 * seguimento reto ao caminho.
		 */
		this.vert = function(height)
		{

			return this;

		};

		this.cubic = function(type, param)
		{

			return this;

		};

		/**
		 * Draw a Quadratic Bézier Curve.
		 */
		this.quad = function(px, py, cx, cy)
		{

			var el = this.getNode();

			var d = el.getAttribute("d");

			if( d=="" )
			{
				d = "M0,0";
			}

			d = d + " Q" + cx + " " + cy + " " + px + " " + py;

			el.setAttribute("d", d);

			return this;

		};

		this.ellip = function(type, param)
		{

			return this;

		};

		/**
		 * Fecha o caminho adicionado um
		 * último seguimento que coincide
		 * com o ponto incial.
		 */
		this.close = function()
		{

			if( ! this.isClosed() )
			{
			}
			
			return this;

		};
	
	};

	escope.lib.Path.prototype = {

		draw: function(attr) {

			attr = attr || {};

			var el = document.createElementNS("http://www.w3.org/2000/svg", "path");

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