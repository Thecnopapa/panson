







const navigation = document.getElementsByClassName("navigation")[0];
const navLeft = document.getElementById('nav-left');

const navButtons = [...document.getElementsByClassName('dropbtn')];
const lanButtons = [...document.getElementsByClassName('language')];

const cartIcon = document.getElementsByClassName('shopping-cart')[0];
const cartCircle = document.getElementsByClassName('cercle-carret')[0];
const navTitle = document.getElementById("title")


camaleonElements.push(...navButtons, ...lanButtons, cartCircle, cartIcon)

if (navTitle) {
    camaleonElements.push(navTitle)
}






function goBlack(){
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null) {
            camaleonElements[i].classList.remove('white');
        }
    }
}

function goWhite(){
    for (let i = 0; i < camaleonElements.length; i++) {
        if (camaleonElements[i] !== null) {
            camaleonElements[i].classList.add('white');
        }
    }
}

function checkColor() {
    const colorElement = document.getElementById("nav-color")
    if (colorElement !== null) {
        try {
            let targetColour = colorElement.attributes.color.value;
            if (targetColour === "white") {
                goWhite();
            } else if (targetColour === "black") {
                goBlack();
            }
        } catch {}
        try{
            let navColour = colorElement.attributes.navColor.value;
            if (navColour === "translucid") {
                navigation.classList.remove("opaque");
            } else if (navColour === "opaque") {
                navigation.classList.add("opaque");
            }
        } catch {}
    }
}

const c = checkColor()
if (c != null) {
   console.log(" * Nav colour: ", c);
}


function background_to_url(background){
    return  background.replace(/"/g, "").split("(")[1].split(")")[0];
}


function getImageBrightness(url) {
    console.log(url)
    const newImg = document.createElement("img");


    newImg.style.zIndex = "-999";
    newImg.src = url
    newImg.classList.add("hidden");


    let colorSum = 0;
    newImg.onload = function() {
        let canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

        for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        let brightness = Math.floor(colorSum / (this.width*this.height));
      console.log(brightness);
      newImg.setAttribute("brightness", brightness);
    }
    return newImg.getAttribute("brightness");
}

function getImageBrightnessSO(image,callback) {
    var thisImgID = image.attr("id");

    const img = document.createElement("img");
    img.src = image.attr("src");

    img.style.display = "none";
    document.body.appendChild(img);

    let colorSum = 0;

    img.onload = function() {
        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

          for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (this.width*this.height));
        callback(thisImgID, brightness);
    }
}





let blackObserver = new IntersectionObserver((triggers) => {colorScroll(triggers);} ,{threshold: 0.06}
);


function colorScroll(triggers){
    if (!triggers[0].isIntersecting) {
        goBlack();
        navigation.classList.add("opaque");
    } else {
        checkColor();
        navigation.classList.remove("opaque");
    }
}



try{
    blackObserver.observe(document.getElementById("producte-images"));
    
} catch {}

try{
    blackObserver.observe(document.getElementsByClassName("imatge-collecio")[0]);
    /*camaleonElements.push(document.getElementsByClassName("titol-collecio")[0])
    document.getElementsByClassName("titol-collecio")[0].addEventListener("click", function() {
        let galleries = [...document.getElementsByClassName('content-galeria')];
        galleries.forEach(g => {if (g.offsetParent !== null){g.scrollIntoView({block: 'end'})}});
    });*/
    
} catch {}

window.addEventListener("load", (e) =>{
	checkColor()
});


console.log(" * Navigation JS ready")
