/**
  *   @author:      mustafa
  *   @website:     http://mus.tafa.us
  *   @email:       mustafa.0x@gmail.com
  *
  *   Copyright (C) mustafa
  *   This program is free software; you can redistribute it and/or modify
  *   it under the terms of the GNU Lesser General Public License v2.1
  *   as published by the Free Software Foundation.
  *
  *   http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt
  */

function contentSlider(nav, container, pixels, s){	
	s = s || {};
	s.method = s.method || 0;
	s.passes = s.passes || 10;
	s.delay = s.delay || 15;
 
	for (var navLinks = nav.getElementsByTagName("a"), i = 0; navLinks[i]; i++){
		navLinks[i].onclick = function(){
			clearInterval(contentSlider.interval || 0)
			contentSlider.slideTo(parseInt(this.href.substr(this.href.indexOf("#") + 1), 10) - 1);
			return false;
		};
	}

	if (s.method)
		container.style.width = (i * pixels) + "px";

	contentSlider.slideTo = function(page){
		var property = s.method ? "right" : "bottom",
			bottom = parseInt(container.style[property] || 0, 10),
			diff = (page * pixels) - bottom,
			diffAmt = diff / s.passes,
			real = bottom;

		if (!diff)
			return;

		contentSlider.interval = setInterval(function(){
			if ((bottom + diff) != real){
				real = (parseFloat(real) + diffAmt).toFixed(1);
				container.style[property] = real + "px";
			}
			else
				clearInterval(contentSlider.interval);
		}, s.delay);
	};
}
