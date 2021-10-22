
// FUNÇAO CONOMETRO PARA EXIBIR O TEMPO DA PARTIDA. CASO ACABE O TEMPO...GAME OVER

function conometro(duracao, exibicao) {
    let tempo = duracao, minutos, segundos;
    setInterval(function () {
        minutos = parseInt(tempo / 60, 10);
        segundos = parseInt(tempo % 60, 10);
        minutos = minutos < 10 ? "0" + minutos : minutos;
        segundos = segundos < 10 ? "0" + segundos : segundos;
        exibicao.textContent = minutos + ":" + segundos;
        if (--tempo < 0) {
            tempo = duracao;
        } else if (tempo < 1){
			document.getElementById('cronometroPartida').style.display = 'none';
		}
    }, 1000);
}

// FUNÇAO CRIADA PARA VERIFICAR SE O JOGADOR CONSEGUIU RESPONDER TODAS PERGUNTAS. CASO SIM: JOGO COMPLETADO.

function gameSucess(pontuacao){
	if(pontuacao === 11){
		pontuacao = 0;
		document.getElementById('controlePerguntas').style.display = 'none';
		document.getElementById('cronometroPartida').style.display = 'none';
		document.getElementById('vidas').style.display = 'none';
		document.getElementById('canvas').style.display = 'none';
		document.getElementById('bodyGame').style.backgroundColor = '#2f6';
		document.getElementById('resultadoGame').innerText= 'Parabéns, você conseguiu!';
		document.getElementById('resultadoGame').style.display = 'unset';
		document.querySelector('#imgResultado').src = '../img/gamesucess.png';
		setTimeout(function(){
			document.location.href='game.html';
		},3000);
	}
}

// FUNÇAO PARA VERIFICAR SE O TEMPO DA PARTIDA ESGOTOU OU OS CORAÇOES ACABARAM. CASO SEJA UMA DAS DUAS SITUAÇOES: GAME OVER.

function gameOver(duracaoPartida,vidaRestante){
	if (vidaRestante < 1){
		document.getElementById('controlePerguntas').style.display = 'none';
		document.getElementById('cronometroPartida').style.display = 'none';
		document.getElementById('canvas').style.display = 'none';
		document.getElementById('bodyGame').style.backgroundColor = '#f26';
		document.getElementById('resultadoGame').innerHTML = 'Game Over!<br>Você esgotou todos os seus corações';
		document.getElementById('resultadoGame').style.display = 'unset';
		document.querySelector('#imgResultado').src = '../img/gameover.png';
		setTimeout(function(){
			document.location.href='game.html';
		},3000);
	}

	setTimeout(function(){
		document.getElementById('controlePerguntas').style.display = 'none';
		document.getElementById('cronometroPartida').style.display = 'none';
		document.getElementById('vidas').style.display = 'none';
		document.getElementById('canvas').style.display = 'none';
		document.getElementById('bodyGame').style.backgroundColor = '#f26';
		document.getElementById('resultadoGame').innerHTML = 'Game Over!<br>Você deixou o tempo esgostar.';
		document.getElementById('resultadoGame').style.display = 'unset';
		document.querySelector('#imgResultado').src = '../img/gameover.png';
		setTimeout(function(){
			document.location.href='game.html';
		},3000);
	},duracaoPartida);
}


// LABIRINTO (DIMENSOES,COR E LISTA PARA ARMAZENAR OS BLOCOS CRIADOS AO RENDERIZAR O JOGO)

let paredeLabirinto = []; /* armazena os blocos gerados ao renderizar a estrutura do libirinto */
const tamanhoBloco = 10; /* tamanho do bloco do labirinto */
const labirintoCor = '#fafafa' /* cor do bloco do labirinto */

/* funçao para criar o interaçao de bloqueio entre o personagem e as paredes do labirinto. assim o personagem nao atravessa as paredes */
function colisaoLabirinto(obj1,obj2){
	var distCentroX = (obj1.x + obj1.largura/2) - (obj2.x + obj2.largura/2);
	var distCentroY = (obj1.y + obj1.altura/2) - (obj2.y + obj2.altura/2);
	
	var somaMetadeLargura = (obj1.largura + obj2.largura)/2;
	var somaMetadeAltura = (obj1.altura + obj2.altura)/2;
	
	if(Math.abs(distCentroX) < somaMetadeLargura && Math.abs(distCentroY) < somaMetadeAltura){
		var toqueX = somaMetadeLargura - Math.abs(distCentroX);
		var toqueY = somaMetadeAltura - Math.abs(distCentroY);
		
		if(toqueX >= toqueY){ /* verifica se a colisao foi por cima ou por baixo */
			if(distCentroY > 0){ /* por cima */
				obj1.y += toqueY;
			} else { /* por baixo */
				obj1.y -= toqueY;
			}
		} else {/* verifica se colisao foi  pela esquerda ou direita */
			if(distCentroX > 0){ /* colisao pela esquerda */
				obj1.x += toqueX;
			} else { /* colisao pela direita */
				obj1.x -= toqueY;
			}
		}
		
	}
}

