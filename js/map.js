const mapState = {

    map:
        null,

    lightMap:
        null,

    darkMap:
        null,

    boundaryLayer:
        null,

    fireLayer:
        null

};


/* =========================
   CREATE MAP
========================= */

function createMap(){

    mapState.map =
        L.map(
            "map"
        );


    /*
       نقشه روز
       همان OpenStreetMap اصلی پروژه
    */

    mapState.lightMap =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom:
                    18,

                attribution:
                    "© OpenStreetMap contributors"
            }
        )
        .addTo(
            mapState.map
        );


    /*
       نقشه شب
    */

    mapState.darkMap =
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
                maxZoom:
                    19,

                attribution:
                    "© OpenStreetMap © CARTO"
            }
        );


    /*
       Pane مرز
    */

    mapState.map.createPane(
        "boundaryPane"
    );


    mapState.map.getPane(
        "boundaryPane"
    ).style.zIndex =
        400;


    /*
       Pane مناطق
    */

    mapState.map.createPane(
        "areaPane"
    );


    mapState.map.getPane(
        "areaPane"
    ).style.zIndex =
        450;


    /*
       Pane حریق
    */

    mapState.map.createPane(
        "firePane"
    );


    mapState.map.getPane(
        "firePane"
    ).style.zIndex =
        600;


    /*
       گروه حریق‌ها
    */

    mapState.fireLayer =
        L.layerGroup()
        .addTo(
            mapState.map
        );


    /*
       موقعیت اولیه
    */

    mapState.map.setView(
        [
            29.6,
            52.5
        ],
        8
    );

}


/* =========================
   LOAD GEOJSON
========================= */

async function loadMapGeoJSON(
    file
){

    const text =
        await getText(
            file
        );


    return JSON.parse(
        text
    );

}


/* =========================
   LOAD FARS BOUNDARY
========================= */

async function loadBoundary(){

    try{

        const data =
            await loadMapGeoJSON(
                CONFIG.boundary
            );


        mapState.boundaryLayer =
            L.geoJSON(
                data,
                {

                    pane:
                        "boundaryPane",

                    style:{

                        color:
                            "#ff0000",

                        weight:
                            4,

                        opacity:
                            1,

                        fillColor:
                            "#ff0000",

                        fillOpacity:
                            0.02

                    }

                }
            )
            .addTo(
                mapState.map
            );


        const bounds =
            mapState.boundaryLayer
            .getBounds();


        if(
            bounds.isValid()
        ){

            mapState.map.fitBounds(
                bounds,
                {
                    padding:
                        [
                            15,
                            15
                        ]
                }
            );

        }

    }catch(error){

        console.error(
            "خطا در بارگذاری مرز فارس:",
            error
        );

    }

}


/* =========================
   GET MAP
========================= */

function getMap(){

    return mapState.map;

}


/* =========================
   GET FIRE LAYER
========================= */

function getFireLayer(){

    return mapState.fireLayer;

}


/* =========================
   TOGGLE NIGHT
========================= */

function toggleMapNight(
    enabled
){

    if(
        !mapState.map
    ){

        return;

    }


    if(
        enabled
    ){

        if(
            mapState.map.hasLayer(
                mapState.lightMap
            )
        ){

            mapState.map.removeLayer(
                mapState.lightMap
            );

        }


        if(
            !mapState.map.hasLayer(
                mapState.darkMap
            )
        ){

            mapState.darkMap.addTo(
                mapState.map
            );

        }

    }else{

        if(
            mapState.map.hasLayer(
                mapState.darkMap
            )
        ){

            mapState.map.removeLayer(
                mapState.darkMap
            );

        }


        if(
            !mapState.map.hasLayer(
                mapState.lightMap
            )
        ){

            mapState.lightMap.addTo(
                mapState.map
            );

        }

    }

}


/* =========================
   RESTORE NIGHT MODE
========================= */

function restoreMapNight(){

    const enabled =
        localStorage.getItem(
            "fars-night"
        ) === "1";


    if(
        enabled
    ){

        toggleMapNight(
            true
        );

    }

}


/* =========================
   MAP RESIZE
========================= */

function refreshMapSize(){

    if(
        mapState.map
    ){

        mapState.map.invalidateSize(
            true
        );

    }

}
