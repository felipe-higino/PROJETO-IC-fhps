let projeto = require('./SATsolver.js');  //importando projeto

const readline = require('readline');            //instanciando leitura do teclado
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question('digite o arquivo teste: ', (entrada) => {   //lendo nome do arquivo
  //os .cnf teste devem estar na mesma pasta do programa!
    projeto.solve(entrada);                     //NAO PRECISA DIGITAR O ".cnf"!!!!!! 
    rl.close();
});