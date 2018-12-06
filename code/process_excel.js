var path = require('path'), fs = require('fs')
var tagsObj = require('./result.json').tagsUnicos
Object.keys(tagsObj).forEach(v => tagsObj[v] = 0)
var tagsArray = Object.keys(tagsObj)
var tagsList = "," + tagsArray.join(",");

//funcion que nos permite copiar el contenido de un objeto a otro
//por defecto node copia la ubicación de memoria no el contenido
function jsonCopy(src) {
    return JSON.parse(JSON.stringify(src));
}

//funcion que nos da el valor correcto con una probabilidad del 72.3%
function getRandom(value){
    var num=Math.random();
    if(num < 0.723) return value
    else return value == 1 ? 0:1
}

//Funcion principal
function execute(startPath, maxFiles = Number.MAX_SAFE_INTEGER) {
    if (!fs.existsSync(startPath)) {
        console.error("No Dir:", startPath);
        return;
    }
    //Leemos los archivos en la ruta que se entrega
    var files = fs.readdirSync(startPath);
    var line = tagsList
    var lineRandom = tagsList;
    var correctos = 0;
    var incorrectos = 1;
    //Iteramos los archivos
    for (var i = 0; i < files.length && i < maxFiles; i++) {
        console.log("Procesando: ", filename);
        var filename = path.join(startPath, files[i]);
        //metemos el contenido en un arreglo
        var contents = fs.readFileSync(filename, 'utf8').split("\n");
        var lineObj = jsonCopy(tagsObj);
        var lineObjAux = jsonCopy(tagsObj);
        /*
            Generamos 2 cadenas:
            - La primera contiene una columna por archivo y una fila por tag, si el tag es parte del archivo
              el valor es 1, si no es 0.
            - La segunda contiene los mismas columnas y filas, sin embargo el valor solo es el correcto (el 
              mismo que la primera cadena) con un 72.3% de probabilidad
            Ambas estan en formato CSV
        */
        for(var j = 0; j < contents.length; j++){
            lineObj[contents[j]] = 1;
            lineObjAux[contents[j]] = getRandom(lineObj[contents[j]])
            if(lineObj[contents[j]] == lineObjAux[contents[j]]){
                //Aumentamos la cantidad de valores correctos en 1
                correctos++
            }else {
                //Aumentamos la cantidad de valores incorrectos en 1
                incorrectos++
            }
        }
        line = line + "\n" + files[i] + "," + Object.values(lineObj).join(",")
        lineRandom = lineRandom + "\n" + files[i] + "," + Object.values(lineObjAux).join(",")
    };
    //retornamos la cadena en con los valores correctos, con los valores random
    //el numero de valores random correctos e incorrectos
    return [line, lineRandom, correctos, incorrectos]
};

//Ejecutamos en la carpeta processed_labels pero con un tope de 50 archivos
var result = execute('../processed_labels', 50);
//guardamos los valores correctos en un archivo csv.
fs.writeFileSync(
    path.join('./result_matrix.csv'),
    result[0],
    function (err) { console.log(err ? 'Error :'+err : 'ok') }
);
//guardamos los valores random en un archivo csv.
fs.writeFileSync(
    path.join('./result_matrix_random.csv'),
    result[1],
    function (err) { console.log(err ? 'Error :'+err : 'ok') }
);
//guardamos la eficiencia en un archivo csv.
fs.writeFileSync(
    path.join('./result_efi.csv'),
    "Correctos," + result[2] + "\nIncorrectos," + result[3] + "\nTotal," + (result[2] + result[3]) + "\nEficiencia," + (result[2]/(result[2] + result[3])),
    function (err) { console.log(err ? 'Error :'+err : 'ok') }
);