// PERSONAGEM E BLOCOS DE PERGUNTA ------------------------------------------------------------------------------

let vidaPersonagem = 3; /* variavel para armazena as tentativas disponiveis para responder as perguntas (coraçoes no jogo). caso o jogador erre uma pergunta, diminuira uma tentativa */
let pontuacaoPersonagem = 0; /* armazena a quanidade de respostas corretas do jogador */

let objetosInteracao = []; /* armazena os objetos que irao sofrer interaçao no decorrer do jogo (blocos de perguntas) */
let objetosExibicao = []; /* armazena os objetos que serao exibidos (blocos de perguntas e personagem) */

/* constroi os objetos que serao exibidos na tela  (blocos de perguntas e o personagem)*/
let  construtorObjetos = function(x,y,largura,altura,velocidade,cor,visivel){
	this.x = x;
	this.y = y;
	this.largura = largura;
	this.altura = altura;
	this.velocidade = velocidade;
	this.cor = cor;
	this.visivel = visivel;

	/* Retorna a metade da largura */
	construtorObjetos.prototype.metadeLargura = function(){
		return this.largura/2;
	}
	/* Retorna a metade da altura */
	construtorObjetos.prototype.metadeAltura = function(){
		return this.altura/2;
	}
	/* Retorna a posiçaoo do centro do objeto no eixo X */
	construtorObjetos.prototype.centroX = function(){
		return this.x + this.metadeLargura();
	}
	/* Retorna a posçao do centro do objeto no eixo Y */
	construtorObjetos.prototype.centroY = function(){
		return this.y + this.metadeAltura();
	}
}

/* funçao para criar a interaçao entre personagem o personagem os blocos de pergunta */
function colisaoObjetos(obj1,obj2){

	// armazenam a distancia entre os retanngulos
	let distCentroX = obj1.centroX() - obj2.centroX();
	let distCentroY = obj1.centroY() - obj2.centroY();

	// soma das metades da altura e largura dos objetos
	let somaMetadeLargura = obj1.metadeLargura() + obj2.metadeLargura();
	let somaMetadeAltura = obj1.metadeAltura() + obj2.metadeAltura();


	if(Math.abs(distCentroX) < somaMetadeLargura && Math.abs(distCentroY) < somaMetadeAltura){
		obj2.visivel = false;
	}

}


/* caracteristicas objeto personagem */
let personagem = new construtorObjetos (395,245,18,18,2,'#62f',true);
objetosExibicao.push(personagem);

/* caracteristicas objeto blocos de perguntas */

corBlocoPergunta = '#ff6600ff'

let pergunta1 = new construtorObjetos(62,42,5,5,0,corBlocoPergunta,true); //
objetosExibicao.push (pergunta1);
objetosInteracao.push (pergunta1);
let pergunta2 = new construtorObjetos(692,12,5,5,0,corBlocoPergunta,true); //
objetosExibicao.push (pergunta2);
objetosInteracao.push (pergunta2);
let pergunta3 = new construtorObjetos(300,471,5,5,0,corBlocoPergunta,true); //
objetosExibicao.push (pergunta3);
objetosInteracao.push (pergunta3);
let pergunta4 = new construtorObjetos(370,90,5,5,0,corBlocoPergunta,true); //
objetosExibicao.push (pergunta4);
objetosInteracao.push (pergunta4);
let pergunta5 = new construtorObjetos(632,250,5,5,0,corBlocoPergunta,true);//
objetosExibicao.push (pergunta5);
objetosInteracao.push (pergunta5);
let pergunta6 = new construtorObjetos(632,471,5,5,0,corBlocoPergunta,true);//
objetosExibicao.push (pergunta6);
objetosInteracao.push (pergunta6);
let pergunta7 = new construtorObjetos(410,90,5,5,0,corBlocoPergunta,true);
objetosExibicao.push (pergunta7);
objetosInteracao.push (pergunta7);
let pergunta8 = new construtorObjetos(410,205,5,5,0,corBlocoPergunta,true);
objetosExibicao.push (pergunta8);
objetosInteracao.push (pergunta8);
let pergunta9 = new construtorObjetos(73,152,5,5,0,corBlocoPergunta,true);
objetosExibicao.push (pergunta9);
objetosInteracao.push (pergunta9);
let pergunta10 = new construtorObjetos(610,90,5,5,0,corBlocoPergunta,true);
objetosExibicao.push (pergunta10);
objetosInteracao.push (pergunta10);
let pergunta11 = new construtorObjetos(632,322,5,5,0,corBlocoPergunta,true);
objetosExibicao.push (pergunta11);
objetosInteracao.push (pergunta11);

