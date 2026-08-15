/* =========================
   AREA STATE
========================= */

const areaState = {

    protectedGeoJSON:
        null,

    huntingGeoJSON:
        null,

    protectedLayer:
        null,

    huntingLayer:
        null,

    filter:
        "none"

};


/* =========================
   LOAD GEOJSON
========================= */

async function loadAreaGeoJSON(
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
   LOAD PROTECTED AREAS
========================= */

async function loadProtectedAreas(){

    try{

        areaState.protectedGeoJSON =
            await loadAreaGeoJSON(
                CONFIG.protected
            );


        areaState.protectedLayer =
            L.geoJSON(
                areaState.protectedGeoJSON,
                {

                    pane:
                        "areaPane",

                    style:{

                        color:
                            "#1976d2",

                        weight:
                            2,

                        fillColor:
                            "#1976d2",

                        fillOpacity:
                            0.05

                    }

                }
            );

    }catch(error){

        console.warn(
            "خطا در مناطق چهارگانه:",
            error
        );

    }

}


/* =========================
   LOAD HUNTING AREAS
========================= */

async function loadHuntingAreas(){

    try{

        areaState.huntingGeoJSON =
            await loadAreaGeoJSON(
                CONFIG.hunting
            );


        areaState.huntingLayer =
            L.geoJSON(
                areaState.huntingGeoJSON,
                {

                    pane:
                        "areaPane",

                    style:{

                        color:
                            "#7b1fa2",

                        weight:
                            2,

                        fillColor:
                            "#7b1fa2",

                        fillOpacity:
                            0.05

                    }

                }
            );

    }catch(error){

        console.warn(
            "خطا در مناطق شکار ممنوع:",
            error
        );

    }

}


/* =========================
   POINT IN RING
========================= */

function areaPointInRing(
    point,
    ring
){

    const x =
        point[0];

    const y =
        point[1];


    let inside =
        false;


    for(
        let i = 0,
            j = ring.length - 1;

        i < ring.length;

        j = i++
    ){

        const xi =
            ring[i][0];

        const yi =
            ring[i][1];


        const xj =
            ring[j][0];

        const yj =
            ring[j][1];


        const intersect =
            (
                yi > y
            )
            !==
            (
                yj > y
            )
            &&
            x <
            (
                (
                    xj - xi
                )
                *
                (
                    y - yi
                )
                /
                (
                    yj - yi
                )
                +
                xi
            );


        if(
            intersect
        ){

            inside =
                !inside;

        }

    }


    return inside;

}


/* =========================
   POINT IN POLYGON
========================= */

function areaPointInPolygon(
    point,
    rings
){

    if(
        !rings ||
        !rings.length
    ){

        return false;

    }


    /*
       حلقه اصلی
    */

    if(
        !areaPointInRing(
            point,
            rings[0]
        )
    ){

        return false;

    }


    /*
       حفره‌های Polygon
    */

    for(
        let i = 1;

        i < rings.length;

        i++
    ){

        if(
            areaPointInRing(
                point,
                rings[i]
            )
        ){

            return false;

        }

    }


    return true;

}


/* =========================
   FIND REGION NAME
========================= */

function findAreaName(
    properties
){

    if(
        !properties
    ){

        return "";

    }


    const preferredKeys = [

        "name",
        "NAME",
        "Name",

        "نام",
        "نام منطقه",
        "نام_منطقه",

        "نام منطقه حفاظت شده",
        "نام منطقه شکار ممنوع",

        "area_name",
        "AREA_NAME",

        "area",
        "AREA",

        "title",
        "Title",

        "region",
        "Region",

        "zone",
        "ZONE",

        "Name_1",
        "NAME_1"

    ];


    for(
        const key of preferredKeys
    ){

        if(
            properties[key] !==
                undefined
            &&
            properties[key] !==
                null
            &&
            String(
                properties[key]
            ).trim() !== ""
        ){

            return String(
                properties[key]
            ).trim();

        }

    }


    /*
       اگر نام فیلد متفاوت بود،
       دنبال فیلدی می‌گردیم که
       name یا نام داشته باشد.
    */

    const dynamicKey =
        Object.keys(
            properties
        )
        .find(
            key =>
                /name|نام|title|عنوان/i
                .test(
                    key
                )
        );


    if(
        dynamicKey
    ){

        return String(
            properties[
                dynamicKey
            ]
        ).trim();

    }


    return "";

}


/* =========================
   FIND REGIONS AT POINT
========================= */

function findAreasAtPoint(
    lat,
    lon
){

    const result = {

        protected:[],

        hunting:[]

    };


    const point = [

        Number(lon),

        Number(lat)

    ];


    function scanGeoJSON(
        geojson,
        target
    ){

        if(
            !geojson
        ){

            return;

        }


        const features =
            geojson.type ===
                "FeatureCollection"

            ?

            geojson.features

            :

            geojson.type ===
                "Feature"

            ?

            [geojson]

            :

            [];


        for(
            const feature
            of features
        ){

            if(
                !feature ||
                !feature.geometry
            ){

                continue;

            }


            const geometry =
                feature.geometry;


            let inside =
                false;


            /*
               Polygon
            */

            if(
                geometry.type ===
                    "Polygon"
            ){

                inside =
                    areaPointInPolygon(
                        point,
                        geometry.coordinates
                    );

            }


            /*
               MultiPolygon
            */

            if(
                geometry.type ===
                    "MultiPolygon"
            ){

                for(
                    const polygon
                    of
                    geometry.coordinates
                ){

                    if(
                        areaPointInPolygon(
                            point,
                            polygon
                        )
                    ){

                        inside =
                            true;

                        break;

                    }

                }

            }


            if(
                inside
            ){

                const name =
                    findAreaName(
                        feature.properties
                    );


                if(
                    name &&
                    !result[target]
                        .includes(
                            name
                        )
                ){

                    result[target]
                        .push(
                            name
                        );

                }

            }

        }

    }


    scanGeoJSON(
        areaState.protectedGeoJSON,
        "protected"
    );


    scanGeoJSON(
        areaState.huntingGeoJSON,
        "hunting"
    );


    return result;

}


/* =========================
   APPLY AREA FILTER
========================= */

function applyAreaFilter(
    fires
){

    if(
        areaState.filter ===
            "none"
    ){

        return fires;

    }


    const geojson =
        areaState.filter ===
            "protected"

        ?

        areaState.protectedGeoJSON

        :

        areaState.huntingGeoJSON;


    if(
        !geojson
    ){

        return [];

    }


    return fires.filter(
        fire => {

            const lat =
                Number(
                    fire.latitude
                );


            const lon =
                Number(
                    fire.longitude
                );


            if(
                !Number.isFinite(
                    lat
                )
                ||
                !Number.isFinite(
                    lon
                )
            ){

                return false;

            }


            const areas =
                findAreasAtPoint(
                    lat,
                    lon
                );


            if(
                areaState.filter ===
                    "protected"
            ){

                return (
                    areas.protected
                        .length > 0
                );

            }


            return (
                areas.hunting
                    .length > 0
            );

        }
    );

}


/* =========================
   SET FILTER
========================= */

function setAreaFilter(
    type
){

    areaState.filter =
        type;


    const protectedCheckbox =
        $("protectedFilter");


    const huntingCheckbox =
        $("huntingFilter");


    if(
        protectedCheckbox
    ){

        protectedCheckbox.checked =
            type ===
            "protected";

    }


    if(
        huntingCheckbox
    ){

        huntingCheckbox.checked =
            type ===
            "hunting";

    }


    updateAreaLayers();

}


/* =========================
   UPDATE LAYERS
========================= */

function updateAreaLayers(){

    const map =
        getMap();


    if(
        !map
    ){

        return;

    }


    /*
       مناطق چهارگانه
    */

    if(
        areaState.protectedLayer
    ){

        if(
            areaState.filter ===
                "protected"
        ){

            if(
                !map.hasLayer(
                    areaState.protectedLayer
                )
            ){

                areaState.protectedLayer
                    .addTo(
                        map
                    );

            }

        }else{

            if(
                map.hasLayer(
                    areaState.protectedLayer
                )
            ){

                map.removeLayer(
                    areaState.protectedLayer
                );

            }

        }

    }


    /*
       شکار ممنوع
    */

    if(
        areaState.huntingLayer
    ){

        if(
            areaState.filter ===
                "hunting"
        ){

            if(
                !map.hasLayer(
                    areaState.huntingLayer
                )
            ){

                areaState.huntingLayer
                    .addTo(
                        map
                    );

            }

        }else{

            if(
                map.hasLayer(
                    areaState.huntingLayer
                )
            ){

                map.removeLayer(
                    areaState.huntingLayer
                );

            }

        }

    }

}


/* =========================
   CONNECT FILTER BUTTONS
========================= */

function initAreaControls(){

    const protectedCheckbox =
        $("protectedFilter");


    const huntingCheckbox =
        $("huntingFilter");


    if(
        protectedCheckbox
    ){

        protectedCheckbox
            .addEventListener(
                "change",
                () => {

                    if(
                        protectedCheckbox.checked
                    ){

                        setAreaFilter(
                            "protected"
                        );

                    }else{

                        setAreaFilter(
                            "none"
                        );

                    }


                    refreshFireDisplay();

                }
            );

    }


    if(
        huntingCheckbox
    ){

        huntingCheckbox
            .addEventListener(
                "change",
                () => {

                    if(
                        huntingCheckbox.checked
                    ){

                        setAreaFilter(
                            "hunting"
                        );

                    }else{

                        setAreaFilter(
                            "none"
                        );

                    }


                    refreshFireDisplay();

                }
            );

    }

}
