class MetroDataProcesser {
	constructor() {
		this.stationList = [];
		this.edgeMap = {};
		this.edgeColours = {};

		this.min_lat = Number.MAX_SAFE_INTEGER;
		this.min_long = Number.MAX_SAFE_INTEGER;
		this.max_lat = Number.MIN_SAFE_INTEGER;
		this.max_long = Number.MIN_SAFE_INTEGER;
	}

	parseStationString(stationString) {
		var stationArr = stationString.split("\n");
		for (var idx=0; idx < stationArr.length; idx++) {
			let row = stationArr[idx].split(",")
			row[1] = parseFloat(row[1]);
			row[2] = parseFloat(row[2]);
			this.stationList.push(row);

			//logic to check for min and max lat long
			this.min_lat = Math.min(this.min_lat, row[1])
			this.max_lat = Math.max(this.max_lat, row[1])
			this.min_long = Math.min(this.min_long, row[2])
			this.max_long = Math.max(this.max_long, row[2])
		}
	}

	parseEdgeString(lineName, edgeString) {
		this.edgeMap[lineName] = edgeString.split("\n");
		for (var idx=0; idx < this.edgeMap[lineName].length; idx++) {
			this.edgeMap[lineName][idx] = this.edgeMap[lineName][idx].split(",");
			this.edgeMap[lineName][idx][2] = parseInt(this.edgeMap[lineName][idx][2]);
		}
	}

	parseEdgeColours(edgeColourString) {
		var edgeColourArr = edgeColourString.split("\n");
		for (var idx=0; idx < edgeColourArr.length; idx++) {
			var tempArr = edgeColourArr[idx].split(",");
			var edgeCode = tempArr[0];
			var edgeColour = tempArr[1];
			this.edgeColours[edgeCode] = edgeColour;
		}
	}

	constructStations(metroGraph, mapDrawer) {
		//scaling + adding stations
		for (var idx=0; idx < this.stationList.length; idx++) {
			var name = this.stationList[idx][0];
			var x = ((this.stationList[idx][1] - this.min_lat) * mapDrawer.width) / (this.max_lat - this.min_lat);
			var y = ((this.stationList[idx][2] - this.max_long) * mapDrawer.height) / (this.min_long - this.max_long);

			//get codes
			var all_codes = name.split(" ").slice(-1)[0];
			var codes = all_codes.split("/");

			metroGraph.addStation(idx, new Station(idx, x + mapDrawer.x_padding, y + mapDrawer.y_padding, name, codes));
		}
	}

	constructMapPaths(metroGraph, mapDrawer) {
		for (const [edgeCode, edges] of Object.entries(this.edgeMap)) {
			var colour = this.edgeColours[edgeCode];

			//initialize empty path for FW and BW (forwards and backwards)
			metroGraph.metroPaths[edgeCode + "FW"] = [];
			metroGraph.metroPaths[edgeCode + "BW"] = [];

			for (var idx=0; idx < edges.length; idx++) {
				//get stationId
				var a = metroGraph.stationCodeMap[edges[idx][0]];
				var b = metroGraph.stationCodeMap[edges[idx][1]];
				var weight = edges[idx][2];

				//create new edges
				var abEdge = new Edge(metroGraph.stations[a], metroGraph.stations[b], weight, colour);
				var baEdge = new Edge(metroGraph.stations[b], metroGraph.stations[a], weight, colour);

				//add edges to adjacency list
				metroGraph.stations[a].addNeighbour(b, abEdge);
				metroGraph.stations[b].addNeighbour(a, baEdge);

				//add pathCodes to the stations
				metroGraph.stations[a].pathCodes.add(edgeCode);
				metroGraph.stations[b].pathCodes.add(edgeCode);

				//add stations to the path
				//add start station
				if (idx == 0) {
					metroGraph.metroPaths[edgeCode + "FW"].push(metroGraph.stations[a]);
					metroGraph.metroPaths[edgeCode + "BW"].unshift(metroGraph.stations[a]);
				}
				//add subsequent edge
				metroGraph.metroPaths[edgeCode + "FW"].push(abEdge);
				metroGraph.metroPaths[edgeCode + "BW"].unshift(baEdge);
				//add next station
				metroGraph.metroPaths[edgeCode + "FW"].push(metroGraph.stations[b]);
				metroGraph.metroPaths[edgeCode + "BW"].unshift(metroGraph.stations[b]);

			}
		}
	}

	constructMetroGraph(metroGraph, mapDrawer) {
		this.constructStations(metroGraph, mapDrawer);
		this.constructMapPaths(metroGraph, mapDrawer);
	}

}