/* variaveis para mover o personagem */
const setaEsquerda = 37, setaCima = 38, setaDireita = 39, setaBaixo = 40; // teclas
let mvEsquerda = mvCima = mvDireita = mvBaixo = false; // direçoes

/* funçoes que verificam se a tecla esta sendo pressionada ou nao */

function teclaPressionada(e){
	let codigo = e.keyCode;
	switch(codigo){
		case setaEsquerda:
			mvEsquerda = true;
			break;
		case setaDireita:
			mvDireita = true;
			break;
		case setaCima:
			mvCima = true;
			break;
		case setaBaixo:
			mvBaixo = true;
			break;
	}
}

function teclaNaoPressionada(e){
	let codigo = e.keyCode;
	switch(codigo){
		case setaEsquerda:
			mvEsquerda = false;
			break;
		case setaDireita:
			mvDireita = false;
			break;
		case setaCima:
			mvCima = false;
			break;
		case setaBaixo:
			mvBaixo = false;
			break;
	}
}



// PERGUNTAS E RESPOSTAS --------------------------------------------------------------------

/* lista para armazena todas as perguntas que serao feitas ao decorrer do jogo */
let perguntas = ['Qual o músculo do coração?',
				'Qual nome se dá ao relaxamento do coração?',
				'A articulação do joelho é um exemplo de qual tipo de articulação?',
				'Qual o tipo de articulação entre os dentes?',
				'Quantos ossos tem nos membros inferiores?',
				'Qual o nome da fissura do pulmão esquerdo?',
				'Qual a fissura presente entre o lobo superior e o lobo médio do pulmão direito?',
				'Qual o músculo que faz a flexão do cotovelo?',
				'Os esfíncteres internos da bexiga, são de contração voluntária (é possível controlar) ou involuntária (não é possível controlar)?',
				'Qual o nome do músculo que, junto com o gastrocnemio, faz parte do tríceps sural?',
				'Onde está localizado o músculo mais forte do corpo humano?']

let resposta;  /* recebe a resposta de acordo com o botao (referente a alternativa) selecionado na pagina HTML */

/* funçao para verificar se a resposta esta correta ou nao */
function tentarResposta(respostaJogador){

	if (respostaJogador === resposta){
		pontuacaoPersonagem++;

		document.getElementById('controlePerguntas').style.display = 'none';
		document.getElementById('quatroAlternativas').style.display = 'none';
		document.getElementById('duasAlternativas').style.display = 'none';
		document.getElementById('canvas').style.display = 'block';
		document.getElementById('bodyGame').style.backgroundColor = '#2f6';
		setTimeout(function(){
			document.getElementById('bodyGame').style.backgroundColor = '#62f';
		},2500);
	} else {
		vidaPersonagem -- ;
		let vidas = ['vida3','vida2','vida1']
		document.getElementById(vidas[vidaPersonagem]).style.display = 'none';
		document.getElementById('bodyGame').style.backgroundColor = '#f26';
		setTimeout(function(){
			document.getElementById('bodyGame').style.backgroundColor = '#62f';
		},2500);
	}
}

// FUNÇAO PRINCIPAL 
let p = 0 /* variavel criada para selecionar as perguntas da lista acima sera usada na funçao princinpal (game()) dentro da funçao atualizar (atualiza as interaçoes e os movimentos ao decorrer do jogo)   */

