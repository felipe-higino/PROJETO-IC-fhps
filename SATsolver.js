var exports = module.exports = {};
exports.solve = function (entrada) {
    globalProblema='';                                                      //variavel global(linha do problema)
    let formula = readFormula(`./${entrada}.cnf`);               
    console.log('-----\nreadFormula:\n',formula);                           //imprime formula

    let compativel = checkProblemSpecification(globalProblema,formula);     //verifica se problema eh compativel com a formula
    console.log('------\nfunction checkProblemSpecification: ',compativel);
    console.log('linha do problema: ', globalProblema);

    let solucao = doSolve(formula.clausulas, formula.variaveis);            //SAT
    if(solucao.isSat)
        console.log("\n-----PROBLEMA SOLUCIONADO-----", solucao.satisfyingAssignment);
    else
        console.log("\n-----PROBLEMA NAO TEM SOLUCAO-----");
    
    return solucao;
}
//--------------------------------------------------------------------------------------doSolve-------------------------//

function doSolve(clausulas,variaveis){   //retorna:  {isSat: true/false, e sequencia que satisfez o problema}
    let satisfez = false;
    let sequencia = variaveis;
    let numeroDeCombinacoes = Math.pow(2,variaveis.length);     //2^n, onde n = numero de variaveis
    let i;
    for(i=0;i<numeroDeCombinacoes;i++){                         //testa todas as 2^n combinacoes
        sequencia = nextAssignment(variaveis);                  //recebe array com sequencia e retorna nova sequencia
        let boolSequencia = testaSequencia(clausulas,sequencia);
        if(boolSequencia){
            satisfez = true;
            break;
        }
    }
    let objeto={
        isSat: false,
        satisfyingAssignment: null
    }
    if(satisfez){
        objeto.isSat = true;
        objeto.satisfyingAssignment = sequencia;                //sequencia que satisfez a formula
    }
    return objeto;
}
function testaSequencia(clausulas,sequencia){   //testa sequencia de true/false no problema e retorna se resolveu
    let resultado = true;
    let i;
    for(i=0;i<clausulas.length;i++){                            //testa se todas as clausulas sao verdadeiras
        let vereditoClausula = false;
        let j;
        for(j=0;j<clausulas[i].length;j++){                     //loop para cada elemento da clausula
            let elemento = clausulas[i][j];                     //string '-1', '1', '4'...
            let elementoInt = parseInt(elemento);               //NUMERO -1, 1, 4...
            let elementoBool;
            if(elementoInt<0){
                elementoInt *=-1;                       //torna positivo
                elementoBool = sequencia[elementoInt-1];//pega booleano original no array
                elementoBool = !elementoBool;           //inverte boleano
            }else{
                elementoBool = sequencia[elementoInt-1];
            }
            if(elementoBool == true){
                vereditoClausula = true;                //caso um elemento seja true, a clausula eh true
                break;
            }
        }
        if(vereditoClausula == false){                  //entra aqui caso nenhum elemento seja true na clausula
            resultado = false;                          //caso uma clausula seja false, o problema eh todo false
            break;
        }
    }
    return resultado;
}
//--------------------------------------------------------------------------------------nextAssignment-------------------------//

function nextAssignment(variaveis){  //funcao que executa a funcao recursiva de buscar nova combinacao de true/falses
    return nexAssignmentRecursivo(variaveis,variaveis.length-1);//começa no final da CADEIA DE BOOLEANS  
}
function nexAssignmentRecursivo(variaveis,posicaoAtual){
    let variaveisMod = variaveis;
    variaveisMod[posicaoAtual] = !variaveisMod[posicaoAtual];   //inverte valor atual
    if(posicaoAtual!=0){                                        //caso ==0, não existe anterior
        if(variaveisMod[posicaoAtual] == true)                  //caso tenha trocado de false->true
            return nexAssignmentRecursivo(variaveisMod, posicaoAtual-1); //necessariamente inverto o valor do anterior
    }
        return variaveisMod;
}
//--------------------------------------------------------------------------------------checkProblemSpecification-------------------------//

function checkProblemSpecification(linhaProblema,formula){//compara a linha do problema com as varaiaveis no arquivo
    if(linhaProblema == null){
        //console.log('problema nao especificado');    //caso a linha nao tenha sido encontrada
        return false;
    }
    let problema=[];//[vars,clausulas]
    let problemaStr = '';

    //cast de linhaProblema para string
    let linha = '';
    linha = linhaProblema;

    let i;
    for(i=6;i<linha.length;i++){                       //percorre toda linha, pula o "p cnf "
        if(linha.charAt(i) != ' '){                    //so adiciona se nao for ' '
            problemaStr += linha.charAt(i);
            if(linha.charAt(i+1) == ' ')               //separa numeros por 'I'
                problemaStr += 'I';
        }
    }
    problema = problemaStr.split('I',2);//[vars,clausulas]
    
    if(problema[0] == formula.variaveis.length  &&
        problema[1] == formula.clausulas.length){
            //console.log('problema condizente');
            return true;
        }
            
    else{
            //console.log('problema nao condizente')
            return false;
    }
}
//-------------------------------------------------------------------------------------------------------readFormula-------------------------//

