/* =========================
   EXCEL HELPERS
========================= */

function escapeExcelXml(
    value
){

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&apos;"
    );

}


/* =========================
   GET EXCEL DATA
========================= */

function getExcelFires(){

    /*
       خروجی Excel برای
       همان بازه زمانی فعال
       و همان فیلتر مکانی
    */

    const fires =
        getVisibleFires();


    return fires;

}


/* =========================
   EXPORT EXCEL
========================= */

function exportExcel(){

    const fires =
        getExcelFires();


    if(
        !fires.length
    ){

        alert(
            "برای بازه انتخاب‌شده داده‌ای وجود ندارد."
        );

        return;

    }


    const headers =
        fireState.archiveHeaders.length

        ?

        fireState.archiveHeaders

        :

        Object.keys(
            fires[0]
        );


    let xml =

        '<?xml version="1.0"?>'

        +

        '<Workbook '

        +
        'xmlns="urn:schemas-microsoft-com:office:spreadsheet" '

        +
        'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'

        +

        '<Worksheet ss:Name="FireData">'

        +

        '<Table>';


    /* =========================
       HEADER ROW
    ========================= */

    xml +=
        "<Row>";


    headers.forEach(
        header => {

            xml +=

                "<Cell>"

                +

                '<Data ss:Type="String">'

                +

                escapeExcelXml(
                    header
                )

                +

                "</Data>"

                +

                "</Cell>";

        }
    );


    xml +=
        "</Row>";


    /* =========================
       DATA
    ========================= */

    fires.forEach(
        fire => {

            xml +=
                "<Row>";


            headers.forEach(
                header => {

                    xml +=

                        "<Cell>"

                        +

                        '<Data ss:Type="String">'

                        +

                        escapeExcelXml(
                            fire[header]
                        )

                        +

                        "</Data>"

                        +

                        "</Cell>";

                }
            );


            xml +=
                "</Row>";

        }
    );


    /* =========================
       CLOSE XML
    ========================= */

    xml +=

        "</Table>"

        +

        "</Worksheet>"

        +

        "</Workbook>";


    /* =========================
       CREATE FILE
    ========================= */

    const blob =
        new Blob(
            [xml],
            {
                type:
                    "application/vnd.ms-excel"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "fires_"
        +
        new Date()
            .toISOString()
            .slice(
                0,
                10
            )
        +
        ".xls";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


/* =========================
   INIT EXCEL BUTTON
========================= */

function initExcelButton(){

    const button =
        $("excelBtn");


    if(
        !button
    ){

        return;

    }


    button.addEventListener(
        "click",
        exportExcel
    );

}