function game (){

	let canvas = document.querySelector('canvas');
	let ctx = canvas.getContext('2d');

	conometro(60 * 4, document.querySelector('#cronometroPartida')); /* funçao conometro chamamada para marcar o tempo de 3 min na tela */
	
	// LABIRINTO

	/* matriz criada para desenhar a estrutura do labirinto. onde for '1' sera a posiçao do bloco no mapa */	
	let labirinto = [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],
		[1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,1,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,1,1,1,1,1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,1,1,1,0,0,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1],
		[1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	];

	// FUNÇAO PARA EXIBIR OS OBJETOS NO MAPA
	function renderizacao(){
		ctx.clearRect(0,0,800,500);

		/* exibe a estrutura do labirinto */
		for(let linha in labirinto){
			for(let coluna in labirinto[linha]){
				let parede = labirinto[linha][coluna];
				if(parede === 1){
					let x = coluna * tamanhoBloco;
					let y = linha * tamanhoBloco;
					ctx.beginPath();
					ctx.fillStyle = labirintoCor;
					ctx.fillRect(x,y,tamanhoBloco,tamanhoBloco);	
				}
			}
		}
		
		/* exbibe os objetos que irao interagir entre si (personagem e os blocos de perguntas) */
		for (let i in objetosExibicao){
			let obj = objetosExibicao[i];
			if (obj.visivel){
				ctx.beginPath();
				ctx.fillStyle = obj.cor;
				ctx.fillRect(obj.x,obj.y,obj.largura,obj.altura,obj.velocidade);
			}	
		}
	}

	/* apos os blocos do labirinto serem criados no loop acima, eles sao armazenados com suas dimensoes e posiçao na lista 'paredeLabirinto' declarada anteriormente */
	for(let linha in labirinto){
		for(let coluna in labirinto[linha]){
			let parede = labirinto[linha][coluna];
			if(parede === 1){
				let bloco = {
					x: tamanhoBloco*coluna,
					y: tamanhoBloco*linha,
					largura: tamanhoBloco,
					altura: tamanhoBloco
				};
				/* inserçao do bloco com todas as dimensoes, na lista 'parede labirinto' */
				paredeLabirinto.push(bloco);
			}
		}
	}

	/* entradas das setas do teclado para movimentar o personagem */
	window.addEventListener("keydown",teclaPressionada,false);
	window.addEventListener("keyup",teclaNaoPressionada,false);

	// FUNÇAO PARA ATUALIZAR OS OBJETOS NO MAPA
	function atualizar(){
		/* movimento do personagem */
		if(mvEsquerda && !mvDireita){
			personagem.x -= personagem.velocidade;
		} else 
		if(mvDireita && !mvEsquerda){
			personagem.x += personagem.velocidade;
		}
		if(mvCima && !mvBaixo){
			personagem.y -= personagem.velocidade;
		} else 
		if(mvBaixo && !mvCima){
			personagem.y += personagem.velocidade;
		}

		/* ao movimentar o personagem a posicao dele ira sendo atualizada, dai o loop abaixo percorre a lista com todos os blocos do labirintos e chama a funçao 'colisaoLabirinto' para que haja a interaçao, nao perminto que o personagem nao ultrapsse a parede*/
		for(let l in paredeLabirinto){
			var blocoL = paredeLabirinto[l];
			colisaoLabirinto(personagem,blocoL);
		}

		/* o loop abaixo tem a mesma funcionalidade do anterior. a diferença e que ele pega os blocos de perguntas e verifica se e visivel ou nao. se for visivel a interaçao com o personagem acontecera e a pergunta sera exibida na tela. */
		for (let i in objetosInteracao){
			let blocoI = objetosInteracao[i];
			if(blocoI.visivel){

				colisaoObjetos(personagem,blocoI);
				if (!blocoI.visivel){

					document.getElementById('controlePerguntas').style.display = 'flex';
					document.getElementById('canvas').style.display = 'none';
					
					document.getElementById('perguntas').innerHTML = perguntas[p]; /* insere a pergunta da vez, para que possa ser exibida na tela. a cada pergunta respondida sera acrescido +1 na variavel 'p' para que no proximo bloco de perguntas coletado, 
					apareça a pergunta seguinte da lista 'perguntas' */


					// funçoes para inserir as altenativas nos botoes para que o usuario possa clicar para responder. ao clicar a funçao 'tentarResposta()' (declara no inicio deste codigo) recebe o valor do botao clicado, que no caso e a resposta do jogador,
					//e compara com a resposta correta da pergunta (que e armazena na variavel 'resposta'. a cada pergunta exibida, essa variavel recebe a resposta refente a pergunta da vez.)
					
					/* funçao para inserir duas alternativas */
					function duasAlternativas(alt1,alt2){
						let botoes = ['a1','a2']
						let alternativas = [alt1,alt2];

						document.getElementById('duasAlternativas').style.display = 'block';
							for(i in alternativas){
								document.getElementById(botoes[i]).value = alternativas[i];
							}						
					}
					
					/* funçao para inserir quatro alternativas */
					function quatroAlternativas(alt1,alt2,alt3,alt4){
						let botoes = ['a01','a02','a03','a04']
						let alternativas = [alt1,alt2,alt3,alt4];

							document.getElementById('quatroAlternativas').style.display = 'block';
							for(i in alternativas){
								document.getElementById(botoes[i]).value = alternativas[i];
							}

					}

					/* condicional que ira vericar a pergunta que esta sendo exibida. como explicado acima: de acordo com a pergunta exibida, sera usadas  funçoes 'quatroAlternativas' ou 'duasAlternativas' para exibir as alternativas da pergunta e a
					varia 'resposta' ira receber a resposta correta da pergunta, para ser comparada com a resposta escolhida pelo jogador*/
					switch(perguntas[p]){
						case 'Qual o músculo do coração?':

							quatroAlternativas('Endocárdio','Pericárdio','Miocárdio','Tríceps');
							resposta = 'Miocárdio';
							break;

						case 'Qual nome se dá ao relaxamento do coração?':

							quatroAlternativas('Diástole','Concêntricos','Excêntricos','Sístole');
							resposta = 'Diástole';
							break;
							
						case 'A articulação do joelho é um exemplo de qual tipo de articulação?':

							quatroAlternativas('Fibrocartilaginosa','Sinovial','Cartilaginosa','Fibrosa');
							resposta = 'Sinovial';
							break;

						case 'Qual o tipo de articulação entre os dentes?':

							quatroAlternativas('Gonfose','Sinovial','Sincondrose','Sindesmose');
							resposta = 'Gonfose';
							break;

						case 'Quantos ossos tem nos membros inferiores?':
							
							quatroAlternativas('61','64','63','62');
							resposta = '62';
							break;

						case 'Qual o nome da fissura do pulmão esquerdo?':

							duasAlternativas('Fissura Horizontal','Fissura Oblíqua');
							resposta = 'Fissura Oblíqua';
							break;

						case  'Qual a fissura presente entre o lobo superior e o lobo médio do pulmão direito?':

							duasAlternativas('Fissura Oblíqua','Fissura Horizontal');
							resposta = 'Fissura Horizontal' 
							break;

						case 'Qual o músculo que faz a flexão do cotovelo?':

							quatroAlternativas('Bíceps Braquial','Tríceps Braquial','Braquial','Coracobraquial');
							resposta = 'Braquial';
							break;
							
						case 'Os esfíncteres internos da bexiga, são de contração voluntária (é possível controlar) ou involuntária (não é possível controlar)?':

							duasAlternativas('Voluntária','Involuntária');
							resposta = 'Involuntária';
							break;

						case 'Qual o nome do músculo que, junto com o gastrocnemio, faz parte do tríceps sural?':

							quatroAlternativas('Sóleo','Quadríceps','Vasto Medial','Tibial Anterior');
							resposta = 'Sóleo';
							break;
							
						case 'Onde está localizado o músculo mais forte do corpo humano?':

							quatroAlternativas('Na parte anterior da coxa','Nas laterais das mandíbulas','Na parte posterior do braço','Na parte medial do antibraço');
							resposta = 'Nas laterais das mandíbulas';
							break;
					}

					p++;
					break;
				}
			}
		}
	}

	/* ao ser chamada a funçao 'game()' esta funçao 'executa()' sera responsaovel por ficar excutando as funçoes responveis por da vida ao jogo*/
	function executa(){ 
		atualizar();
		renderizacao();
		gameSucess(pontuacaoPersonagem);
		gameOver(62000 * 4,vidaPersonagem);
		requestAnimationFrame(executa,canvas);
	}
	
	requestAnimationFrame(executa,canvas);
	
}