//partesDoTexto: objeto com as clausulas em forma I0I e problema em forma de string
function readFormula(nomeArquivoCnf){
    const fileSystem = require('fs');
    let texto = fileSystem.readFileSync(nomeArquivoCnf, 'utf8');        //lendo arquivo e armazenando texto
   
    let partesDoTexto = getPartesDoTexto(texto);                        //armazenando stringClausulas e stringProblema
    
    let arrayClausulas = getClausulas(partesDoTexto.stringClausulas);   //armazenando arrayClausulas
    let arrayVariaveis = getVariaveis(partesDoTexto.stringClausulas);
    //console.log(getVariaveis(partesDoTexto.stringClausulas));         //imprime arrayVariaveis (getVariaveis)
    //console.log(arrayClausulas);                                      //imprime arrayClausulas (getClausulas)
    //console.log(partesDoTexto.stringClausulas);                       //imprime stringClausulas (getPartesDoTexto.stringClausulas)
    let objeto = {
        clausulas: arrayClausulas,
        variaveis: arrayVariaveis
    };
    globalProblema = partesDoTexto.stringProblema;                      //retorna a linha do problema por referencia
    return objeto;                                                      //retorna a formula com 2 arrays
}
//------------------------------------------------------------------------------------------------------getVariaveis--------------//
function getVariaveis(stringClausulas){
    let listaCompleta = stringClausulas.replace(/I0I/g, 'I');           //remove todos os zeros
    listaCompleta = listaCompleta.replace(/-/g, '');                    //remove sinal negativo
    let arrayGrande = listaCompleta.split('I');                         //cria array de numeros sem sinal
    arrayGrande.pop();                                                  //remove o ultimo elemento: ''
    let variaveis = [];
    let i;
    for(i=0;i<arrayGrande.length;i++){                                  //roda todo arrayGrande em busca por variaveis novas
        if(!estaContido(arrayGrande[i], variaveis) ){                   //se o elemento atual nao esta contido no array final
            variaveis.push(arrayGrande[i]);
        }
    }
    for(i=0;i<variaveis.length;i++){                                    //zerando array
        variaveis[i] = true;
    }
    return variaveis;
}
function estaContido(elemento, arrayResultante){//retorna true se encontrar elemento no array
    let estaContido = false;
    let i;
    for(i=0;i<arrayResultante.length;i++){
        if(arrayResultante[i] == elemento){
            estaContido = true;
            break;
        }
    }
    return estaContido;
}
//------------------------------------------------------------------------------------------------------getClausulas--------------//
function getClausulas(stringClausulas){
    let clausulas = [];//array com arrays de numeros string
    clausulas = stringClausulas.split('I0I');
    let i;
    for(i=0;i<clausulas.length;i++){
        clausulas[i] = clausulas[i].split('I');
    }
    clausulas.pop();//remove ultimo elemento ''
    return clausulas;
}
//------------------------------------------------------------------------------------------------------getPartesDoTexto--------------//

function getPartesDoTexto(texto){//faz tratamento do texto e retorna duas strings(uma "stringProblema" e outra "stringClausulas")
    let textoQuebraLinha = texto.split('\n');               //separação por quebra de linhas em array de strings
    let i;
    let stringProblema = null;//linha do problema
    for(i=0;i<textoQuebraLinha.length;i++){
        if(textoQuebraLinha[i] == '')                       //eliminando quebras de linha vazias
            textoQuebraLinha.splice(i,1);
        else{
            if(textoQuebraLinha[i].startsWith('p cnf', 0)){ //armazenando e eliminando linha do problema(p cnf #vars #clausulas)
                stringProblema = textoQuebraLinha[i];
                textoQuebraLinha.splice(i,1);
            }
        } 
    }
    let stringClausulas = '';//string separada
    for(i=0;i<textoQuebraLinha.length;i++){
        if(!textoQuebraLinha[i].startsWith("c",0)){         //ignora comentarios
            stringClausulas += textoQuebraLinha[i] + " ";
        }
    }
    //deleta todos os espaços e separa numero a numero com 'I'
    let stringLimpa='';
    for(i=0;i<stringClausulas.length;i++){
        if(stringClausulas.charAt(i) != " "){               //se nao for espaco
            stringLimpa += stringClausulas.charAt(i);       //adiciona a string
            if(stringClausulas.charAt(i) != '-' &&          //se nao for '-'
                stringClausulas.charAt(i+1) == ' ')         //e o proximo for ' '
                stringLimpa += "I";                         //ou seja, se for o fim de um numero, adiciona "I"
        }
    }
    let objeto ={
        stringProblema: stringProblema,
        stringClausulas: stringLimpa
    };
    return objeto;
}