var imageMapCreator = function (p) {

	var areaMode = "rect";
	var tempArea = new Area();
	var bgLayer = new BgLayer();
	var map = new ImageMap();
	var img = null;

	p.setup = function () {
		var canvas = p.createCanvas(600, 450);
		canvas.drop(p.handeFile).dragLeave(p.onLeave).dragOver(p.onOver);
	}

	p.draw = function () {
		if (p.mouseIsPressed) {
			tempArea.updateLastCoord(p.mouseX, p.mouseY)
		}

		p.background(img ? img : 200);
		bgLayer.display();
		p.fill(255, 255, 255, 178);
		p.strokeWeight(1);
		p.stroke(0);
		var allAreas = map.areas.concat([tempArea]);
		allAreas.forEach(area => {
			if (area.isValidShape())
				p.rect(area.coords[0].x, area.coords[0].y, area.coords[1].x, area.coords[1].y);
		});
	}

	//------------------------------ Events -----------------------------------

	p.mousePressed = function () {
		if (p.mouseIsHover()) {
			if (p.mouseButton == p.LEFT) {
				p.setTempArea(p.mouseX, p.mouseY);
			} else if (p.mouseButton == p.RIGHT) {
				var area = p.mouseIsHoverArea();
				if (area != undefined) {
					var input = prompt("Entrez l'url vers laquelle devrait pointer cette zone", area.href ? area.href : "http://" );
					if (input != null)
						area.href = input;
				}
				return false;
			}
		}
	}

	p.mouseReleased = function () {
		if (tempArea.isValidShape())
			map.addArea(tempArea);
		tempArea = new Area();
		bgLayer.disappear();
	}

	//---------------------------- Functions ----------------------------------

	p.mouseIsHover = function () {
		return p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0;
	}

	p.mouseIsHoverArea = function () {
		var allAreas = map.areas.slice();
		return allAreas.reverse().find(area => {
			return area.isHover(p.mouseX, p.mouseY);
		});
	}

	p.onOver = function (evt) {
		bgLayer.appear();
		evt.preventDefault();
	}

	p.onLeave = function () {
		bgLayer.disappear();
	}

	p.handeFile = function (file) {
		if (file.type == "image") {
			img = p.loadImage(file.data);
			map.image = file.name;
		}
		bgLayer.disappear();
	}

	p.setTempArea = function (x, y) {
		var coords = [new XY(x, y)];
		switch (areaMode) {
			case "rect":
				tempArea = new AreaRect(coords);
				break;
			case "circle":
				tempArea = new AreaCircle(coords);
				break;
			case "poly":
				tempArea = new AreaPoly(coords);
				break;
		}
	}

	p.getMap = function () {
		return map;
	}

	p.clearAreas = function () {
		map.clearAreas();
	}

	p.addBgArea = function () {
		var coords = [new XY(0, 0), new XY(p.width - 1, p.height - 1)];
		var area = new AreaRect(coords);
		map.unshiftArea(area);
	}

	//---------------------------- P5 Classes ---------------------------------

	/**
	 * Class representing the semi transparent layer which can appear on top of the background
	 * @param {number} speed the speed of the opacity animation (1-255, default 15)
	 */
	function BgLayer(speed = 15) {
		this.speed = speed;
		this.alpha = 0;
		this.over = false;
	}

	BgLayer.prototype.appear = function () {
		this.over = true;
	}

	BgLayer.prototype.disappear = function () {
		this.over = false;
	}

	BgLayer.prototype.display = function () {
		if (this.over) {
			if (this.alpha < 100)
				this.alpha += this.speed;
		} else {
			if (this.alpha > 0)
				this.alpha -= this.speed;
		}
		p.noStroke();
		p.fill(255, 255, 255, this.alpha);
		p.rect(0, 0, p.width, p.height);
	}
}