// aqui criei uma condiçao para que garanta que a tecla responsavel por executar o jogo seja usada apenas uma vez. para nao ocorrer de apertar a tecla 'i' (que e a responsavel por executar o jogo) novamente e o jogo ser reiniciado.

let i = 73; /* variavel que inicialmente recebe o valor do codigo da tecla 'i' que 73 */

window.addEventListener("keydown",start,false); /* recebe o valor da tecla pressionada pelo jogador  e insere na funçao 'start()' para que seja comparado com o valor do codigo da tecla 'i' */

function start(e) {
	/* se a tecla pressionada for 'i' a condicional sera verdadeira e o jogo sera executado. antes que o jogo seja executado todos os elementos da pagina inicial do jogo serao ocutados.*/
	if (e.keyCode == i) {

		i = 0000; /* a variavel 'i' recebe um valor nulo para nao haver mais entrada do usuario para executar o jogo. */

		/* os elementos sao ocutados */
		document.getElementById('canvas').style.display = 'unset';
		document.getElementById('vidas').style.display = 'unset';
		document.getElementById('cabecalhoGame').style.display = 'none';
		document.getElementById('conteudoTela').style.height = 'auto';
		document.getElementById('preJogo').style.display = 'none';

		game(); /* o jogo e executado */ 
		
	}
}