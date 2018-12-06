var path = require('path'), fs = require('fs');
var verbs = require('./verbs.json');
var nouns = require('./nouns.json');
var words_dictionary = require('./words_dictionary.json');

function fromDir(startPath, maxFiles = Number.MAX_SAFE_INTEGER) {
    var returnObject = {};
    returnObject.totalTags = 0;
    returnObject.totalTagsFiltrados = 0;
    returnObject.totalTagsUnicos = 0;
    returnObject.tagsUnicos = {};
    //Verificamos que existe el directorio
    if (!fs.existsSync(startPath)) {
        console.error("No Dir ", startPath);
        return;
    }
    //Leemos todos los archivos que existen en el directorio
    var files = fs.readdirSync(startPath);
    //Iteramos todos los archivos o hasta un número máximo (maxFiles)
    for (var i = 0; i < files.length && i < maxFiles; i++) {
        console.log("Procesando: ", filename);
        //Obtenemos la ruta absoluta del archivo
        var filename = path.join(startPath, files[i]);
        //Leemos el contenido del archivo y cada línea lo guardamos en un array
        var contents = fs.readFileSync(filename, 'utf8').split("\n");
        var filteredContents = [];
        //Iteramos el contenido
        for(var j = 0; j < contents.length; j++){
            //Aumentamos el total de tags
            returnObject.totalTags++;
            //Verificamos que la palabra existe en alguno de los diccionarios
            if(verbs[contents[j]] || nouns[contents[j]] || words_dictionary[contents[j]]){
                filteredContents.push(contents[j]);
                //Aumentalos el total de tags válidos en 1
                returnObject.totalTagsFiltrados++;
                //Este if es para contar el número de repeticiones por tag
                if(returnObject.tagsUnicos[contents[j]]){
                    //Si en nuestro objeto en donde guardamos los tags ya existe un tag igual, aumentamos su value en 1
                    returnObject.tagsUnicos[contents[j]]++;
                }else{
                    //Si no entonces aumentamos el total de Tags únicos en 1 y seteamos el valor del tag en 1
                    returnObject.totalTagsUnicos++;
                    returnObject.tagsUnicos[contents[j]] = 1;
                }
            }
        }
        //Guardamos en un archivo del mismo nombre pero en la carpeta "processed" los tags válidos.
        fs.writeFileSync(
            path.join('../processed_labels', files[i]),
            filteredContents.join('\n'),
            function (err) { console.log(err ? 'Error :'+err : path.join(startPath + '/processed', files[i])) }
       );
    };
    return returnObject;
};

//Ejecutamos nuestra funcion y leemos la carpeta labels_aux en el directorio anterior
var result = fromDir('../labels_aux', 50);
//Guardamos el resultado final de todo en un archivo result.json
fs.writeFileSync(
    path.join('./result.json'),
    JSON.stringify(result, null, 2),
    function (err) { console.log(err ? 'Error :'+err : 'ok') }
);