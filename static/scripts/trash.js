
class Slideshow{
    constructor(container, displayCounter=true) {
        this.imageContainer = container;
        this.images = container.children;
        this.counter = 0;
        this.n_images = this.imageContainer.childElementCount;
        this.state = "still";

        this.displayCounter = displayCounter
        this.lastImage =this.imageContainer.lastElementChild;
        if (displayCounter){this.createCounter();}
        this.update(0);
    }

    createCounter(){
	var bubbles = document.createElement("div");
	    bubbles.classList.add("bubbles");
	for (let i = 0; i < this.n_images; i++) {
		var newBubble = document.createElement("span");
		newBubble.classList.add("bubble");
        newBubble.setAttribute("onclick","event.stopPropagation(productSlideshow.jumpTo("+String(i)+"))");
		bubbles.appendChild(newBubble);
	}
	    var scroller = document.createElement("span");
	    scroller.classList.add("scroller");
	    bubbles.appendChild(scroller);
	    this.imageContainer.appendChild(bubbles);
	    this.bubbles = this.imageContainer.querySelectorAll('.bubble');
	    this.scroller = this.imageContainer.querySelector(".bubbles").lastElementChild;
	    this.scrollerWidth = 100 / this.bubbles.length;
    }
    updateBubbles(){
        for (var i = 0; i < this.bubbles.length; i++) {
            if (i === this.counter){
                this.bubbles[i].classList.add("current-bubble");
            } else {
                this.bubbles[i].classList.remove("current-bubble");
            }
        }
	this.scroller.style.width = String(this.scrollerWidth) +"%";
	this.scroller.style.left = String(this.scrollerWidth * this.counter) + "%";
    }


    selectImages(){
        if (this.counter === 0) {
            this.prevImg = this.lastImage;
        } else {
            this.prevImg = this.images[this.counter - 1];
        }
        this.currentImg = this.images[this.counter];
        if (this.counter === this.n_images-1) {
            this.nextImg = this.images[0];
        } else {
            this.nextImg = this.images[this.counter + 1];
        }
    }

    jumpTo(target, self=this){
        console.log("Jumping to " + target);
        target = Number(target);
        console.log(self);
        console.log(self.counter, target);
        if (self.counter == target) {} else {
            if (self.counter > target) {
            self.update(-1);
        } else if (self.counter < target) {
            self.update(1);
        }
            console.log(self.counter, target);
        setTimeout(self.jumpTo, 400, target, self);
        }

    }

    update(change){
        if (this.state === "still") {
            this.state = "active";
            this.counter += Number(change);
            if (this.counter >= this.n_images) {
                this.counter = 0;
            }
            if (this.counter <0) {
                this.counter = this.n_images-1;
            }
            this.selectImages();
            this.displayImages();
            if (this.displayCounter) {
                this.updateBubbles();
            }

        } else {
            console.log("slideshow active")
        }
    }


    displayImages(){
	    try {
            for (let n = 0; n < this.n_images; n++) {
                this.images[n].classList = "foto_producte"
            }
            this.currentImg.classList.add("current");
            this.currentImg.classList.remove("previous");
            this.currentImg.classList.remove("next");
            this.prevImg.classList.add("previous");
            this.prevImg.classList.remove("current");
            this.nextImg.classList.add("next");
            this.nextImg.classList.remove("current");

        } catch(err) {
            console.log(err.message);
            console.log(this.prevImg);
            console.log(this.currentImg);
            console.log(this.nextImg);
        }
        setTimeout(this.displayImages2, 400, this);
    }
    displayImages2(t){
        t.state = "still";
    }
}



function slideshowNext(slideshow){
	if (slideshow === "producte"){
        productSlideshow.update(1);
	}
}

function slideshowPrev(slideshow){
	if (slideshow === "producte"){
        productSlideshow.update(-1);
        console.log("slideshowPrev");
	}
}
