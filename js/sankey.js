
d3.sankey = function() {
  var sankey = {},
      nodeWidth = 24,
      nodePadding = 8,
      size = [1, 1],
      nodes = [],
      links = [],
	    stoplist = ["indri","lucene","nostop","smart","snowball","terrier"], 
	    stemmer = ["krovetz","lovins","nolug","porter","snowballPorter","weakPorter"],
	    model = ["bb2","bm25","dfiz","dfree","dirichletlm","dlh","dph","hiemstralm","ifb2","inb2","inexpb2","inl2","jskls","lemurtfidf","lgd","pl2","tfidf"];
      //i tre array vengono utilizzati per determinare la dimensione del nodo

  sankey.nodeWidth = function(_) {
    if (!arguments.length) return nodeWidth;
    nodeWidth = +_;
    return sankey;
  };

  sankey.nodePadding = function(_) {
    if (!arguments.length) return nodePadding;
    nodePadding = +_;
    return sankey;
  };

  sankey.nodes = function(_) {
    if (!arguments.length) return nodes;
    nodes = _;
    return sankey;
  };

  sankey.links = function(_) {
    if (!arguments.length) return links;
    links = _;
    return sankey;
  };

  sankey.size = function(_) {
    if (!arguments.length) return size;
    size = _;
    return sankey;
  };

  sankey.layout = function(iterations) {
    computeNodeLinks();
    computeNodeValues();
    computeNodeBreadths();
    computeNodeDepths(iterations);
    computeLinkDepths();
    return sankey;
  };

  sankey.relayout = function() {
    linkSize();
    computeLinkDepths();
    return sankey;
  };

  sankey.update = function() {
    linkSize();
    return sankey;
  }

  sankey.link = function() {
    var curvature = .5;

    function link(d) {
      var x0 = d.source.x + d.source.dx,
          x1 = d.target.x,
          xi = d3.interpolateNumber(x0, x1),
          x2 = xi(curvature),
          x3 = xi(1 - curvature),
          y1 = d.target.y + d.ty+d.dy/2;
          //y2 = d.source.y + d.sy + d.dy,
          //y3 = d.target.y + d.ty + d.dyTarget,
          y0 = d.source.y + d.sy + d.dy/2;
          // + d.dy / 2;

          if(stoplist.indexOf(d.target.name) == -1 && stemmer.indexOf(d.target.name) == -1 && model.indexOf(d.target.name) == -1)
          {
            //var numbLinks = d.target.name.targetLinks.length;
            y1 = d.target.y + d.id%(d.target.height);
            y0 = d.source.y + ((d.source.dy)/(d.source.sourceLinks.length))*d.source.sourceLinks.indexOf(d);
          }
                

          //y1 = d.target.y + d.ty + d.dy / 2;
		  
          //y0 = d.source.y + (d.source.dy - d.dy*d.source.sourceLinks.length)/2 + d.sy + d.dy/2,
		      //y1 = d.target.y + (d.target.dy - d.dy*d.target.targetLinks.length)/2 + d.ty + d.dy / 2;
		  
		      //y0 = d.source.y + d.source.dy / 2 ,
          //y1 = d.target.y + d.target.dy / 2;
      return "M" + x0 + "," + y0
           + "C" + x2 + "," + y0
           + " " + x3 + "," + y1
           + " " + x1 + "," + y1; /*
           + "L" + x1 + "," + y3
           + "C" + x3 + "," + y3
           + " " + x2 + "," + y2
           + " " + x0 + "," + y2 
           ;*/
    }




    link.curvature = function(_) {
      if (!arguments.length) return curvature;
      curvature = +_;
      return link;
    };

    return link;
  };

  function linkSize() {
      
      links.forEach(function(link) {
        link.dy = (Math.min(link.target.dy/link.target.targetLinks.length, 
          link.source.dy/link.source.sourceLinks.length))*link.value;

      
    });
  }

  // Populate the sourceLinks and targetLinks for each node.
  // Also, if the source and target are not objects, assume they are indices.
  function computeNodeLinks() {
    nodes.forEach(function(node) {
      node.sourceLinks = [];
      node.targetLinks = [];
    });
    links.forEach(function(link) {
      var source = link.source,
          target = link.target;
      if (typeof source === "number") source = link.source = nodes[link.source];
      if (typeof target === "number") target = link.target = nodes[link.target];
      source.sourceLinks.push(link);
      target.targetLinks.push(link);
    });
  }

  // Compute the value (size) of each node by summing the associated links.
  function computeNodeValues() {
    nodes.forEach(function(node) {
      node.value = Math.max(
        d3.sum(node.sourceLinks, value),
        d3.sum(node.targetLinks, value)
      );
    });
  }
  

  // Iteratively assign the breadth (x-position) for each node.
  // Nodes are assigned the maximum breadth of incoming neighbors plus one;
  // nodes with no incoming links are assigned breadth zero, while
  // nodes with no outgoing links are assigned the maximum breadth.
  function computeNodeBreadths() {
    var remainingNodes = nodes,
        nextNodes,
        x = 0;

    while (remainingNodes.length) {
      nextNodes = [];
      remainingNodes.forEach(function(node) {
        node.x = x;
        node.dx = node.width;
        node.sourceLinks.forEach(function(link) {
          nextNodes.push(link.target);
        });
      });
      remainingNodes = nextNodes;
      ++x;
    }

    //
    moveSinksRight(x);
    scaleNodeBreadths((size[1] - nodeWidth) / (x - 1)); 
  }

  function moveSourcesRight() {
    nodes.forEach(function(node) {
      if (!node.targetLinks.length) {
        node.x = d3.min(node.sourceLinks, function(d) { return d.target.x; }) - 1;
      }
    });
  }

  function moveSinksRight(x) {
    nodes.forEach(function(node) {
      if (!node.sourceLinks.length) {
        node.x = x - 1;
      }
    });
  }

  function scaleNodeBreadths(kx) {
    nodes.forEach(function(node) {
      node.x *= kx;
    });
  }

   

  function computeNodeDepths(iterations) {
    var nodesByBreadth = d3.nest()
        .key(function(d) { return d.x; })
        .sortKeys(d3.ascending)
        .entries(nodes)
        .map(function(d) { return d.values; });

    //
    initializeNodeDepth();
    resolveCollisions();
    for (var alpha = 1; iterations > 0; --iterations) {
      relaxRightToLeft(alpha *= .99);
      resolveCollisions();
      relaxLeftToRight(alpha);
      resolveCollisions();
    }

    function initializeNodeDepth() {
      var ky = d3.min(nodesByBreadth, function(nodes) {
        return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
      });

      nodesByBreadth.forEach(function(nodes) {
        nodes.forEach(function(node, i) {
          node.y = i;
          //var height = setNodeHeight(node);
            //node.dy = node.value * ky;
          node.dy = node.height;
          //console.log(node);
        });
      });

      links.forEach(function(link) {
        //console.log(link.target.name);
        if(stoplist.indexOf(link.target.name) != -1 || stemmer.indexOf(link.target.name) != -1 || model.indexOf(link.target.name) != -1)
        {
           // link.dy = link.value; 
            link.dy = (Math.min(link.target.dy/link.target.targetLinks.length, 
                            link.source.dy/link.source.sourceLinks.length))*link.value;
            //link.dyTarget = link.target.dy/link.target.targetLinks.length;
        }
        else
          link.dy = 2;
        
        
        //link.dy = Math.max(Math.min(link.target.dy/link.target.targetLinks.length, 
        //                    link.source.dy/link.source.sourceLinks.length), 1.5);// * ky;
      });
    }




 
	function setNodeHeight(node) {
	
		var setHeight;
		if(stoplist.indexOf(node.name) != -1)
		{
			setHeight = 154;
		}
		else if(stemmer.indexOf(node.name) != -1)
		{
			setHeight = 154;
		}
		else if(model.indexOf(node.name) != -1)
		{
			setHeight = 56;
		}
		
		else
			setHeight = 40;
		
		return setHeight;
	}

    function relaxLeftToRight(alpha) {
      nodesByBreadth.forEach(function(nodes, breadth) {
        nodes.forEach(function(node) {
          if (node.targetLinks.length) {
            var y = d3.sum(node.targetLinks, weightedSource) / d3.sum(node.targetLinks, value); //d3.sum(array[, accessor]) equivalent to array.map(accessor) before sum
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedSource(link) {
        return center(link.source) * link.value;
      }
    }

    function relaxRightToLeft(alpha) {
      nodesByBreadth.slice().reverse().forEach(function(nodes) {
        nodes.forEach(function(node) {
          if (node.sourceLinks.length) {
            var y = d3.sum(node.sourceLinks, weightedTarget) / d3.sum(node.sourceLinks, value);
            node.y += (y - center(node)) * alpha;
          }
        });
      });

      function weightedTarget(link) {
        return center(link.target) * link.value;
      }
    }

    function resolveCollisions() {
      nodesByBreadth.forEach(function(nodes) {
        var node,
            dy,
            y0 = 0,
            n = nodes.length,
            i;

        // Push any overlapping nodes down.
        //nodes.sort(ascendingDepth);
        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dy = y0 - node.y;
          if (dy > 0) node.y += dy;
          y0 = node.y + node.dy + nodePadding;
        }

        // If the bottommost node goes outside the bounds, push it back up.
        dy = y0 - nodePadding - size[1];
        if (dy > 0) {
          y0 = node.y -= dy;

          // Push any overlapping nodes back up.
          for (i = n - 2; i >= 0; --i) {
            node = nodes[i];
            dy = node.y + node.dy + nodePadding - y0;
            if (dy > 0) node.y -= dy;
            y0 = node.y;
          }
        }
      });
    }

    function ascendingDepth(a, b) {
      return a.y - b.y;
    }
  }

  function computeLinkDepths() {
    nodes.forEach(function(node) {
      node.sourceLinks.sort(ascendingTargetDepth);
      node.targetLinks.sort(ascendingSourceDepth);
    });
    nodes.forEach(function(node) {
      var sy = 0, ty = 0;
      node.sourceLinks.forEach(function(link) {
        link.sy = sy;
        /*if(link.dy<2)
          sy += 2;
          
        else */
        
        sy = sy + link.source.dy/link.source.sourceLinks.length;
      });
      node.targetLinks.forEach(function(link) {
        link.ty = ty;
      /*  if(link.dy<2)
          ty += 2;
        else */
        ty = ty + link.target.dy/link.target.targetLinks.length;
        //ty += link.dy;
      });
    });

    function ascendingSourceDepth(a, b) {
      return a.source.y - b.source.y;
    }

    function ascendingTargetDepth(a, b) {
      return a.target.y - b.target.y;
    }
  }

  function center(node) {
    return node.y + node.dy / 2;
  }

  function value(link) {
    return link.value;
  }

  return sankey;
};